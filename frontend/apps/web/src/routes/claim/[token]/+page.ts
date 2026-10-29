import { ApiError, type Tip } from '@mergetip/api-client';
import { api } from '#lib/api.ts';
import type { PageLoad } from './$types';

// Claim links are opened from emails and GitHub; the session lives in the API's cookie.
export const ssr = false;

export type ClaimLoad = { tip: Tip; problem: null } | { tip: null; problem: ApiError };

export const load: PageLoad = async ({ params }): Promise<ClaimLoad & { token: string }> => {
	try {
		return { token: params.token, tip: await api.claim(params.token), problem: null };
	} catch (error) {
		const problem = error instanceof ApiError ? error : new ApiError(0, 'network_error');
		return { token: params.token, tip: null, problem };
	}
};
