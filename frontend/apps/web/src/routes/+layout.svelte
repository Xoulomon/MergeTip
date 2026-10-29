<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { Toaster } from '@mergetip/ui';
	import SiteFooter from '#lib/components/SiteFooter.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import { session } from '#lib/session.svelte.ts';

	let { children } = $props();

	// The session cookie belongs to the API's origin, so it is read in the browser only.
	onMount(() => {
		session.load().catch(() => {
			// The header stays in its signed-out state; protected pages show the error themselves.
		});
	});
</script>

<div class="flex min-h-screen flex-col">
	<SiteHeader />
	<main id="main" class="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
		{@render children()}
	</main>
	<SiteFooter />
</div>
<Toaster />
