import { loadFixture } from '../../../support/data';
import type { TestUser } from '../../../support/types';

describe('UI regression: account validation and logout', () => {
  let user: TestUser | undefined;

  beforeEach(() => {
    user = undefined;
    cy.createUser().then((created) => {
      user = created;
    });
  });

  afterEach(() => {
    if (user) cy.deleteUser(user);
  });

  it('shows an error for an incorrect password', () => {
    loadFixture('regression').then(({ incorrectPassword }) => {
      cy.login({ ...user!, password: incorrectPassword });
    });
    cy.contains('Your email or password is incorrect!').should('be.visible');
    cy.location('pathname').should('eq', '/login');
    cy.get('a[href="/logout"]').should('not.exist');
  });

  it('logs out and remains signed out after reload', () => {
    cy.then(() => cy.login(user!));
    cy.get('a[href="/logout"]').click();
    cy.location('pathname').should('eq', '/login');
    cy.reload();
    cy.get('[data-qa="login-button"]').should('be.visible');
    cy.get('header').should('not.contain.text', 'Logged in as');
    cy.get('a[href="/logout"]').should('not.exist');
  });

  it('rejects registration with an existing email', () => {
    cy.visit('/login');
    cy.then(() => {
      cy.get('[data-qa="signup-name"]').type(user!.name);
      cy.get('[data-qa="signup-email"]').type(user!.email);
    });
    cy.get('[data-qa="signup-button"]').click();
    cy.contains('Email Address already exist!').should('be.visible');
  });
});
