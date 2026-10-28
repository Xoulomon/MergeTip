<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let {
		variant = 'default',
		size = 'md',
		loading = false,
		disabled = false,
		children,
		icon,
		...rest
	}: HTMLButtonAttributes & {
		variant?: 'default' | 'primary' | 'danger' | 'outline' | 'ghost' | 'bolt';
		size?: 'sm' | 'md' | 'lg';
		loading?: boolean;
		icon?: Snippet;
		children?: Snippet;
	} = $props();
</script>

<button
	class="mt-btn mt-btn-{variant} mt-btn-{size}"
	disabled={disabled || loading}
	aria-busy={loading}
	{...rest}
>
	{#if loading}
		<svg class="mt-btn-spinner" viewBox="0 0 24 24" fill="none">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	{:else if icon}
		<span class="mt-btn-icon">
			{@render icon()}
		</span>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</button>

<style>
	.mt-btn {
		font-family: inherit;
		font-weight: 500;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s ease-in-out;
		white-space: nowrap;
		user-select: none;
		line-height: 1.4;
		text-decoration: none;
	}

	.mt-btn:focus-visible {
		outline: 2px solid var(--mt-border-active);
		outline-offset: 2px;
	}

	.mt-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Sizes */
	.mt-btn-sm {
		font-size: 12px;
		padding: 3px 10px;
	}
	.mt-btn-md {
		font-size: 14px;
		padding: 6px 14px;
	}
	.mt-btn-lg {
		font-size: 15px;
		padding: 10px 20px;
	}

	/* Variants */
	.mt-btn-default {
		background: var(--mt-btn-bg);
		color: var(--mt-fg);
		border: 1px solid var(--mt-border);
		box-shadow: var(--mt-shadow-sm);
	}
	.mt-btn-default:hover:not(:disabled) {
		background: var(--mt-btn-hover);
		border-color: var(--mt-fg-subtle);
	}

	.mt-btn-primary {
		background: var(--mt-accent);
		color: var(--mt-accent-fg);
		border: 1px solid rgba(27, 31, 36, 0.15);
		box-shadow: 0 1px 0 rgba(27, 31, 36, 0.1);
	}
	.mt-btn-primary:hover:not(:disabled) {
		background: var(--mt-accent-hover);
	}

	.mt-btn-bolt {
		background: var(--mt-bolt);
		color: #000000;
		border: 1px solid rgba(0, 0, 0, 0.15);
		box-shadow: 0 1px 3px var(--mt-bolt-glow);
		font-weight: 600;
	}
	.mt-btn-bolt:hover:not(:disabled) {
		background: var(--mt-bolt-hover);
		box-shadow: 0 2px 8px var(--mt-bolt-glow);
	}

	.mt-btn-danger {
		background: var(--mt-danger-bg);
		color: var(--mt-danger);
		border: 1px solid var(--mt-danger-border);
	}
	.mt-btn-danger:hover:not(:disabled) {
		background: var(--mt-danger);
		color: #ffffff;
	}

	.mt-btn-outline {
		background: transparent;
		color: var(--mt-fg);
		border: 1px solid var(--mt-border);
	}
	.mt-btn-outline:hover:not(:disabled) {
		background: var(--mt-surface-hover);
	}

	.mt-btn-ghost {
		background: transparent;
		color: var(--mt-fg);
		border: 1px solid transparent;
	}
	.mt-btn-ghost:hover:not(:disabled) {
		background: var(--mt-surface-hover);
	}

	.mt-btn-spinner {
		width: 14px;
		height: 14px;
		animation: spin 1s linear infinite;
	}
	.mt-btn-icon {
		display: inline-flex;
		align-items: center;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
