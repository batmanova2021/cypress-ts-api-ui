import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { messageSchema, productsSchema, userSchema } from '../schemas/api';
import type { ApiResult, ProductsResponse, UserResponse } from './types';

interface ApiBodies {
  message: ApiResult;
  products: ProductsResponse;
  user: UserResponse;
}

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv, ['email']);

const validators: { [K in keyof ApiBodies]: ValidateFunction<ApiBodies[K]> } = {
  message: ajv.compile(messageSchema),
  products: ajv.compile(productsSchema),
  user: ajv.compile(userSchema),
};

function parseAndValidate<T>(body: unknown, validate: ValidateFunction<T>, name: string): T {
  // The public service sometimes sends JSON with a text content type.
  let parsed: unknown = body;
  if (typeof body === 'string') {
    try {
      parsed = JSON.parse(body) as unknown;
    } catch {
      throw new Error(`API schema validation failed (${name}): response is not valid JSON`);
    }
  }
  if (!validate(parsed)) {
    // Report schema paths, never dump the response or request credentials.
    throw new Error(
      `API schema validation failed (${name}): ${ajv.errorsText(validate.errors, {
        dataVar: name,
        separator: '; ',
      })}`,
    );
  }
  return parsed;
}

export function validateApiBody<K extends keyof ApiBodies>(name: K, body: unknown): ApiBodies[K] {
  return parseAndValidate(body, validators[name], name);
}
