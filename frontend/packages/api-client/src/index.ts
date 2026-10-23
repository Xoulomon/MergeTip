// Typed client for the MergeTip API. `schema.d.ts` is generated from openapi/openapi.json
// (run `pnpm gen:api`); never edit it by hand.
import createClient from 'openapi-fetch';
import type { paths } from './schema';

export type { components, paths } from './schema';

export function createApiClient(baseUrl: string, init?: { fetch?: typeof fetch }) {
	return createClient<paths>({ baseUrl, credentials: 'include', ...init });
}
