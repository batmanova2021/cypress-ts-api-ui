# Framework architecture

## Responsibilities

```text
cypress/
  e2e/
    api/{smoke,regression}/   API contracts and account lifecycle scenarios
    ui/{smoke,regression}/    Browser scenarios and visible outcome assertions
  fixtures/                  Synthetic, static input templates
  schemas/api.ts             Typed JSON Schemas for message, product, and user responses
  support/
    types.ts                 Explicit account, fixture, product, and API models
    data.ts                  Typed fixture loading and unique account generation
    api.ts                   JSON/text parsing and cached Ajv schema validation
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
responses enter as `unknown`. `validateApiBody` parses JSON text when necessary,
then applies a cached Ajv validator before returning a typed value. JSON Schema
objects are checked against their TypeScript models with `JSONSchemaType`.

Message responses require a numeric application code and a nonempty message.
Products require identity, name, price, brand, and nested category/usertype fields.
Account details require ID, name, email, and city. Additive fields are tolerated;
required-field and type changes fail. Validation never coerces, defaults, or strips
values. Errors identify schema paths without dumping response bodies or credentials.
Specs retain their HTTP status and business-outcome assertions.

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

Chrome push/PR runs select smoke folders. Chrome weekly and default manual runs
select all API/UI specs. A second matrix job runs only the same three UI smoke
tests in Firefox on every trigger; API tests are not repeated in Firefox. The
matrix uses `fail-fast: false`, and browser artifacts have distinct names.

Both jobs depend on quality checks. Tests are serial within each browser job.
Only weekly Chrome regression records to the public Cloud project using the
`CYPRESS_RECORD_KEY` secret. All other runs, including Firefox, neither record nor
receive the key. Firefox is explicitly installed in CI and does not record video.
Cloud parallelization is not enabled.
