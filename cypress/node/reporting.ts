import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { stripVTControlCharacters } from 'node:util';

function escapeMarkdown(value: string): string {
  return stripVTControlCharacters(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('|', '&#124;')
    .replaceAll('`', '&#96;')
    .replaceAll('\r', '')
    .replaceAll('\n', '<br>');
}

export function buildRunSummary(
  results: CypressCommandLine.CypressRunResult | CypressCommandLine.CypressFailedRunResult,
): string {
  if ('failures' in results) {
    return `## Cypress could not complete the run\n\n${escapeMarkdown(results.message)}\n`;
  }

  const flaky = results.runs.flatMap((run) =>
    run.tests
      .filter((test) => test.state === 'passed' && test.attempts.some((a) => a.state === 'failed'))
      .map((test) => `${run.spec.relative}: ${test.title.join(' > ')}`),
  );
  const lines = [
    '## Cypress test results',
    '',
    `Browser: ${escapeMarkdown(results.browserName)} ${escapeMarkdown(results.browserVersion)}`,
    '',
    '| Tests | Passed | Failed | Pending | Skipped | Recovered on retry | Duration |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    `| ${results.totalTests} | ${results.totalPassed} | ${results.totalFailed} | ${results.totalPending} | ${results.totalSkipped} | ${flaky.length} | ${(results.totalDuration / 1000).toFixed(1)}s |`,
    '',
    'Download the run artifact for `reports/html/index.html`, JUnit XML, screenshots, and videos.',
    '',
  ];

  for (const run of results.runs) {
    const failed = run.tests.filter((test) => test.state === 'failed');
    if (run.error || failed.length > 0) {
      lines.push(`### ${escapeMarkdown(run.spec.relative)}`, '');
      if (run.error) lines.push(escapeMarkdown(run.error), '');
      for (const test of failed) {
        lines.push(
          `- **${escapeMarkdown(test.title.join(' > '))}**`,
          `  ${escapeMarkdown(test.displayError ?? 'No error details available.')}`,
          '',
        );
      }
    }
  }
  if (flaky.length > 0) {
    lines.push('### Passed after retry — investigate instability', '');
    lines.push(...flaky.map((name) => `- ${escapeMarkdown(name)}`), '');
  }
  return `${lines.join('\n')}\n`;
}

export function writeRunSummary(
  results: CypressCommandLine.CypressRunResult | CypressCommandLine.CypressFailedRunResult,
  reportDir: string,
): void {
  mkdirSync(reportDir, { recursive: true });
  writeFileSync(join(reportDir, 'summary.md'), buildRunSummary(results));
}
