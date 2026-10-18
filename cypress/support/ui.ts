import type { ProductDetails } from './types';

export const ui = {
  productCards: '.features_items .product-image-wrapper',
  productInfo: '.features_items .productinfo',
  productNames: '.features_items .productinfo p',
  productDetails: '.product-information',
  cartRows: '#cart_info_table tbody tr',
} as const;

export function readFirstProduct(): Cypress.Chainable<ProductDetails> {
  return cy
    .get(ui.productInfo)
    .first()
    .then(($product) => ({
      name: $product.find('p').text().trim(),
      price: $product.find('h2').text().trim(),
    }));
}

export function openFirstProduct(): Cypress.Chainable<JQuery<HTMLAnchorElement>> {
  return cy.get(ui.productCards).first().contains('a', 'View Product').click();
}

export function viewCart(): Cypress.Chainable<JQuery<HTMLAnchorElement>> {
  return cy.get('#cartModal').should('be.visible').contains('a', 'View Cart').click();
}

export function searchProducts(term: string): Cypress.Chainable<JQuery<HTMLElement>> {
  cy.get('#search_product').type(term);
  return cy.get('#submit_search').click();
}

export function parsePrice(text: string): number {
  const match = text.match(/Rs\.\s*(\d+(?:\.\d+)?)/);
  if (!match?.[1]) throw new Error(`Unrecognized product price: ${text}`);
  return Number(match[1]);
}
