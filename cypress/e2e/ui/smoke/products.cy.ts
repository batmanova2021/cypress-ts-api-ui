import {
  addCatalogProduct,
  cartCell,
  cartRow,
  catalogProduct,
  readFirstProduct,
  ui,
  viewCart,
} from '../../../support/ui';

describe('UI smoke: products and cart', () => {
  beforeEach(() => {
    cy.visit('/products');
  });

  it('displays the product catalog', () => {
    cy.contains('h2', 'All Products').should('be.visible');
    cy.get(ui.productLinks).should('have.length.greaterThan', 0);
    readFirstProduct().then(({ id, name, price }) => {
      catalogProduct(id).within(() => {
        cy.contains('p', name).should('be.visible');
        cy.contains('h2', price).should('be.visible');
        cy.get(`a[data-product-id="${id}"]`).should('be.visible');
      });
    });
  });

  it('adds a product and shows its details in the cart', () => {
    readFirstProduct().then(({ id, name, price }) => {
      addCatalogProduct(id);
      viewCart();
      cy.location('pathname').should('eq', '/view_cart');
      cy.get(ui.cartRows).should('have.length', 1);
      cartRow(id).find(`a[href="/product_details/${id}"]`).should('have.text', name);
      cartCell(id, 'Price').should('contain.text', price);
      cartCell(id, 'Quantity').find('button').should('have.text', '1');
      cartCell(id, 'Total').should('contain.text', price);
    });
  });
});
