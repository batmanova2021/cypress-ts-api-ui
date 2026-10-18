import { readFirstProduct, ui, viewCart } from '../../../support/ui';

describe('UI smoke: products and cart', () => {
  beforeEach(() => {
    cy.visit('/products');
  });

  it('displays the product catalog', () => {
    cy.contains('h2', 'All Products').should('be.visible');
    cy.get(ui.productCards).should('have.length.greaterThan', 0);
    cy.get(ui.productInfo)
      .first()
      .within(() => {
        cy.get('p').should('be.visible').and('not.be.empty');
        cy.get('h2').should('be.visible').and('contain.text', 'Rs.');
        cy.contains('a', 'Add to cart').should('be.visible');
      });
  });

  it('adds a product and shows its details in the cart', () => {
    readFirstProduct().then(({ name, price }) => {
      cy.get(ui.productInfo).first().contains('a', 'Add to cart').click();
      viewCart();
      cy.location('pathname').should('eq', '/view_cart');
      cy.get(ui.cartRows)
        .should('have.length', 1)
        .first()
        .within(() => {
          cy.get('.cart_description').should('contain.text', name);
          cy.get('.cart_price').should('contain.text', price);
          cy.get('.cart_quantity button').should('have.text', '1');
          cy.get('.cart_total').should('contain.text', price);
        });
    });
  });
});
