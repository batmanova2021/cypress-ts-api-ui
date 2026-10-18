import { validateApiBody } from './api';
import { buildTestUser, loadFixture } from './data';
import type { Credentials, TestUser } from './types';

declare global {
  namespace Cypress {
    interface Chainable {
      createUser(): Chainable<TestUser>;
      deleteUser(user: Credentials): Chainable<Response<unknown>>;
      login(user: Credentials): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add('createUser', () => {
  return loadFixture('user').then((template) => {
    const user = buildTestUser(template);
    return cy
      .request<unknown>({
        method: 'POST',
        url: '/api/createAccount',
        form: true,
        body: user,
        log: false,
      })
      .then((response) => {
        expect(response.status).to.eq(200);
        const body = validateApiBody('message', response.body);
        expect(body.responseCode).to.eq(201);
        expect(body.message).to.eq('User created!');
        return user;
      });
  });
});

Cypress.Commands.add('deleteUser', (user: Credentials) => {
  return cy
    .request<unknown>({
      method: 'DELETE',
      url: '/api/deleteAccount',
      form: true,
      body: { email: user.email, password: user.password },
      log: false,
    })
    .then((response) => {
      expect(response.status).to.eq(200);
      const body = validateApiBody('message', response.body);
      expect(body.responseCode).to.eq(200);
      expect(body.message).to.eq('Account deleted!');
    });
});

Cypress.Commands.add('login', (user: Credentials) => {
  cy.visit('/login');
  cy.get('[data-qa="login-email"]').type(user.email);
  cy.get('[data-qa="login-password"]').type(user.password, { log: false });
  return cy.get('[data-qa="login-button"]').click();
});
