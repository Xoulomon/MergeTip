<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { Navbar, Footer } from '@mergetip/ui';
	import { onMount } from 'svelte';

	let { children } = $props();

	let currentTheme = $state<'dark' | 'light'>('dark');

	onMount(() => {
		const stored = localStorage.getItem('mergetip-theme');
		if (stored === 'light' || stored === 'dark') {
			currentTheme = stored;
		} else {
			const prefDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			currentTheme = prefDark ? 'dark' : 'light';
		}
		document.documentElement.dataset.theme = currentTheme;
	});

	function toggleTheme() {
		currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
		document.documentElement.dataset.theme = currentTheme;
		localStorage.setItem('mergetip-theme', currentTheme);
	}
</script>

<svelte:head>
	<title>MergeTip ⚡ Non-Custodial Bitcoin Tips for GitHub</title>
</svelte:head>

<div class="mt-app-shell">
	<Navbar
		currentPath={page.url.pathname}
		theme={currentTheme}
		ontoggletheme={toggleTheme}
		relayConnected={true}
		walletConnected={true}
		walletBalanceSats={385000}
		userHandle="xoulomon"
		userName="Xoulomon"
		lightningAddress="xoulomon@getalby.com"
		nostrPubkey="npub1xoulomon89a74cf8290e219b48c"
	/>

	<div class="mt-app-content">
		{@render children()}
	</div>

	<Footer />
</div>

<style>
	.mt-app-shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--mt-bg);
		color: var(--mt-fg);
	}

	.mt-app-content {
		flex: 1;
	}
</style>
