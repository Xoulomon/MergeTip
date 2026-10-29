<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'neutral',
		dot = true,
		size = 'md',
		children
	}: {
		variant?:
			| 'paid'
			| 'pledged'
			| 'verifying'
			| 'held'
			| 'paying'
			| 'expired'
			| 'failed'
			| 'neutral'
			| 'bolt'
			| 'accent';
		dot?: boolean;
		size?: 'sm' | 'md';
		children?: Snippet;
	} = $props();

	const variantLabelMap: Record<string, string> = {
		paid: 'Paid',
		pledged: 'Pledged',
		verifying: 'Verifying',
		held: 'Held on-merge',
		paying: 'Paying',
		expired: 'Expired',
		failed: 'Failed',
		neutral: 'Active',
		bolt: 'Lightning',
		accent: 'GitHub'
	};
</script>

<span class="mt-badge mt-badge-{variant} mt-badge-{size}">
	{#if dot}
		<span class="mt-badge-dot" aria-hidden="true"></span>
	{/if}
	{#if children}
		{@render children()}
	{:else}
		{variantLabelMap[variant] ?? variant}
	{/if}
</span>

<style>
	.mt-badge {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		border-radius: 9999px;
		font-weight: 500;
		line-height: 1;
		white-space: nowrap;
		border: 1px solid transparent;
		user-select: none;
	}

	.mt-badge-sm {
		font-size: 11px;
		padding: 2px 7px;
	}

	.mt-badge-md {
		font-size: 12px;
		padding: 3px 9px;
	}

	.mt-badge-dot {
		width: 6px;
		height: 6px;
		border-radius: 9999px;
		background: currentColor;
	}

	/* Variants */
	.mt-badge-paid {
		background: var(--mt-success-bg);
		color: var(--mt-success);
		border-color: var(--mt-success-border);
	}

	.mt-badge-pledged {
		background: var(--mt-warning-bg);
		color: var(--mt-warning);
		border-color: var(--mt-warning-border);
	}

	.mt-badge-verifying,
	.mt-badge-paying {
		background: var(--mt-info-bg);
		color: var(--mt-info);
		border-color: var(--mt-info-border);
	}

	.mt-badge-held {
		background: var(--mt-purple-bg);
		color: var(--mt-purple);
		border-color: var(--mt-purple-border);
	}

	.mt-badge-expired,
	.mt-badge-failed {
		background: var(--mt-danger-bg);
		color: var(--mt-danger);
		border-color: var(--mt-danger-border);
	}

	.mt-badge-neutral {
		background: var(--mt-surface-hover);
		color: var(--mt-fg-muted);
		border-color: var(--mt-border);
	}

	.mt-badge-bolt {
		background: var(--mt-bolt-subtle);
		color: var(--mt-bolt);
		border-color: var(--mt-bolt);
	}

	.mt-badge-accent {
		background: var(--mt-accent-subtle);
		color: var(--mt-accent);
		border-color: var(--mt-accent);
	}
</style>
