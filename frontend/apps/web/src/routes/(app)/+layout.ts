import { error } from '@sveltejs/kit';
import { session } from '#lib/session.svelte.ts';
import type { LayoutLoad } from './$types';

// Signed-in pages read the API's session cookie, which only the browser holds.
export const ssr = false;

export const load: LayoutLoad = async () => {
	try {
		// `null` when signed out: the layout then sends the browser to GitHub sign-in. (SvelteKit
		// does not allow `redirect()` to another origin from a load function.)
		return { me: await session.load() };
	} catch (cause) {
		error(503, { message: cause instanceof Error ? cause.message : 'MergeTip is unavailable.' });
	}
};
