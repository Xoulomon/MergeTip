<script lang="ts">
	import { Badge, Button, Card, Dialog, formatSats } from '@mergetip/ui';
	import { api } from '#lib/api.ts';
	import AlbyConnect from '#lib/components/settings/AlbyConnect.svelte';
	import NwcConnectForm from '#lib/components/settings/NwcConnectForm.svelte';
	import { run } from '#lib/run.ts';
	import { session } from '#lib/session.svelte.ts';

	let confirming = $state(false);
	let disconnecting = $state(false);

	let me = $derived(session.me);

	async function disconnect() {
		disconnecting = true;
		const done = await run(async () => {
			await api.disconnectWallet();
			await session.refresh();
		}, 'Wallet disconnected.');
		disconnecting = false;
		if (done) confirming = false;
	}
</script>

<svelte:head><title>Sending wallet · MergeTip</title></svelte:head>

{#if me}
	{#if me.wallet.connected}
		<Card title="Sending wallet" description="Tips you send are paid from this wallet.">
			{#snippet actions()}<Badge tone="success">Connected</Badge>{/snippet}
			<dl class="grid gap-3 text-sm sm:grid-cols-[8rem_1fr]">
				<dt class="text-fg-muted">Relay</dt>
				<dd class="font-mono break-all">{me.wallet.relay ?? 'Unknown'}</dd>
				<dt class="text-fg-muted">Permissions</dt>
				<dd class="flex flex-wrap gap-1">
					{#each me.wallet.methods as method (method)}
						<code class="rounded bg-subtle px-1.5 py-0.5 font-mono text-xs">{method}</code>
					{/each}
				</dd>
				<dt class="text-fg-muted">Limits</dt>
				<dd>
					{formatSats(me.caps.per_tip_max_sats)} per tip, {formatSats(me.caps.daily_max_sats)} per day
					· <a class="text-info underline" href="/settings/limits">Change</a>
				</dd>
			</dl>
			<div class="mt-4">
				<Button variant="danger" onclick={() => (confirming = true)}>Disconnect wallet</Button>
			</div>
		</Card>
	{:else}
		<Card
			title="Connect your sending wallet"
			description="MergeTip asks your wallet to pay each verified tip. It never holds your sats or keys."
		>
			<NwcConnectForm />
		</Card>
		<Card title="Don't have a connection string?" headingLevel={3}>
			<AlbyConnect />
		</Card>
	{/if}
{/if}

<Dialog
	bind:open={confirming}
	title="Disconnect your wallet?"
	description="Tips you send will wait for 24 hours for you to reconnect, then be cancelled. Tips already paid are not affected."
>
	<p class="text-sm text-fg-muted">
		To stop all spending immediately, you can also revoke the connection in your wallet.
	</p>
	{#snippet footer()}
		<Button onclick={() => (confirming = false)}>Keep connected</Button>
		<Button variant="danger" loading={disconnecting} onclick={disconnect}>Disconnect</Button>
	{/snippet}
</Dialog>
