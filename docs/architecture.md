# Framework architecture

## Responsibilities

```text
cypress/
  e2e/
    api/{smoke,regression}/   API contracts and account lifecycle scenarios
    ui/{smoke,regression}/    Browser scenarios and visible outcome assertions
  fixtures/                  Synthetic, static input templates
  support/
    types.ts                 Explicit account, fixture, product, and API models
    data.ts                  Typed fixture loading and unique account generation
    api.ts                   JSON/text API response parsing
    commands.ts              Reusable account API operations and UI login
    ui.ts                    Stateless product/cart interactions and selectors
    e2e.ts                   Command and browser-reporter registration
  node/reporting.ts          Node-only run summary generation
  types/reporters.d.ts       Missing third-party Node-hook declarations
```

The root Cypress configuration owns the target, spec discovery, CI retry policy,
reporters, and run hooks. Node reporting code stays outside browser support code.
ESLint, Prettier, and TypeScript run before CI test execution.

## Data flow and isolation

A spec requests a typed fixture, generates a unique email, and creates its own
account with `cy.createUser()`. It retains the yielded account for that test and
cleans it up in `afterEach`. Every test starts with Cypress's browser isolation.
UI registration deliberately exercises the form instead of using API setup.

The login API only verifies credentials, so it cannot replace UI authentication.
`cy.login` accepts credentials and submits the login form. Assertions about login
success or rejection remain in each spec. Authenticated-session caching is not
introduced because these small suites deliberately test authentication behavior.

TypeScript interfaces and JSON fixture checks detect authoring mistakes. API
responses are parsed from `unknown`; these types are not runtime schema validation.
Specs check the fields and outcomes relevant to each contract.

## Reuse without shared page state

Small functions centralize repeated product navigation, search, price parsing,
and opening the cart. A selector map centralizes common catalog/cart locators.
Helpers issue fresh Cypress queries and return chainables; they do not retain DOM
nodes or user state. Assertions about business behavior stay visible in specs.

Custom commands are reserved for reusable framework operations. Pure helpers
remain ordinary imports. There is no page-object inheritance or fixture injection
layer to maintain. Add a helper when an operation is repeated or has a clear
single responsibility, rather than wrapping every Cypress command.

## Reports and CI

The multi-reporter produces console output, Mochawesome HTML data, and per-spec
JUnit XML. Before each run, the framework clears its generated report directory.
After the run, it writes a summary and builds a combined HTML report. The browser
reporter attaches failure screenshots; CI also records videos. The Markdown
summary calls out final failures and tests that passed after a failed attempt.

Push/PR runs select smoke folders. Weekly and default manual runs select all API
and UI specs, including smoke. There is one Chrome test job after a separate
quality job. Tests run serially. A public Cloud project is linked, but automated
Cloud recording and orchestration are not enabled in the workflow.
