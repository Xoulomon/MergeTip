import { error } from '@sveltejs/kit';
import { API_ORIGIN } from '$app/env/private';
import { forward } from '#lib/server/api-proxy.ts';
import type { RequestHandler } from './$types';

/** The API's health, through the relay: what uptime monitors should ping. */
export const GET: RequestHandler = ({ request, getClientAddress }) => {
	if (!API_ORIGIN) error(404, 'Not found');
	return forward(request, { apiOrigin: API_ORIGIN, clientIp: getClientAddress() });
};
