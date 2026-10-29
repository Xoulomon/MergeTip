<script lang="ts">
	import { Button, TextField } from '@mergetip/ui';
	import { MIN_PIN_LENGTH } from '#lib/breez/vault.ts';

	let { busy, onsubmit }: { busy: boolean; onsubmit: (pin: string) => void } = $props();

	let pin = $state('');
	let repeat = $state('');
	let error = $state<string | null>(null);

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!new RegExp(`^\\d{${MIN_PIN_LENGTH},}$`).test(pin)) {
			error = `Use at least ${MIN_PIN_LENGTH} digits.`;
		} else if (pin !== repeat) {
			error = 'The two PINs do not match.';
		} else {
			error = null;
			onsubmit(pin);
		}
	}
</script>

<form class="flex flex-col gap-4" onsubmit={submit} novalidate>
	<p class="text-sm text-fg-muted">
		Choose a PIN to lock the wallet in this browser. You will need it to open the wallet here again.
	</p>
	<TextField
		id="wallet-pin"
		label="PIN"
		type="password"
		inputmode="numeric"
		autocomplete="new-password"
		bind:value={pin}
		{error}
	/>
	<TextField
		id="wallet-pin-repeat"
		label="Repeat PIN"
		type="password"
		inputmode="numeric"
		autocomplete="new-password"
		bind:value={repeat}
	/>
	<div>
		<Button type="submit" variant="primary" loading={busy}>
			{busy ? 'Creating your wallet…' : 'Create wallet'}
		</Button>
	</div>
</form>
