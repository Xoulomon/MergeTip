<script lang="ts">
	import { OTP_LENGTH } from '@mergetip/api-client';

	let {
		value = $bindable(''),
		disabled = false,
		error = null
	}: { value?: string; disabled?: boolean; error?: string | null } = $props();

	// Keeps digits only, so a pasted "123 456" or "Code: 123456" still works.
	function onInput(event: Event & { currentTarget: HTMLInputElement }) {
		value = event.currentTarget.value.replace(/\D/g, '').slice(0, OTP_LENGTH);
		event.currentTarget.value = value;
	}
</script>

<div class="flex flex-col gap-1.5">
	<label for="otp" class="text-sm font-semibold">Code from your email</label>
	<input
		id="otp"
		class="mt-input max-w-40 text-center font-mono text-lg tracking-[0.4em]"
		{value}
		oninput={onInput}
		{disabled}
		inputmode="numeric"
		autocomplete="one-time-code"
		placeholder="••••••"
		aria-invalid={error ? true : undefined}
		aria-describedby={error ? 'otp-error' : undefined}
	/>
	{#if error}<p id="otp-error" class="text-xs font-medium text-danger">{error}</p>{/if}
</div>
