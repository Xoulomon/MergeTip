<script lang="ts">
	import { onMount } from 'svelte';
	import { Alert, Avatar, Button, Card, Spinner } from '@mergetip/ui';
	import { api } from '#lib/api.ts';
	import { detectExtension, handOver } from '#lib/extension-bridge.ts';
	import { handleError } from '#lib/run.ts';
	import { session } from '#lib/session.svelte.ts';

	type Status = 'detecting' | 'missing' | 'ready' | 'connecting' | 'connected' | 'failed';
	let status = $state<Status>('detecting');
	let error = $state<string | null>(null);

	onMount(async () => {
		status = (await detectExtension()) ? 'ready' : 'missing';
	});

	async function connect() {
		const me = session.me;
		if (!me) return;
		status = 'connecting';
		error = null;
		try {
			const { token, expires_at } = await api.extensionToken();
			error = await handOver(token, expires_at, me.github_login);
			status = error ? 'failed' : 'connected';
		} catch (cause) {
			error = handleError(cause);
			status = 'failed';
		}
	}
</script>

<svelte:head><title>Connect the extension · MergeTip</title></svelte:head>

<div class="mx-auto max-w-lg">
	<Card title="Connect the MergeTip extension">
		{#if status === 'detecting'}
			<p class="flex items-center gap-2 text-sm text-fg-muted">
				<Spinner /> Looking for the extension…
			</p>
		{:else if status === 'missing'}
			<Alert tone="warning" title="Extension not found">
				Install the MergeTip extension for Chrome or Firefox, then open this page from its popup.
			</Alert>
			<Button class="mt-4" onclick={() => location.reload()}>Check again</Button>
		{:else if status === 'connected'}
			<Alert tone="success" title="Connected">
				The extension can now tip as @{session.me?.github_login}. You can close this tab and use ⚡
				Tip on GitHub.
			</Alert>
		{:else if session.me}
			<div class="flex flex-col gap-4">
				<div class="flex items-center gap-3">
					<Avatar login={session.me.github_login} src={session.me.avatar_url} size={32} />
					<p class="text-sm">Signed in as <strong>@{session.me.github_login}</strong></p>
				</div>
				<p class="text-sm text-fg-muted">
					The extension gets a 7-day token that can post /tip comments and read your limits as you.
					It never sees your wallet connection and cannot confirm large tips. Disconnect it from the
					extension's popup at any time; deleting your account revokes it everywhere.
				</p>
				{#if error}<Alert>{error}</Alert>{/if}
				<div>
					<Button variant="primary" loading={status === 'connecting'} onclick={connect}>
						Connect extension
					</Button>
				</div>
			</div>
		{/if}
	</Card>
</div>
