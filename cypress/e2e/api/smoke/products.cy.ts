import type { ProductsResponse } from '../../../support/types';
import { parseApiBody } from '../../../support/api';

describe('API smoke: product catalog', () => {
  it('returns available products with essential details', () => {
    cy.request<unknown>('/api/productsList').then((response) => {
      expect(response.status).to.eq(200);
      const body = parseApiBody<ProductsResponse>(response.body);
      expect(body.responseCode).to.eq(200);
      expect(body.products).to.be.an('array');
      expect(body.products.length).to.be.greaterThan(0);
      body.products.forEach((product) => {
        expect(product.id).to.be.a('number').and.be.greaterThan(0);
        expect(product.name).to.be.a('string').and.not.eq('');
        expect(product.price).to.match(/^Rs\.\s*\d+/);
      });
    });
  });
});
