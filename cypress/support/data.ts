import userJson from '../fixtures/user.json';
import regressionJson from '../fixtures/regression.json';
import type { RegressionData, TestUser, UserTemplate } from './types';

// These assignments also check the committed JSON fixture shapes during typecheck.
export const fixtureData: { user: UserTemplate; regression: RegressionData } = {
  user: userJson,
  regression: regressionJson,
};

export function loadFixture<K extends keyof typeof fixtureData>(
  name: K,
): Cypress.Chainable<(typeof fixtureData)[K]> {
  return cy.fixture<(typeof fixtureData)[K]>(name);
}

export function buildTestUser(template: UserTemplate): TestUser {
  return {
    ...template,
    email: `test-${Date.now()}-${Cypress._.random(0, 1e9)}@example.com`,
  };
}
