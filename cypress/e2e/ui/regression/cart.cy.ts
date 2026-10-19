import {
  addDetailProduct,
  cartCell,
  detailPrice,
  openProduct,
  parsePrice,
  readFirstProduct,
  removeCartProduct,
  ui,
  viewCart,
} from '../../../support/ui';
import { loadFixture } from '../../../support/data';
import type { ProductDetails } from '../../../support/types';

describe('UI regression: cart quantity and removal', () => {
  let product: ProductDetails;
  beforeEach(() => {
    cy.visit('/products');
    readFirstProduct().then((selected) => {
      product = selected;
      openProduct(selected.id);
    });
  });

  it('uses the selected quantity and calculates the line total', () => {
    loadFixture('regression').then(({ quantity }) => {
      detailPrice()
        .invoke('text')
        .then((priceText) => {
          const unitPrice = parsePrice(priceText);
          expect(unitPrice).to.be.greaterThan(0);
          cy.get('input[name="quantity"]').clear();
          cy.get('input[name="quantity"]').type(String(quantity));
          addDetailProduct();
          viewCart();
          cy.get(ui.cartRows).should('have.length', 1);
          cartCell(product.id, 'Quantity').find('button').should('have.text', String(quantity));
          cartCell(product.id, 'Price')
            .invoke('text')
            .should((text) => {
              expect(parsePrice(text)).to.eq(unitPrice);
            });
          cartCell(product.id, 'Total')
            .invoke('text')
            .should((text) => {
              expect(parsePrice(text)).to.eq(unitPrice * quantity);
            });
        });
    });
  });

  it('removes a product and keeps the cart empty after reload', () => {
    addDetailProduct();
    viewCart();
    cy.get(ui.cartRows).should('have.length', 1);
    cy.then(() => removeCartProduct(product.id));
    cy.get('#empty_cart').should('be.visible').and('contain.text', 'Cart is empty!');
    cy.get(ui.cartRows).should('not.exist');
    cy.reload();
    cy.get('#empty_cart').should('be.visible').and('contain.text', 'Cart is empty!');
    cy.get(ui.cartRows).should('not.exist');
  });
});
