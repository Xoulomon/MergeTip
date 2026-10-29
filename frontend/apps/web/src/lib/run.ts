import { ApiError } from '@mergetip/api-client';
import { toasts } from '@mergetip/ui';
import { session, signIn } from './session.svelte.ts';

/**
 * What every form and button does with an API error: a 401 or a re-auth demand sends the user
 * to GitHub sign-in (returning here), anything else is shown as human copy.
 *
 * Returns the message to show inline, or `null` when the user is being redirected.
 */
export function handleError(error: unknown): string | null {
	if (error instanceof ApiError) {
		if (error.isUnauthenticated) {
			session.clear();
			signIn();
			return null;
		}
		return error.message;
	}
	console.error(error);
	return 'Something went wrong. Try again in a moment.';
}

/**
 * Runs `task`, toasting `success` when it resolves and the error when it rejects.
 * Resolves to whether the task succeeded; capture any result inside the task.
 */
export async function run(task: () => Promise<unknown>, success?: string): Promise<boolean> {
	try {
		await task();
		if (success) toasts.success(success);
		return true;
	} catch (error) {
		const message = handleError(error);
		if (message) toasts.error(message);
		return false;
	}
}
