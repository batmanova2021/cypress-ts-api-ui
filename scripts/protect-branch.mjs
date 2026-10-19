import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const repository = 'batmanova2021/cypress-ts-api-ui';
const branch = 'master';
const payloadPath = fileURLToPath(new URL('../.github/branch-protection.json', import.meta.url));
const policy = JSON.parse(readFileSync(payloadPath, 'utf8'));

function gh(...args) {
  const result = spawnSync('gh', args, { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'GitHub CLI failed.');
  return JSON.parse(result.stdout);
}

function verifyPolicy(protection) {
  const required = policy.required_status_checks.checks;
  const actual = protection.required_status_checks;
  if (
    !actual?.strict ||
    !protection.enforce_admins?.enabled ||
    protection.required_pull_request_reviews === null ||
    !protection.required_pull_request_reviews ||
    !required.every((expected) =>
      actual.checks?.some(
        (check) => check.context === expected.context && check.app_id === expected.app_id,
      ),
    )
  ) {
    throw new Error(
      'The expected branch protections were not verified. Review repository settings.',
    );
  }
}

function main() {
  if (process.argv.includes('--dry-run')) {
    console.log(`Initial protection policy for ${repository}:${branch}:`);
    console.log(JSON.stringify(policy, null, 2));
    return;
  }

  const repo = gh('api', `repos/${repository}`);
  if (!repo.permissions?.admin) {
    throw new Error(
      `Sign in with a GitHub account that has administrator access to ${repository}.`,
    );
  }
  const endpoint = `repos/${repository}/branches/${branch}/protection`;
  const currentBranch = gh('api', `repos/${repository}/branches/${branch}`);
  if (currentBranch.protected) {
    // Never overwrite an existing policy or weaken its approvals/restrictions.
    verifyPolicy(gh('api', endpoint));
    console.log('The required protections are already enabled; no changes made.');
    return;
  }

  verifyPolicy(gh('api', '--method', 'PUT', endpoint, '--input', payloadPath));
  console.log(`Required CI checks enabled for ${repository}:${branch}.`);
  console.log(
    'Use feature branches and pull requests; direct pushes are protected, including for administrators.',
  );
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
