<script lang="ts">
	import { firstIssue, schemas, type Me } from '@mergetip/api-client';
	import { Button, TextField } from '@mergetip/ui';
	import { api } from '#lib/api.ts';
	import { handleError } from '#lib/run.ts';

	let {
		initial = '',
		submitLabel = 'Save address',
		onsaved
	}: {
		initial?: string;
		submitLabel?: string;
		/** Called with the updated profile once the API has verified and saved the address. */
		onsaved: (me: Me) => void | Promise<void>;
	} = $props();

	// The field starts from the saved address; edits are local until saved.
	// svelte-ignore state_referenced_locally
	let address = $state(initial);
	let touched = $state(false);
	let error = $state<string | null>(null);
	let saving = $state(false);

	let clientError = $derived(
		touched && address ? firstIssue(schemas.lightningAddress, address) : null
	);

	async function save(event: SubmitEvent) {
		event.preventDefault();
		touched = true;
		const parsed = schemas.lightningAddress.safeParse(address);
		if (!parsed.success) {
			error = parsed.error.issues[0]?.message ?? null;
			return;
		}
		saving = true;
		error = null;
		try {
			// The API resolves the address over LNURL before saving it (FR-6.4).
			await onsaved(await api.setLightningAddress(parsed.data));
		} catch (cause) {
			error = handleError(cause);
		} finally {
			saving = false;
		}
	}
</script>

<form class="flex flex-col gap-4" onsubmit={save} novalidate>
	<TextField
		id="lightning-address"
		label="Lightning address"
		type="email"
		inputmode="email"
		bind:value={address}
		placeholder="you@getalby.com"
		autocomplete="off"
		spellcheck="false"
		error={clientError ?? error}
		hint="Looks like an email address. Your wallet shows it under Receive."
		oninput={() => (error = null)}
		onblur={() => (touched = true)}
	/>
	<div>
		<Button type="submit" variant="primary" loading={saving}>
			{saving ? 'Checking address…' : submitLabel}
		</Button>
	</div>
</form>
