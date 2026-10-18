import { loadFixture } from '../../../support/data';
import type { ApiResult, ProductsResponse } from '../../../support/types';
import { parseApiBody } from '../../../support/api';

describe('API regression: product search and validation', () => {
  it('finds matching products', () => {
    loadFixture('regression').then(({ searchTerm }) => {
      cy.request<unknown>({
        method: 'POST',
        url: '/api/searchProduct',
        form: true,
        body: { search_product: searchTerm },
      }).then((response) => {
        expect(response.status).to.eq(200);
        const body = parseApiBody<ProductsResponse>(response.body);
        expect(body.responseCode).to.eq(200);
        expect(body.products).to.be.an('array');
        expect(body.products.length).to.be.greaterThan(0);
        body.products.forEach((product) => {
          expect(product.name.toLowerCase()).to.contain(searchTerm);
        });
      });
    });
  });

  it('returns an empty collection for an unmatched search', () => {
    loadFixture('regression').then(({ noMatchSearch }) => {
      cy.request<unknown>({
        method: 'POST',
        url: '/api/searchProduct',
        form: true,
        body: { search_product: noMatchSearch },
      }).then((response) => {
        expect(response.status).to.eq(200);
        const body = parseApiBody<ProductsResponse>(response.body);
        expect(body.responseCode).to.eq(200);
        expect(body.products).to.deep.eq([]);
      });
    });
  });

  it('rejects a missing search parameter', () => {
    cy.request<unknown>({ method: 'POST', url: '/api/searchProduct', form: true, body: {} }).then(
      (response) => {
        expect(response.status).to.eq(200);
        expect(parseApiBody<ApiResult>(response.body)).to.deep.eq({
          responseCode: 400,
          message: 'Bad request, search_product parameter is missing in POST request.',
        });
      },
    );
  });

  it('rejects an unsupported products method', () => {
    cy.request<unknown>('POST', '/api/productsList').then((response) => {
      expect(response.status).to.eq(200);
      expect(parseApiBody<ApiResult>(response.body)).to.deep.eq({
        responseCode: 405,
        message: 'This request method is not supported.',
      });
    });
  });
});
