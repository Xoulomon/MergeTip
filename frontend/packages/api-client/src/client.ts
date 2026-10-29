import createClient, { type Middleware } from 'openapi-fetch';
import { ApiError, CLIENT_CODES, errorFromResponse } from './errors';
import type { components, paths } from './schema';

type Schemas = components['schemas'];
export type Me = Schemas['Me'];
export type Tip = Schemas['Tip'];
export type TipState = Schemas['TipState'];
export type TipKind = Schemas['TipKindBody'];
export type TipList = Schemas['TipList'];
export type UserRef = Schemas['UserRef'];
export type ReceiveStatus = Schemas['ReceiveStatus'];
export type SettingsRequest = Schemas['SettingsRequest'];
export type TipCommentRequest = Schemas['TipCommentRequest'];
export type ExtensionToken = Schemas['ExtensionToken'];
export type TipDirection = 'sent' | 'received' | 'all';

/** Every request gives up after this long, so a stuck network never leaves a spinner forever. */
export const REQUEST_TIMEOUT_MS = 15_000;

export interface ApiClientOptions {
	/** The API origin, without `/v1`, e.g. `https://api.mergetip.dev`. */
	baseUrl: string;
	/** For SSR and tests. Defaults to the global `fetch`. */
	fetch?: typeof fetch;
	/** Extension only: returns the bearer token, or `null` when not connected. */
	getToken?: () => Promise<string | null> | string | null;
	timeoutMs?: number;
}

type Result<T> = { data?: T; error?: unknown; response: Response };

/**
 * Typed access to the MergeTip API. Each method resolves with the response body or rejects
 * with an [`ApiError`]; network failures and timeouts become `ApiError`s too.
 */
export class MergeTipApi {
	readonly #client;
	readonly #fetch: typeof fetch;
	readonly #timeoutMs: number;
	readonly baseUrl: string;

	constructor(options: ApiClientOptions) {
		this.baseUrl = options.baseUrl.replace(/\/+$/, '');
		this.#fetch = options.fetch ?? ((input, init) => globalThis.fetch(input, init));
		this.#timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
		this.#client = createClient<paths>({
			baseUrl: this.baseUrl,
			credentials: 'include',
			fetch: (request) => this.#send(request)
		});
		const { getToken } = options;
		if (getToken) this.#client.use(bearer(getToken));
	}

	/** Where to send the browser to sign in. Navigate to it; never fetch it. */
	loginUrl(redirect: string): string {
		return `${this.baseUrl}/v1/auth/github/login?${new URLSearchParams({ redirect })}`;
	}

	me(): Promise<Me> {
		return unwrap(this.#client.GET('/v1/me'));
	}

	logout(): Promise<void> {
		return unwrapEmpty(this.#client.POST('/v1/auth/logout'));
	}

	deleteAccount(): Promise<void> {
		return unwrapEmpty(this.#client.DELETE('/v1/me'));
	}

	extensionToken(): Promise<ExtensionToken> {
		return unwrap(this.#client.POST('/v1/auth/extension-token'));
	}

	connectWallet(nwcUri: string): Promise<Me> {
		return unwrap(this.#client.PUT('/v1/me/wallet', { body: { nwc_uri: nwcUri } }));
	}

	disconnectWallet(): Promise<void> {
		return unwrapEmpty(this.#client.DELETE('/v1/me/wallet'));
	}

	setLightningAddress(address: string): Promise<Me> {
		return unwrap(this.#client.PUT('/v1/me/lightning-address', { body: { address } }));
	}

	updateSettings(settings: SettingsRequest): Promise<Me> {
		return unwrap(this.#client.PATCH('/v1/me/settings', { body: settings }));
	}

	tips(
		query: { direction?: TipDirection; state?: TipState; cursor?: string } = {}
	): Promise<TipList> {
		return unwrap(this.#client.GET('/v1/me/tips', { params: { query } }));
	}

	async claim(token: string): Promise<Tip> {
		const { tip } = await unwrap(
			this.#client.GET('/v1/claims/{token}', { params: { path: { token } } })
		);
		return tip;
	}

	async submitClaim(token: string, lightningAddress?: string): Promise<Tip> {
		const { tip } = await unwrap(
			this.#client.POST('/v1/claims/{token}', {
				params: { path: { token } },
				body: lightningAddress ? { lightning_address: lightningAddress } : {}
			})
		);
		return tip;
	}

	async confirmation(tipId: string): Promise<Tip> {
		const { tip } = await unwrap(
			this.#client.GET('/v1/confirmations/{tip_id}', { params: { path: { tip_id: tipId } } })
		);
		return tip;
	}

	sendConfirmationCode(tipId: string): Promise<void> {
		return unwrapEmpty(
			this.#client.POST('/v1/confirmations/{tip_id}/otp', { params: { path: { tip_id: tipId } } })
		);
	}

	async confirm(tipId: string, otp?: string): Promise<Tip> {
		const { tip } = await unwrap(
			this.#client.POST('/v1/confirmations/{tip_id}', {
				params: { path: { tip_id: tipId } },
				body: otp ? { otp } : {}
			})
		);
		return tip;
	}

	cancelConfirmation(tipId: string): Promise<void> {
		return unwrapEmpty(
			this.#client.DELETE('/v1/confirmations/{tip_id}', { params: { path: { tip_id: tipId } } })
		);
	}

	receiveStatus(login: string): Promise<ReceiveStatus> {
		return unwrap(
			this.#client.GET('/v1/users/{login}/receive-status', { params: { path: { login } } })
		);
	}

	postTipComment(body: TipCommentRequest): Promise<{ comment_url: string }> {
		return unwrap(this.#client.POST('/v1/tips/comment', { body }));
	}

	/** Sends one request with a timeout, turning transport failures into `ApiError`s. */
	async #send(request: Request): Promise<Response> {
		const timeout = AbortSignal.timeout(this.#timeoutMs);
		const signal = AbortSignal.any([request.signal, timeout]);
		try {
			return await this.#fetch(new Request(request, { signal }));
		} catch (cause) {
			if (timeout.aborted) throw new ApiError(0, CLIENT_CODES.timeout);
			if (request.signal.aborted) throw cause;
			throw new ApiError(0, CLIENT_CODES.network, String(cause));
		}
	}
}

function bearer(getToken: NonNullable<ApiClientOptions['getToken']>): Middleware {
	return {
		async onRequest({ request }) {
			const token = await getToken();
			if (token) request.headers.set('Authorization', `Bearer ${token}`);
			return request;
		}
	};
}

async function unwrap<T>(pending: Promise<Result<T>>): Promise<T> {
	const { data, error, response } = await pending;
	if (!response.ok) throw errorFromResponse(response.status, error);
	if (data === undefined) throw new ApiError(response.status, CLIENT_CODES.unexpected);
	return data;
}

async function unwrapEmpty(pending: Promise<Result<unknown>>): Promise<void> {
	const { error, response } = await pending;
	if (!response.ok) throw errorFromResponse(response.status, error);
}
