# Test strategy

## Goal and suite boundaries

Protect the core shopping and account flows with fast smoke feedback, then cover
validation and state changes in the full regression suite. Regression includes
smoke instead of duplicating its scenarios. API tests diagnose service behavior;
UI tests verify what users can do and see.

| Suite          | Scenarios                                                                                                                                                       | Count |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| API smoke      | Product catalog contract; valid credentials for a newly created account                                                                                         | 2     |
| UI smoke       | Catalog rendering; successful login; add product and verify cart details                                                                                        | 3     |
| API regression | Search match/no match; missing search field; unsupported method; incorrect password; missing email; persisted updates; deleted-account login rejection          | 8     |
| UI regression  | Invalid login; logout persistence; duplicate registration; successful registration; search match/no match; product details; quantity/total; removal persistence | 9     |

Full regression: 22 tests. Smoke: 5 tests. Counts refer to logical tests before
retries. Smoke runs on pushes and PRs; full regression runs weekly and on demand.
Run full regression locally before merging changes that affect framework setup,
authentication, data lifecycle, or shared UI helpers.

## Design principles

- Each test owns its data and can run alone. No suite relies on another test's output.
- Use API setup for prerequisites; exercise the UI when that interaction is the behavior under test.
- Query stable attributes where available. This external app also requires scoped CSS and visible text.
- Use retryable Cypress assertions and request aliases, never fixed sleeps.
- Preserve real service responses in these end-to-end scenarios. Future stubbed error-path tests must be labeled separately.
- Verify persisted outcomes: account updates through readback, deletion through login rejection, logout/removal after reload.
- Check application `responseCode` as well as HTTP status; this demo returns HTTP 200 for several application errors.
- Keep assertions in specs. Helpers share mechanics without hiding scenario outcomes.

## Quality gates and acceptance

Formatting, linting, and TypeScript must pass before CI starts browser tests.
Lint rejects `.only`, `.skip`, disabled Mocha aliases, and tests without bodies.
Compiler checks include strict mode, unused locals/parameters, and implicit returns.

The selected suite must finish with no unrecovered failures. CI permits one
retry; passed-after-retry tests are surfaced as instability to investigate. Local
runs have no retries. Do not use retries or broad exception suppression to hide
defects. Pending/skipped tests are reported and should be investigated even though
Cypress itself may not treat runtime skips as failures.

## Failure investigation

1. Read the GitHub job summary for failed specs, errors, and recovered tests.
2. Download the artifact and open `reports/html/index.html`; inspect screenshots and videos.
3. For startup or reporter failures, read the step log; the workflow provides a fallback summary when results are unavailable.
4. Reproduce in the same browser with the affected spec, then use headed mode or `cy:open`.
5. Classify the issue as an application defect, test defect, environment outage, or data/cleanup failure; document evidence before changing assertions.

JUnit XML supports downstream result consumers without posting PR comments or
requiring extra token permissions. Artifacts are retained for fourteen days.

## Limits and next coverage

This is a public demo, not a controlled application. Availability, advertisements,
product changes, and network latency can affect results. Interrupted processes
can leave synthetic accounts behind. A local controllable app would enable reliable
reset endpoints, deeper authorization checks, and deterministic fault injection.

Chrome is the only automated browser target; Firefox/WebKit coverage is not claimed.
The suite does not cover payment completion, performance, accessibility, visual
regression, or full runtime API schema validation. Add these based on requirements
and risk, not simply to increase test count. Weekly regression records to Cypress
Cloud; push, PR, and manual workflow runs remain unrecorded. The README links to
public results. Monitor recorded usage as the suite grows.
