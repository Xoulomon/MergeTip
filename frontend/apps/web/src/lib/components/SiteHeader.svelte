<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Avatar, Button } from '@mergetip/ui';
	import { api } from '#lib/api.ts';
	import { INSTALL_APP_URL } from '#lib/links.ts';
	import { run } from '#lib/run.ts';
	import { session, signIn } from '#lib/session.svelte.ts';
	import GitHubMark from './GitHubMark.svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	const NAV = [
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/settings/wallet', label: 'Settings', match: '/settings' }
	];

	let signingOut = $state(false);

	async function signOut() {
		signingOut = true;
		await run(async () => {
			await api.logout();
			// Leave signed-in pages first, or their guard would send us to GitHub sign-in.
			await goto('/');
			session.clear();
		}, 'Signed out.');
		signingOut = false;
	}
</script>

<a
	href="#main"
	class="sr-only z-50 rounded-md bg-canvas px-3 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
>
	Skip to content
</a>
<header class="border-b border-default bg-subtle">
	<div class="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
		<a href="/" class="flex items-center gap-2 font-semibold" aria-label="MergeTip home">
			<span class="text-xl text-bolt" aria-hidden="true">⚡</span>
			<span>MergeTip</span>
		</a>

		{#if session.me}
			<nav aria-label="Main" class="flex items-center gap-1 text-sm">
				{#each NAV as item (item.href)}
					{@const current = page.url.pathname.startsWith(item.match ?? item.href)}
					<a
						href={item.href}
						class="rounded-md px-2 py-1 hover:bg-hover {current
							? 'font-semibold'
							: 'text-fg-muted'}"
						aria-current={current ? 'page' : undefined}>{item.label}</a
					>
				{/each}
			</nav>
		{/if}

		<div class="ml-auto flex items-center gap-2">
			<ThemeToggle />
			{#if session.me}
				<span class="hidden items-center gap-2 text-sm sm:flex">
					<Avatar login={session.me.github_login} src={session.me.avatar_url} />
					<span class="text-fg-muted">@{session.me.github_login}</span>
				</span>
				<Button size="sm" loading={signingOut} onclick={signOut}>Sign out</Button>
			{:else if session.status !== 'loading'}
				<span class="hidden sm:contents">
					<Button size="sm" href={INSTALL_APP_URL}>Install GitHub App</Button>
				</span>
				<Button size="sm" variant="primary" onclick={() => signIn('/dashboard')}>
					<GitHubMark size={14} /> Sign in
				</Button>
			{/if}
		</div>
	</div>
</header>
