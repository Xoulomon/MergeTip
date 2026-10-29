<script lang="ts">
	import type { Tip } from '@mergetip/api-client';
	import { Alert, Button, Spinner } from '@mergetip/ui';
	import ClaimOptions from '#lib/components/claim/ClaimOptions.svelte';
	import ClaimResult from '#lib/components/claim/ClaimResult.svelte';
	import PledgeSummary from '#lib/components/claim/PledgeSummary.svelte';
	import GitHubMark from '#lib/components/GitHubMark.svelte';
	import { api } from '#lib/api.ts';
	import { run } from '#lib/run.ts';
	import { session, signIn } from '#lib/session.svelte.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let claimed = $state<Tip | null>(null);

	let tip = $derived(claimed ?? data.tip);
	let isReceiver = $derived(
		!!session.me &&
			!!tip &&
			session.me.github_login.toLowerCase() === tip.receiver.login.toLowerCase()
	);

	const PROBLEMS: Record<string, string> = {
		claim_not_found: 'This claim link is not valid',
		claim_expired: 'This pledge has expired'
	};

	async function switchAccount() {
		await run(async () => {
			await api.logout();
			session.clear();
		});
		signIn();
	}
</script>

<svelte:head><title>Claim your sats · MergeTip</title></svelte:head>

<div class="mx-auto flex max-w-md flex-col gap-8 py-4">
	{#if data.problem}
		<div class="flex flex-col items-center gap-4 text-center">
			<p class="text-4xl" aria-hidden="true">⚡</p>
			<h1 class="text-xl font-semibold">
				{PROBLEMS[data.problem.code] ?? 'We could not load this pledge'}
			</h1>
			<p class="text-sm text-fg-muted">{data.problem.message}</p>
			{#if data.problem.isNetwork}
				<Button onclick={() => location.reload()}>Try again</Button>
			{:else}
				<Button href="/">Go to MergeTip</Button>
			{/if}
		</div>
	{:else if tip}
		<PledgeSummary {tip} />

		{#if claimed}
			<ClaimResult token={data.token} initial={claimed} />
		{:else if tip.state !== 'pledged'}
			<Alert tone="info" title="Already claimed">
				This pledge was already claimed. <a class="underline" href="/dashboard">See your tips</a>.
			</Alert>
		{:else if session.status === 'loading' || session.status === 'idle'}
			<p class="flex justify-center"><Spinner label="Checking your sign-in" /></p>
		{:else if !session.me}
			<div class="flex flex-col gap-3 text-center">
				<Button size="lg" variant="primary" block onclick={() => signIn()}>
					<GitHubMark /> Sign in with GitHub to claim
				</Button>
				<p class="text-xs text-fg-muted">
					Sign in as @{tip.receiver.login}. Your GitHub account is all you need.
				</p>
			</div>
		{:else if !isReceiver}
			<Alert tone="warning" title="This pledge is for @{tip.receiver.login}">
				You are signed in as @{session.me.github_login}. Sign in with @{tip.receiver.login}'s GitHub
				account to claim it.
				<Button class="mt-2" size="sm" onclick={switchAccount}>Switch account</Button>
			</Alert>
		{:else}
			<ClaimOptions token={data.token} me={session.me} onclaimed={(result) => (claimed = result)} />
		{/if}

		<p class="text-center text-xs text-fg-muted">
			MergeTip never holds your sats: they go from @{tip.sender.login}'s wallet straight to yours.
			Nothing was charged until you claim.
		</p>
	{/if}
</div>
