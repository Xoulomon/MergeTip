// Relays /v1/* and /healthz to the API when the web app and the API are hosted separately (e.g.
// Vercel + Render). The browser then talks to one origin, so the API's SameSite=Lax session cookie
// works without a shared domain. Locally the web app calls the API directly and this is unused.

/** Headers that describe one hop, not the request, plus ones fetch sets itself. */
const HOP_BY_HOP = new Set([
	'connection',
	'keep-alive',
	'proxy-authenticate',
	'proxy-authorization',
	'te',
	'trailer',
	'transfer-encoding',
	'upgrade',
	'host',
	'content-length',
	// fetch decodes the body, so the encoding no longer applies.
	'content-encoding'
]);

/** Where the caller's IP goes; the API trusts it via TRUSTED_CLIENT_IP_HEADER. */
export const CLIENT_IP_HEADER = 'x-vercel-forwarded-for';

const TIMEOUT_MS = 25_000;

export interface ForwardOptions {
	/** The API's origin, e.g. `https://mergetip-api.onrender.com`. */
	apiOrigin: string;
	clientIp: string;
	fetch?: typeof fetch;
}

/** Sends `request` to the same path on the API and returns its answer as is (redirects included). */
export async function forward(request: Request, options: ForwardOptions): Promise<Response> {
	const incoming = new URL(request.url);
	const target = new URL(incoming.pathname + incoming.search, options.apiOrigin);

	const headers = new Headers();
	for (const [name, value] of request.headers) {
		if (!HOP_BY_HOP.has(name)) headers.append(name, value);
	}
	headers.set(CLIENT_IP_HEADER, options.clientIp);

	const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
	let upstream: Response;
	try {
		upstream = await (options.fetch ?? fetch)(target, {
			method: request.method,
			headers,
			body: hasBody ? await request.arrayBuffer() : undefined,
			redirect: 'manual',
			signal: AbortSignal.timeout(TIMEOUT_MS)
		});
	} catch {
		return Response.json(
			{ error: { code: 'service_unavailable', message: 'The API is unavailable.' } },
			{ status: 502 }
		);
	}

	const answer = new Headers();
	for (const [name, value] of upstream.headers) {
		if (!HOP_BY_HOP.has(name)) answer.append(name, value);
	}
	return new Response(upstream.body, { status: upstream.status, headers: answer });
}
