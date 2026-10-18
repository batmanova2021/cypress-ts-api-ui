import type { TestUser } from '../../../support/types';

describe('UI smoke: login', () => {
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

  it('logs in and displays the account name', () => {
    cy.then(() => cy.login(user!));
    cy.get('header').contains('Logged in as').should('be.visible');
    cy.then(() => {
      cy.get('header').contains('b', user!.name).should('be.visible');
    });
    cy.get('a[href="/logout"]').should('be.visible');
  });
});
