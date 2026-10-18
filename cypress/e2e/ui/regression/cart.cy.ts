import { openFirstProduct, parsePrice, ui, viewCart } from '../../../support/ui';
import { loadFixture } from '../../../support/data';
describe('UI regression: cart quantity and removal', () => {
  beforeEach(() => {
    cy.visit('/products');
    openFirstProduct();
  });

  it('uses the selected quantity and calculates the line total', () => {
    loadFixture('regression').then(({ quantity }) => {
      cy.get('.product-information > span > span')
        .invoke('text')
        .then((priceText) => {
          const unitPrice = parsePrice(priceText);
          expect(unitPrice).to.be.greaterThan(0);
          cy.get('#quantity').clear();
          cy.get('#quantity').type(String(quantity));
          cy.get('button.cart').click();
          viewCart();
          cy.get(ui.cartRows)
            .should('have.length', 1)
            .within(() => {
              cy.get('.cart_quantity button').should('have.text', String(quantity));
              cy.get('.cart_price').should('contain.text', `Rs. ${unitPrice}`);
              cy.get('.cart_total_price')
                .invoke('text')
                .then((totalText) => {
                  expect(totalText.trim()).to.eq(`Rs. ${unitPrice * quantity}`);
                });
            });
        });
    });
  });

  it('removes a product and keeps the cart empty after reload', () => {
    cy.get('button.cart').click();
    viewCart();
    cy.get(ui.cartRows).should('have.length', 1);
    cy.get('.cart_quantity_delete').click();
    cy.contains('Cart is empty!').should('be.visible');
    cy.get(ui.cartRows).should('not.exist');
    cy.reload();
    cy.contains('Cart is empty!').should('be.visible');
    cy.get(ui.cartRows).should('not.exist');
  });
});
