<script lang="ts">
	import { firstIssue, schemas } from '@mergetip/api-client';
	import { Button, TextField, toasts } from '@mergetip/ui';
	import { api } from '#lib/api.ts';
	import QrScanner from '#lib/components/QrScanner.svelte';
	import { handleError } from '#lib/run.ts';
	import { session } from '#lib/session.svelte.ts';

	// The connection string is a password: it lives only in this field until it is sent once,
	// and is cleared straight after, whatever the outcome.
	let uri = $state('');
	let reveal = $state(false);
	let touched = $state(false);
	let error = $state<string | null>(null);
	let saving = $state(false);

	let clientError = $derived(touched ? firstIssue(schemas.nwcUri, uri) : null);

	const looksLikeNwc = (value: string) => value.startsWith('nostr+walletconnect://');

	async function connect(event: SubmitEvent) {
		event.preventDefault();
		touched = true;
		if (firstIssue(schemas.nwcUri, uri)) return;
		saving = true;
		error = null;
		const secret = uri.trim();
		uri = '';
		touched = false;
		reveal = false;
		try {
			session.set(await api.connectWallet(secret));
			toasts.success('Wallet connected. You can tip now.');
		} catch (cause) {
			error = handleError(cause);
		} finally {
			saving = false;
		}
	}
</script>

<form class="flex flex-col gap-4" onsubmit={connect} novalidate>
	<TextField
		id="nwc-uri"
		label="Wallet connection string"
		type={reveal ? 'text' : 'password'}
		bind:value={uri}
		placeholder="nostr+walletconnect://…"
		autocomplete="off"
		spellcheck="false"
		error={clientError ?? error}
		hint="Find it in your wallet's Nostr Wallet Connect (NWC) settings. Give it pay_invoice permission and a budget."
		onblur={() => (touched = uri.length > 0)}
	>
		{#snippet trailing()}
			<Button
				size="sm"
				variant="invisible"
				aria-pressed={reveal}
				onclick={() => (reveal = !reveal)}
				aria-controls="nwc-uri">{reveal ? 'Hide' : 'Show'}</Button
			>
		{/snippet}
	</TextField>
	<div class="flex flex-wrap gap-2">
		<Button type="submit" variant="primary" loading={saving}>Connect wallet</Button>
		<QrScanner
			label="Scan your wallet's connection QR code"
			accept={looksLikeNwc}
			onscan={(value) => ((uri = value), (touched = true))}
		/>
	</div>
</form>
