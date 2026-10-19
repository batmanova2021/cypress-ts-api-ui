# Cypress TypeScript API and UI framework

[![Cypress CI](https://github.com/batmanova2021/cypress-ts-api-ui/actions/workflows/cypress.yml/badge.svg?branch=master)](https://github.com/batmanova2021/cypress-ts-api-ui/actions/workflows/cypress.yml)

Cypress + TypeScript API/UI test framework for [Automation Exercise](https://automationexercise.com/),
with JSON Schema validation, Chrome/Firefox smoke tests, weekly regression,
and HTML/JUnit reports. Tests use isolated account data and reusable typed helpers.

Chrome runs 27 tests: five smoke tests and twenty-two additional regression tests.
Five tests check schema guards with in-memory samples; twenty-two exercise the live site.
Firefox runs the three UI smoke tests.

**[View public Cypress Cloud results](https://cloud.cypress.io/projects/iwa573/runs/1/overview)**
— explore an example recorded run, test outcomes, and available debugging artifacts.

## Setup

Use Node.js 24, npm, Google Chrome, and internet access to the demo site.

```sh
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run cy:smoke
```

Chrome must be installed for the default run scripts. Install Firefox to use the
Firefox smoke scripts; CI installs Firefox automatically. To use another supported,
installed browser, append `-- --browser firefox` or `-- --browser electron`.
`cy:open` lets you select an installed browser interactively.

If Firefox reports `Could not find profile folder` or fails to connect before
any tests execute, check the local Firefox installation/profile first. This was
observed on the development Mac even with a disposable profile. The Firefox CI
job installs its own browser on Ubuntu and does not skip tests on launch failure.

## Commands

| Command                           | Purpose                                                   |
| --------------------------------- | --------------------------------------------------------- |
| `npm run format`                  | Format source, configuration, fixtures, and documentation |
| `npm run format:check`            | Check formatting without changes                          |
| `npm run lint`                    | Check ESLint rules with zero warnings allowed             |
| `npm run lint:fix`                | Apply available lint fixes                                |
| `npm run typecheck`               | Check strict TypeScript, unused code, and return paths    |
| `npm run cy:open`                 | Interactive runner                                        |
| `npm run cy:smoke`                | Five smoke tests in headless Chrome                       |
| `npm run cy:smoke:headed`         | Smoke tests with visible Chrome                           |
| `npm run cy:smoke:firefox`        | Three UI smoke tests in headless Firefox                  |
| `npm run cy:smoke:firefox:headed` | Three UI smoke tests with visible Firefox                 |
| `npm run cy:regression`           | All 27 tests in headless Chrome, including smoke          |
| `npm run cy:regression:headed`    | All tests with visible Chrome                             |
| `npm run cy:run:api`              | All API tests in headless Chrome                          |
| `npm run cy:run:ui`               | All UI tests in headless Chrome                           |
| `npm run cy:run:chrome`           | All tests in headless Chrome                              |

To focus a local run, append `-- --spec cypress/e2e/ui/regression/cart.cy.ts` to
`cy:regression`. Committed `.only`, `.skip`, disabled Mocha aliases, and pending
tests are lint errors. A failing command exits unsuccessfully; CI does not hide failures.

## Reports and debugging

Every `cypress run` creates fresh reports, replacing the previous run's report directory:

- `cypress/reports/html/index.html`: open in a browser for the combined HTML report.
- `cypress/reports/junit/results-*.xml`: JUnit results, one file per spec.
- `cypress/reports/summary.md`: totals, failed specs/tests, errors, and tests recovered on retry.
- `cypress/screenshots/`: screenshots on test failures, embedded in the HTML report.
- `cypress/videos/`: recorded when `CYPRESS_VIDEO=true`, including Chrome CI runs.
  Firefox smoke CI keeps screenshots and reports, with video disabled.

The HTML report has inline page assets; download the complete artifact to retain
its linked videos. Reports and artifacts are ignored by Git, ESLint, and Prettier.
Startup failures may prevent reports; in that case, check the command or CI step logs.
Avoid simultaneous runs from the same checkout because each run owns the artifact paths.

Local test retries are disabled. CI allows one retry and reports recovered tests
separately in the summary so instability remains visible. An unrecovered failure
fails the job. Investigate the failed attempt before treating a retry as resolution.

## GitHub Actions

The workflow uses Ubuntu 24.04 and Node.js 24. Independent Chrome and Firefox
jobs run after quality checks; a failure in one does not cancel the other:

| Trigger              | Chrome suite                                 | Firefox suite | Cloud recording |
| -------------------- | -------------------------------------------- | ------------- | --------------- |
| Push or pull request | Smoke (API + UI)                             | UI smoke      | Off             |
| Monday at 07:00 UTC  | Full regression including smoke              | UI smoke      | Chrome only     |
| Manual dispatch      | Regression by default; smoke can be selected | UI smoke      | Off             |

Tests wait for the quality job. GitHub schedules run from the default branch and
may start later than their scheduled time. Each run publishes a Markdown job
summary and uploads separate browser artifacts with HTML/JUnit reports, screenshots,
and Chrome videos for fourteen days,
including after test failures. Download the artifact from the run's Actions page
and open `reports/html/index.html` inside it.
Dependency and Cypress caches speed up installation; `npm ci` uses the lockfile.

Weekly scheduled Chrome regression runs record to Cypress Cloud using the repository
secret `CYPRESS_RECORD_KEY`. Push, pull-request, and manual workflow runs do not
record and do not receive the key. Firefox never records or receives the key.
Scheduled recording requires a valid secret;
a missing or invalid key fails the recorded run instead of silently disabling it.
Workflow changes must reach the default branch before the schedule uses them.

## Merge requirements

The branch-protection policy requires `Format, lint, and TypeScript`,
`chrome tests`, and `firefox tests`, an up-to-date branch, and a pull request.
The repository owner has applied the policy with `npm run repo:protect`.
See [activation and verification](docs/required-ci-checks.md) for maintenance instructions.
The workflow passing alone does not enforce merge protection.

## Execution evidence

- [Successful Chrome and Firefox smoke CI](https://github.com/batmanova2021/cypress-ts-api-ui/actions/runs/39178515125)
  — verified successful on commit `08fcb53`.
- [Full regression workflow history](https://github.com/batmanova2021/cypress-ts-api-ui/actions/workflows/cypress.yml?query=event%3Aworkflow_dispatch)
  — pending a successful manual run with the default `regression` suite.
- [Scheduled workflow history](https://github.com/batmanova2021/cypress-ts-api-ui/actions/workflows/cypress.yml?query=event%3Aschedule)
  — pending the first successful Monday run; Chrome records to Cloud.
- [Public Cloud history](https://cloud.cypress.io/projects/iwa573/runs)
  — match a recording to the scheduled GitHub run before treating it as scheduled-run evidence.

No manual or scheduled CI runs existed when these links were checked. The CI badge
shows workflow status and does not prove that full regression or recording succeeded.
To produce full-regression evidence, open Actions → Cypress CI → Run workflow,
select `master` and `regression`, then link the successful run here. After Monday's
scheduled run succeeds, add its Actions URL and corresponding Cloud recording URL.

## Public Cypress Cloud results

This framework is linked to the public Cypress Cloud project **`iwa573`**.
Reviewers can inspect recorded test results through these links:

- [Example recorded run](https://cloud.cypress.io/projects/iwa573/runs/1/overview)
- [Project run history](https://cloud.cypress.io/projects/iwa573/runs)

Open the example run to review test outcomes, durations, and the screenshots,
videos, or Test Replay data available for that recording. Only runs explicitly
recorded to Cloud appear there. Weekly scheduled Chrome runs are recorded automatically;
ordinary local runs and push/PR/manual workflow runs remain unrecorded. Every test
run still produces the HTML/JUnit reports described above.

The project ID is stored in `cypress.config.ts` and is safe to commit. The record
key is private and must never be committed. Maintainers with recording access can
set `CYPRESS_RECORD_KEY` in their environment and record a full run with:

```sh
npm run cy:regression -- --record
```

Automated recording is scheduled for **Mondays at 07:00 UTC** (03:00 in New York
during daylight saving time, 02:00 during standard time). GitHub may delay scheduled
runs. With the current 27 Chrome tests, four or five weekly runs record approximately
108–135 test results per month; extra recorded runs also count toward usage.

The workflow's **Run workflow** button runs tests on demand without Cloud recording.
Maintainers can record an additional local run using the command above, which
requires the key in their local environment. The GitHub repository secret is not
automatically available locally. Viewing public results does not require the key.

## Test data and configuration

`cypress/fixtures/user.json` supplies synthetic account fields. `createUser` adds
a unique email, creates the account through the API, and yields a typed user.
Authentication specs delete their owned account in `afterEach`, including after
assertion failures. The UI registration spec creates its account through the UI
and deletes it through the API; the API deletion test verifies former credentials fail.

`cypress/fixtures/regression.json` contains search terms, an incorrect password,
updated account values, and cart quantity. Use `loadFixture` for typed fixture
access; committed JSON is also checked against the TypeScript fixture models.
No shared accounts or real credentials are needed. A terminated process or an
outage can prevent cleanup; use the account deletion API with that generated
account's credentials if recovery is needed.

Override the target using Cypress's standard `CYPRESS_BASE_URL` environment
variable. The public API may return JSON as text and reports application outcomes
through `responseCode`. `validateApiBody` parses responses and validates their
JSON Schema with Ajv before yielding a typed value. Schemas cover message responses,
product lists/search (including nested category and brand), and account details.
Required contract fields, scalar types, price format, and email format are checked.
Additive fields are allowed; missing fields and invalid values fail with schema paths.
Values are not coerced, filled in, or removed. Existing HTTP and business assertions
remain in the specs. The login verification API does not establish a browser session.

## Code quality and architecture

Prettier uses two-space indentation, single quotes, semicolons, and a 100-column
target. `eslint-config-prettier` avoids conflicting lint formatting rules. ESLint
checks TypeScript/Cypress usage and prevents focused or skipped committed tests.
TypeScript stays on the supported 6.0 minor series for ESLint parser compatibility.

For formatting on save, install the Prettier VS Code extension, choose it as the
default formatter, and enable Format On Save.

See [architecture](docs/architecture.md) for module responsibilities and
[test strategy](docs/test-strategy.md) for coverage, limitations, and triage.
