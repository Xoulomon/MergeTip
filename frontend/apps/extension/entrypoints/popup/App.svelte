<script lang="ts">
	import { schemas, type Me } from '@mergetip/api-client';
	import { Alert, Avatar, Button, Spinner, TextField } from '@mergetip/ui';
	import { browser } from 'wxt/browser';
	import TipForm from '../../components/TipForm.svelte';
	import { WEB_URL } from '../../lib/config';
	import { parseThread, type Thread } from '../../lib/github';
	import { BackgroundError, ask } from '../../lib/messages';

	type View =
		| { kind: 'loading' }
		| { kind: 'signed-out' }
		| { kind: 'error'; message: string }
		| { kind: 'ready'; me: Me; thread: Thread | null };

	let view = $state<View>({ kind: 'loading' });
	let receiverInput = $state('');
	let receiver = $state<string | null>(null);

	async function load() {
		view = { kind: 'loading' };
		try {
			const status = await ask({ type: 'status' });
			if (!status.connected) return void (view = { kind: 'signed-out' });
			const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
			const url = tab?.url ? new URL(tab.url) : null;
			const thread = url?.hostname === 'github.com' ? parseThread(url.pathname) : null;
			view = { kind: 'ready', me: status.me, thread };
			if (thread && tab?.id !== undefined) {
				const author = await browser.tabs
					.sendMessage(tab.id, { type: 'thread-author' })
					.catch(() => null);
				if (typeof author === 'string') receiver = receiverInput = author;
			}
		} catch (error) {
			view = {
				kind: 'error',
				message: error instanceof BackgroundError ? error.message : 'Could not reach MergeTip.'
			};
		}
	}

	async function disconnect() {
		await ask({ type: 'disconnect' });
		view = { kind: 'signed-out' };
	}

	function chooseReceiver(event: SubmitEvent) {
		event.preventDefault();
		const parsed = schemas.githubLogin.safeParse(receiverInput);
		if (parsed.success) receiver = parsed.data;
	}

	load();
</script>

<main class="flex w-[22rem] flex-col gap-4 p-4">
	<header class="flex items-center gap-2">
		<span class="text-lg text-bolt" aria-hidden="true">⚡</span>
		<h1 class="font-semibold">MergeTip</h1>
		{#if view.kind === 'ready'}
			<span class="ml-auto flex items-center gap-2 text-xs text-fg-muted">
				<Avatar login={view.me.github_login} src={view.me.avatar_url} />
				@{view.me.github_login}
			</span>
		{/if}
	</header>

	{#if view.kind === 'loading'}
		<p class="flex items-center gap-2 text-sm text-fg-muted"><Spinner /> Loading…</p>
	{:else if view.kind === 'signed-out'}
		<p class="text-sm text-fg-muted">
			Connect the extension to your MergeTip account to tip from GitHub in one click.
		</p>
		<Button variant="primary" block onclick={() => ask({ type: 'open-connect' })}>
			Connect MergeTip
		</Button>
	{:else if view.kind === 'error'}
		<Alert onretry={load}>{view.message}</Alert>
	{:else}
		{#if !view.me.wallet.connected}
			<Alert tone="warning">
				Connect a wallet in <a
					class="underline"
					href="{WEB_URL}/settings/wallet"
					target="_blank"
					rel="noopener">MergeTip settings</a
				> before tipping. Tips wait 24 hours for it.
			</Alert>
		{/if}
		{#if !view.thread}
			<p class="text-sm text-fg-muted">
				Open a pull request or issue on GitHub, then click ⚡ Tip next to someone's name.
			</p>
		{:else if receiver}
			<TipForm me={view.me} thread={view.thread} {receiver} />
			<button
				type="button"
				class="self-start text-xs text-fg-muted underline"
				onclick={() => (receiver = null)}>Tip someone else</button
			>
		{:else}
			<form class="flex flex-col gap-3" onsubmit={chooseReceiver} novalidate>
				<TextField
					id="receiver"
					label="Who do you want to tip?"
					prefix="@"
					bind:value={receiverInput}
					autocomplete="off"
					autocapitalize="none"
					spellcheck="false"
				/>
				<Button type="submit" variant="primary">Continue</Button>
			</form>
		{/if}
		<footer class="flex justify-between border-t border-default pt-3 text-xs">
			<a class="text-info hover:underline" href="{WEB_URL}/dashboard" target="_blank" rel="noopener"
				>Dashboard</a
			>
			<button
				type="button"
				class="text-fg-muted hover:text-fg hover:underline"
				onclick={disconnect}
			>
				Disconnect
			</button>
		</footer>
	{/if}
</main>
