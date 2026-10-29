<script lang="ts">
	import { Spinner } from '@mergetip/ui';
	import { session, signIn } from '#lib/session.svelte.ts';

	let { children } = $props();

	// Signed out (or signed out elsewhere mid-visit): go to GitHub and come back here.
	$effect(() => {
		if (session.status === 'ready' && !session.me) signIn();
	});
</script>

{#if session.me}
	{@render children()}
{:else}
	<p class="flex items-center justify-center gap-2 py-16 text-fg-muted" role="status">
		<Spinner /> Taking you to GitHub to sign in…
	</p>
{/if}
