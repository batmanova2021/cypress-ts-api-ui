// The public service sometimes sends JSON with a text content type.
// Response assertions in the specs validate the contract under test.
export function parseApiBody<T>(body: unknown): T {
  return (typeof body === 'string' ? JSON.parse(body) : body) as T;
}
