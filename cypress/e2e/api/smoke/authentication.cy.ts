import type { ApiResult, TestUser } from '../../../support/types';
import { parseApiBody } from '../../../support/api';

describe('API smoke: authentication', () => {
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

  it('verifies credentials for a newly created account', () => {
    cy.then(() => {
      return cy.request<unknown>({
        method: 'POST',
        url: '/api/verifyLogin',
        form: true,
        body: { email: user!.email, password: user!.password },
        log: false,
      });
    }).then((response) => {
      expect(response.status).to.eq(200);
      const body = parseApiBody<ApiResult>(response.body);
      expect(body.responseCode).to.eq(200);
      expect(body.message).to.eq('User exists!');
    });
  });
});
