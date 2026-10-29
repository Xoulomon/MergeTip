import { ApiError, type Me } from '@mergetip/api-client';
import { api } from './api.ts';

type Status = 'idle' | 'loading' | 'ready' | 'error';

/** The signed-in user, loaded from `GET /me`. `me` is `null` when signed out. */
class Session {
	me = $state<Me | null>(null);
	status = $state<Status>('idle');
	error = $state<ApiError | null>(null);
	#pending: Promise<Me | null> | null = null;

	get signedIn(): boolean {
		return this.me !== null;
	}

	/** Loads the session once; concurrent callers share the request. */
	load(): Promise<Me | null> {
		if (this.status === 'ready') return Promise.resolve(this.me);
		this.#pending ??= this.#fetch().finally(() => (this.#pending = null));
		return this.#pending;
	}

	/** Re-reads `/me`, e.g. after a change made elsewhere. */
	refresh(): Promise<Me | null> {
		this.status = 'idle';
		return this.load();
	}

	/** Stores the `Me` that a settings call returned, so no extra request is needed. */
	set(me: Me): void {
		this.me = me;
		this.status = 'ready';
		this.error = null;
	}

	/** Forgets the session locally, after signing out, deleting the account, or a 401. */
	clear(): void {
		this.me = null;
		this.status = 'ready';
	}

	async #fetch(): Promise<Me | null> {
		this.status = 'loading';
		try {
			this.set(await api.me());
		} catch (error) {
			if (error instanceof ApiError && error.isUnauthenticated) {
				this.clear();
			} else {
				this.error = error instanceof ApiError ? error : new ApiError(0, 'network_error');
				this.status = 'error';
				throw this.error;
			}
		}
		return this.me;
	}
}

export const session = new Session();

/** Sends the browser to GitHub sign-in, returning to `path` (the current page by default). */
export function signIn(path = location.pathname + location.search): void {
	location.assign(api.loginUrl(path));
}
