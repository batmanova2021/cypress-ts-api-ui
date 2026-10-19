import type { ProductDetails } from './types';

// These component classes are the public site's fallback where no test attributes exist.
// Actions use product IDs/hrefs; text queries are used when the displayed value matters.
export const ui = {
  productInfo: '.features_items .productinfo',
  productNames: '.features_items .productinfo p',
  productDetails: '.product-information',
  productLinks: 'a[href^="/product_details/"]',
  cartTable: '#cart_info_table',
  cartRows: '#cart_info_table tbody tr',
} as const;

const pricePattern = /^\s*Rs\.\s*\d+(?:\.\d+)?\s*$/;

export function catalogProduct(id: number): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get(ui.productInfo).filter(`:has(a[data-product-id="${id}"])`).should('have.length', 1);
}

export function readFirstProduct(): Cypress.Chainable<ProductDetails> {
  return cy
    .get(ui.productInfo)
    .first()
    .should(($product) => {
      expect($product.find('p').text().trim(), 'product name is populated').not.to.eq('');
      expect($product.find('h2').text(), 'product price is populated').to.match(pricePattern);
      expect($product.find('a[data-product-id]'), 'one product action').to.have.length(1);
      expect(
        $product.find('a[data-product-id]').attr('data-product-id'),
        'product identity',
      ).to.match(/^[1-9]\d*$/);
    })
    .then(($product) => ({
      id: Number($product.find('a[data-product-id]').attr('data-product-id')),
      name: $product.find('p').text().trim(),
      price: $product.find('h2').text().trim(),
    }));
}

export function openProduct(id: number): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy
    .get(`a[href="/product_details/${id}"]`)
    .should('have.length', 1)
    .and('be.visible')
    .click();
}

export function addCatalogProduct(id: number): Cypress.Chainable<JQuery<HTMLElement>> {
  return catalogProduct(id)
    .find(`a[data-product-id="${id}"]`)
    .should('have.length', 1)
    .and('be.visible')
    .click();
}

export function detailPrice(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get(ui.productDetails).contains(pricePattern).should('be.visible');
}

export function addDetailProduct(): Cypress.Chainable<JQuery<HTMLButtonElement>> {
  return cy
    .get(ui.productDetails)
    .contains('button', /^\s*Add to cart\s*$/)
    .click();
}

export function viewCart(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy
    .get('#cartModal')
    .should('be.visible')
    .find('a[href="/view_cart"]')
    .should('have.length', 1)
    .and('be.visible')
    .click();
}

export function cartRow(id: number): Cypress.Chainable<JQuery<HTMLTableRowElement>> {
  return cy
    .get<HTMLTableRowElement>(`${ui.cartTable} tr[id="product-${id}"]`)
    .should('have.length', 1);
}

export function cartCell(
  id: number,
  column: 'Price' | 'Quantity' | 'Total',
): Cypress.Chainable<JQuery<HTMLTableCellElement>> {
  return cy
    .get(`${ui.cartTable} thead`)
    .contains('th, td', new RegExp(`^\\s*${column}\\s*$`))
    .then(($heading) => cartRow(id).find<HTMLTableCellElement>('th, td').eq($heading.index()));
}

export function removeCartProduct(id: number): Cypress.Chainable<JQuery<HTMLElement>> {
  return cartRow(id).find(`a[data-product-id="${id}"]`).should('have.length', 1).click();
}

export function searchProducts(term: string): Cypress.Chainable<JQuery<HTMLElement>> {
  cy.get('#search_product').type(term);
  return cy.get('#submit_search').click();
}

export function parsePrice(text: string): number {
  const match = text.trim().match(/^Rs\.\s*(\d+(?:\.\d+)?)$/);
  if (!match?.[1]) throw new Error(`Unrecognized product price: ${text}`);
  return Number(match[1]);
}
