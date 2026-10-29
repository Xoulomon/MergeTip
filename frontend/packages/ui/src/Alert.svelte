<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';

	let {
		tone = 'danger',
		title,
		onretry,
		children
	}: {
		tone?: 'danger' | 'warning' | 'info' | 'success';
		title?: string;
		/** Shows a "Try again" button, for errors a retry can fix. */
		onretry?: () => void;
		children: Snippet;
	} = $props();

	const TONES = {
		danger: 'border-danger bg-danger-subtle',
		warning: 'border-warning bg-warning-subtle',
		info: 'border-info bg-info-subtle',
		success: 'border-success bg-success-subtle'
	} as const;
</script>

<div
	class="flex flex-wrap items-start justify-between gap-3 rounded-md border px-4 py-3 text-sm {TONES[
		tone
	]}"
	role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}
>
	<div class="min-w-0">
		{#if title}<p class="font-semibold">{title}</p>{/if}
		<div class="text-fg">{@render children()}</div>
	</div>
	{#if onretry}<Button size="sm" onclick={onretry}>Try again</Button>{/if}
</div>
