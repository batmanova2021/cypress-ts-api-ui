import { loadFixture } from '../../../support/data';
import type { TestUser } from '../../../support/types';
import { validateApiBody } from '../../../support/api';

describe('API regression: accounts', () => {
  let user: TestUser;
  let needsCleanup: boolean;

  beforeEach(() => {
    needsCleanup = false;
    cy.createUser().then((created) => {
      user = created;
      needsCleanup = true;
    });
  });

  afterEach(() => {
    if (needsCleanup) cy.deleteUser(user);
  });

  it('rejects an incorrect password for an existing user', () => {
    loadFixture('regression').then(({ incorrectPassword }) => {
      cy.request<unknown>({
        method: 'POST',
        url: '/api/verifyLogin',
        form: true,
        log: false,
        body: { email: user.email, password: incorrectPassword },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(validateApiBody('message', response.body)).to.deep.eq({
          responseCode: 404,
          message: 'User not found!',
        });
      });
    });
  });

  it('rejects login without an email', () => {
    cy.then(() =>
      cy.request<unknown>({
        method: 'POST',
        url: '/api/verifyLogin',
        form: true,
        log: false,
        body: { password: user.password },
      }),
    ).then((response) => {
      expect(response.status).to.eq(200);
      expect(validateApiBody('message', response.body)).to.deep.eq({
        responseCode: 400,
        message: 'Bad request, email or password parameter is missing in POST request.',
      });
    });
  });

  it('persists account updates', () => {
    loadFixture('regression').then(({ updatedName, updatedCity }) => {
      cy.request<unknown>({
        method: 'PUT',
        url: '/api/updateAccount',
        form: true,
        log: false,
        body: { ...user, name: updatedName, city: updatedCity },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(validateApiBody('message', response.body)).to.deep.eq({
          responseCode: 200,
          message: 'User updated!',
        });
      });
      cy.request<unknown>({ url: '/api/getUserDetailByEmail', qs: { email: user.email } }).then(
        (response) => {
          expect(response.status).to.eq(200);
          const body = validateApiBody('user', response.body);
          expect(body.responseCode).to.eq(200);
          expect(body.user).to.include({
            name: updatedName,
            city: updatedCity,
            email: user.email,
          });
        },
      );
    });
  });

  it('deletes an account and rejects its former credentials', () => {
    cy.then(() => cy.deleteUser(user)).then(() => {
      needsCleanup = false;
    });
    cy.then(() =>
      cy.request<unknown>({
        method: 'POST',
        url: '/api/verifyLogin',
        form: true,
        log: false,
        body: { email: user.email, password: user.password },
      }),
    ).then((response) => {
      expect(response.status).to.eq(200);
      expect(validateApiBody('message', response.body)).to.deep.eq({
        responseCode: 404,
        message: 'User not found!',
      });
    });
  });
});
