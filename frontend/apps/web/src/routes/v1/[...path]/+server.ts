import { error } from '@sveltejs/kit';
import { API_ORIGIN } from '$app/env/private';
import { forward } from '#lib/server/api-proxy.ts';
import type { RequestHandler } from './$types';

// Vercel: connecting a wallet can take ~10 s; allow headroom (ignored by other adapters).
export const config = { maxDuration: 30 };

export const fallback: RequestHandler = ({ request, getClientAddress }) => {
	if (!API_ORIGIN) error(404, 'Not found');
	return forward(request, { apiOrigin: API_ORIGIN, clientIp: getClientAddress() });
};
