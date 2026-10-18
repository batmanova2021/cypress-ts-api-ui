import { validateApiBody } from '../../../support/api';
import type { ProductsResponse, UserResponse } from '../../../support/types';

function validProducts(): ProductsResponse {
  return {
    responseCode: 200,
    products: [
      {
        id: 1,
        name: 'Example Top',
        price: 'Rs. 500',
        brand: 'Example',
        category: { category: 'Tops', usertype: { usertype: 'Women' } },
      },
    ],
  };
}

function validUser(): UserResponse {
  return {
    responseCode: 200,
    user: { id: 1, name: 'Example Tester', email: 'tester@example.com', city: 'Boston' },
  };
}

function expectSchemaFailure(
  schema: Parameters<typeof validateApiBody>[0],
  body: unknown,
  detail: string,
): void {
  try {
    validateApiBody(schema, body);
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    expect(error.message).to.include(`API schema validation failed (${schema})`);
    expect(error.message).to.include(detail);
    return;
  }
  throw new Error(`Expected ${schema} schema to reject the response`);
}

describe('API regression: runtime schema validation', () => {
  it('accepts JSON text, empty search results, and additive fields', () => {
    const products = validProducts();
    expect(validateApiBody('products', JSON.stringify(products))).to.deep.eq(products);
    expect(validateApiBody('products', { responseCode: 200, products: [] }).products).to.deep.eq(
      [],
    );
    expect(validateApiBody('user', { ...validUser(), extra: true })).to.deep.eq({
      ...validUser(),
      extra: true,
    });
    expect(
      validateApiBody('message', { responseCode: 400, message: 'Invalid input' }).responseCode,
    ).to.eq(400);
  });

  it('rejects missing product fields and invalid nested category types', () => {
    const product = validProducts().products[0]!;
    const withoutBrand: Partial<typeof product> = { ...product };
    delete withoutBrand.brand;
    expectSchemaFailure(
      'products',
      { responseCode: 200, products: [withoutBrand] },
      "required property 'brand'",
    );
    expectSchemaFailure(
      'products',
      {
        responseCode: 200,
        products: [{ ...product, category: { ...product.category, usertype: { usertype: 123 } } }],
      },
      '/products/0/category/usertype/usertype',
    );
  });

  it('rejects wrong scalar types and invalid price formats without coercion', () => {
    const product = validProducts().products[0]!;
    expectSchemaFailure(
      'products',
      { responseCode: 200, products: [{ ...product, id: '1' }] },
      '/products/0/id must be integer',
    );
    expectSchemaFailure(
      'products',
      { responseCode: 200, products: [{ ...product, price: '500 USD' }] },
      '/products/0/price must match pattern',
    );
    expectSchemaFailure('message', { responseCode: '200', message: 'Success' }, 'must be integer');
    expectSchemaFailure('message', { responseCode: 200 }, "required property 'message'");
  });

  it('rejects missing account fields and malformed email addresses', () => {
    const user = validUser().user;
    const withoutCity: Partial<typeof user> = { ...user };
    delete withoutCity.city;
    expectSchemaFailure(
      'user',
      { responseCode: 200, user: withoutCity },
      "required property 'city'",
    );
    expectSchemaFailure(
      'user',
      { responseCode: 200, user: { ...user, email: 'not-an-email' } },
      'format "email"',
    );
  });

  it('rejects malformed JSON, null bodies, and missing response envelopes', () => {
    expectSchemaFailure('message', '<html>Server error</html>', 'not valid JSON');
    expectSchemaFailure('message', null, 'must be object');
    expectSchemaFailure('products', { products: [] }, "required property 'responseCode'");
    expectSchemaFailure('products', { responseCode: 200, products: {} }, 'must be array');
  });
});
