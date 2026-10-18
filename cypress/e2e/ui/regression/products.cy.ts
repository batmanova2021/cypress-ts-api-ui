import { loadFixture } from '../../../support/data';
import { openFirstProduct, readFirstProduct, searchProducts, ui } from '../../../support/ui';

describe('UI regression: product search and details', () => {
  beforeEach(() => {
    cy.visit('/products');
  });

  it('shows matching search results', () => {
    loadFixture('regression').then(({ searchTerm }) => {
      searchProducts(searchTerm);
      cy.contains('h2', 'Searched Products').should('be.visible');
      cy.get(ui.productNames)
        .should('have.length.greaterThan', 0)
        .each(($name) => {
          expect($name.text().toLowerCase()).to.contain(searchTerm);
        });
    });
  });

  it('shows no products for an unmatched search', () => {
    loadFixture('regression').then(({ noMatchSearch }) => {
      searchProducts(noMatchSearch);
      cy.contains('h2', 'Searched Products').should('be.visible');
      cy.get(ui.productCards).should('not.exist');
    });
  });

  it('opens the selected product with its details', () => {
    readFirstProduct().then(({ name, price }) => {
      openFirstProduct();
      cy.location('pathname').should('match', /^\/product_details\/\d+$/);
      cy.get(ui.productDetails).within(() => {
        cy.get('h2').should('have.text', name);
        cy.contains('span', price).should('be.visible');
        ['Category:', 'Availability:', 'Condition:', 'Brand:'].forEach((label) => {
          cy.contains('p', label)
            .should('be.visible')
            .invoke('text')
            .should('match', new RegExp(`${label}\\s*\\S+`));
        });
      });
    });
  });
});
