import { loadFixture } from '../../../support/data';
import type { TestUser } from '../../../support/types';
import { buildTestUser } from '../../../support/data';

describe('UI regression: registration', () => {
  let user: TestUser;
  let accountCreated: boolean;

  beforeEach(() => {
    accountCreated = false;
    loadFixture('user').then((template) => {
      user = buildTestUser(template);
    });
  });

  afterEach(() => {
    if (accountCreated) cy.deleteUser(user);
  });

  it('registers a new account and signs the user in', () => {
    cy.visit('/login');
    cy.then(() => {
      cy.get('[data-qa="signup-name"]').type(user.name);
      cy.get('[data-qa="signup-email"]').type(user.email);
    });
    cy.get('[data-qa="signup-button"]').click();
    cy.get('[data-qa="password"]').should('be.visible');
    cy.then(() => {
      cy.get('#id_gender1').check();
      cy.get('[data-qa="password"]').type(user.password, { log: false });
      cy.get('[data-qa="days"]').select(user.birth_date);
      cy.get('[data-qa="months"]').select(user.birth_month);
      cy.get('[data-qa="years"]').select(user.birth_year);
      for (const [field, value] of Object.entries({
        first_name: user.firstname,
        last_name: user.lastname,
        company: user.company,
        address: user.address1,
        address2: user.address2,
        state: user.state,
        city: user.city,
        zipcode: user.zipcode,
        mobile_number: user.mobile_number,
      })) {
        cy.get(`[data-qa="${field}"]`).type(value);
      }
      cy.get('[data-qa="country"]').select(user.country);
    });
    // Capture successful creation before UI assertions so later failures still clean up.
    cy.intercept('POST', '**/signup').as('signup');
    cy.get('[data-qa="create-account"]').click();
    cy.wait('@signup').then(({ response }) => {
      accountCreated = response?.statusCode === 302 || response?.statusCode === 200;
    });
    cy.get('[data-qa="account-created"]').should('be.visible');
    cy.get('[data-qa="continue-button"]').click();
    cy.then(() => {
      cy.get('header').contains('Logged in as').should('be.visible');
      cy.get('header').contains('b', user.name).should('be.visible');
    });
  });
});
