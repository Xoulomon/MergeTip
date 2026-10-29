<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '@mergetip/ui';

	let title = $derived(
		page.status === 404
			? 'Page not found'
			: page.status === 503
				? 'MergeTip is unavailable'
				: 'Something went wrong'
	);
</script>

<svelte:head><title>{title} · MergeTip</title></svelte:head>

<div class="mx-auto max-w-md py-16 text-center">
	<p class="text-4xl text-bolt" aria-hidden="true">⚡</p>
	<h1 class="mt-4 text-2xl font-semibold">{title}</h1>
	<p class="mt-2 text-fg-muted">{page.error?.message}</p>
	<div class="mt-6 flex justify-center gap-2">
		{#if page.status !== 404}
			<Button onclick={() => location.reload()}>Try again</Button>
		{/if}
		<Button variant="primary" href="/">Go home</Button>
	</div>
</div>
