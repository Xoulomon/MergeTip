<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let {
		variant = 'default',
		children,
		...rest
	}: HTMLButtonAttributes & { variant?: 'default' | 'primary'; children: Snippet } = $props();
</script>

<button class="mt-btn mt-btn-{variant}" {...rest}>
	{@render children()}
</button>

<style>
	.mt-btn {
		font: inherit;
		padding: 5px 16px;
		border-radius: 6px;
		border: 1px solid var(--mt-border);
		background: var(--mt-btn-bg);
		color: var(--mt-fg);
		cursor: pointer;
	}
	.mt-btn-primary {
		background: var(--mt-accent);
		border-color: transparent;
		color: var(--mt-accent-fg);
	}
</style>
