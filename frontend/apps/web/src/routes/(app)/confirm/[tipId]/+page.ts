import { ApiError } from '@mergetip/api-client';
import { api } from '#lib/api.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { me } = await parent();
	if (!me) return { tip: null, problem: null }; // the layout is sending the user to sign in
	try {
		return { tip: await api.confirmation(params.tipId), problem: null };
	} catch (error) {
		return {
			tip: null,
			problem: error instanceof ApiError ? error : new ApiError(0, 'network_error')
		};
	}
};
