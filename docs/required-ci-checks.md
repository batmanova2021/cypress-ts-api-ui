# Required checks before merging

The default branch is `master`. The policy requires a pull request,
an up-to-date branch, and these checks from the GitHub Actions app:

- `Format, lint, and TypeScript`
- `chrome tests`
- `firefox tests`

Administrator bypass is disabled. External review approval is not required for
this individual portfolio repository; passing checks and the PR workflow are required.
This is a repository setting, not something a YAML workflow can enforce on its own.

## Activate the policy

The repository owner confirmed successful activation with `npm run repo:protect`.
The steps below allow an administrator to verify or reproduce the configuration.

1. Sign in to GitHub CLI as an administrator for `batmanova2021/cypress-ts-api-ui`:

   ```sh
   gh auth login --hostname github.com --git-protocol https --web
   gh auth status
   ```

2. Preview the exact policy, then apply it:

   ```sh
   npm run repo:protect -- --dry-run
   npm run repo:protect
   ```

The script checks admin access before making changes, enables the initial policy
only on an unprotected branch, and verifies the response. If protections already
exist, it verifies them without changing them; a different policy must be reviewed
in GitHub settings. A fine-grained token, if used, needs repository Administration
write permission in addition to the account's own administrator access.

Alternatively, open [branch settings](https://github.com/batmanova2021/cypress-ts-api-ui/settings/branches),
create a protection rule for `master`, require a pull request, enable required
status checks, select the three check names above, require branches to be up to date,
and enable the option that applies the rules to administrators/bypasses as well.

## Verify

```sh
gh api repos/batmanova2021/cypress-ts-api-ui/branches/master/protection
```

Confirm the three check names, `required_status_checks.strict: true`, and
`enforce_admins.enabled: true`. New work should use a feature branch and pull request.
Do not disable required checks to publish follow-up changes.
