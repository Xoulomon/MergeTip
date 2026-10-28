<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { Navbar, Footer, BackgroundMotion } from '@mergetip/ui';
	import { onMount } from 'svelte';
	import { auth } from '../lib/auth.svelte';
	import GitHubLoginModal from '../lib/GitHubLoginModal.svelte';

	let { children } = $props();

	let currentTheme = $state<'dark' | 'light'>('dark');

	onMount(() => {
		auth.init();
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
	<title>MergeTip - Non-Custodial Bitcoin Tips for GitHub</title>
</svelte:head>

<div class="mt-app-shell">
	<BackgroundMotion intensity="medium" interactive={true} showGrid={true} />

	<Navbar
		currentPath={page.url.pathname}
		theme={currentTheme}
		ontoggletheme={toggleTheme}
		relayConnected={true}
		walletConnected={auth.session.isAuthenticated}
		walletBalanceSats={auth.session.walletBalanceSats}
		isAuthenticated={auth.session.isAuthenticated}
		userHandle={auth.session.userHandle ?? undefined}
		userName={auth.session.userName ?? undefined}
		avatarUrl={auth.session.avatarUrl ?? undefined}
		lightningAddress={auth.session.lightningAddress}
		nostrPubkey={auth.session.nostrPubkey}
		onlogin={() => auth.openLoginModal()}
		onlogout={() => auth.logout()}
	/>

	<main class="mt-app-content">
		{@render children()}
	</main>

	<Footer />

	<!-- Connect GitHub Account Modal -->
	<GitHubLoginModal
		open={auth.isLoginModalOpen}
		onclose={() => auth.closeLoginModal()}
		onlogin={(handle: string, name?: string, avatar?: string) => auth.login(handle, name, avatar)}
	/>
</div>

<style>
	.mt-app-shell {
		position: relative;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--mt-bg);
		color: var(--mt-fg);
		overflow-x: hidden;
	}

	.mt-app-content {
		position: relative;
		z-index: 1;
		flex: 1;
	}
</style>
