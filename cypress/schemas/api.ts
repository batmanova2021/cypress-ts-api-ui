import type { JSONSchemaType } from 'ajv';
import type { ApiResult, Product, ProductsResponse, UserResponse } from '../support/types';

// Permit additive fields, but require all fields that this framework relies on.
// Success codes and messages remain explicit business assertions in the specs.
export const messageSchema: JSONSchemaType<ApiResult> = {
  type: 'object',
  properties: {
    responseCode: { type: 'integer', minimum: 100, maximum: 599 },
    message: { type: 'string', minLength: 1 },
  },
  required: ['responseCode', 'message'],
  additionalProperties: true,
};

const productSchema: JSONSchemaType<Product> = {
  type: 'object',
  properties: {
    id: { type: 'integer', minimum: 1 },
    name: { type: 'string', minLength: 1 },
    price: { type: 'string', pattern: '^Rs\\.\\s*\\d+(?:\\.\\d+)?$' },
    brand: { type: 'string', minLength: 1 },
    category: {
      type: 'object',
      properties: {
        category: { type: 'string', minLength: 1 },
        usertype: {
          type: 'object',
          properties: { usertype: { type: 'string', minLength: 1 } },
          required: ['usertype'],
          additionalProperties: true,
        },
      },
      required: ['category', 'usertype'],
      additionalProperties: true,
    },
  },
  required: ['id', 'name', 'price', 'brand', 'category'],
  additionalProperties: true,
};

export const productsSchema: JSONSchemaType<ProductsResponse> = {
  type: 'object',
  properties: {
    responseCode: { type: 'integer', const: 200 },
    // Empty collections are valid for searches; catalog nonemptiness is a business check.
    products: { type: 'array', items: productSchema },
  },
  required: ['responseCode', 'products'],
  additionalProperties: true,
};

export const userSchema: JSONSchemaType<UserResponse> = {
  type: 'object',
  properties: {
    responseCode: { type: 'integer', const: 200 },
    user: {
      type: 'object',
      properties: {
        id: { type: 'integer', minimum: 1 },
        name: { type: 'string', minLength: 1 },
        email: { type: 'string', format: 'email' },
        city: { type: 'string', minLength: 1 },
      },
      required: ['id', 'name', 'email', 'city'],
      additionalProperties: true,
    },
  },
  required: ['responseCode', 'user'],
  additionalProperties: true,
};
