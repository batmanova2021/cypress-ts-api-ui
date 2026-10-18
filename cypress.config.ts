import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'cypress';
import { afterRunHook, beforeRunHook } from 'cypress-mochawesome-reporter/lib';
import { writeRunSummary } from './cypress/node/reporting';

export default defineConfig({
  projectId: 'iwa573',
  retries: { runMode: process.env.CI ? 1 : 0, openMode: 0 },
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'cypress-mochawesome-reporter, mocha-junit-reporter',
    cypressMochawesomeReporterReporterOptions: {
      reportDir: 'cypress/reports/html',
      reportFilename: 'index',
      reportPageTitle: 'Cypress API and UI results',
      charts: true,
      embeddedScreenshots: true,
      inlineAssets: true,
      saveAllAttempts: true,
    },
    mochaJunitReporterReporterOptions: {
      mochaFile: 'cypress/reports/junit/results-[hash].xml',
      testsuitesTitle: 'Cypress API and UI tests',
      useFullSuiteTitle: true,
    },
  },
  e2e: {
    baseUrl: 'https://automationexercise.com',
    specPattern: 'cypress/e2e/{api,ui}/**/*.cy.ts',
    setupNodeEvents(on, config) {
      const reportDir = join(config.projectRoot, 'cypress', 'reports');
      on('before:run', async (details) => {
        // Every run owns a fresh artifact directory; do not mix old and new results.
        rmSync(reportDir, { recursive: true, force: true });
        await beforeRunHook(details);
      });
      on('after:run', async (results) => {
        // Persist failure evidence even if HTML generation itself fails.
        writeRunSummary(results, reportDir);
        if ('runs' in results && results.runs.length > 0) await afterRunHook();
      });
      return config;
    },
  },
});
