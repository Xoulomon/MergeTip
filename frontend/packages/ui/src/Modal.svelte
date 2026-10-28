<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';

	let {
		open = false,
		title,
		subtitle,
		onclose,
		children,
		footer
	}: {
		open: boolean;
		title?: string;
		subtitle?: string;
		onclose: () => void;
		children: Snippet;
		footer?: Snippet;
	} = $props();

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) {
			onclose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class="mt-modal-backdrop"
		onclick={onclose}
		onkeydown={(e) => {
			if (e.key === 'Escape') onclose();
		}}
		role="presentation"
	>
		<div
			class="mt-modal-dialog"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<div class="mt-modal-header">
				<div>
					{#if title}
						<h3 class="mt-modal-title">{title}</h3>
					{/if}
					{#if subtitle}
						<p class="mt-modal-subtitle">{subtitle}</p>
					{/if}
				</div>
				<button class="mt-modal-close" onclick={onclose} aria-label="Close modal">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
						<path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
					</svg>
				</button>
			</div>

			<div class="mt-modal-body">
				{@render children()}
			</div>

			{#if footer}
				<div class="mt-modal-footer">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.mt-modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(1, 4, 9, 0.65);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
		padding: 16px;
		animation: fadeIn 0.15s ease-out;
	}

	.mt-modal-dialog {
		background: var(--mt-surface-raised);
		border: 1px solid var(--mt-border);
		border-radius: 10px;
		width: 100%;
		max-width: 520px;
		box-shadow: var(--mt-shadow-lg);
		display: flex;
		flex-direction: column;
		max-height: 90vh;
		overflow: hidden;
		animation: scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);
		outline: none;
	}

	.mt-modal-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid var(--mt-border-muted);
		gap: 12px;
	}

	.mt-modal-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--mt-fg);
		margin: 0;
	}

	.mt-modal-subtitle {
		font-size: 13px;
		color: var(--mt-fg-muted);
		margin: 3px 0 0 0;
	}

	.mt-modal-close {
		background: transparent;
		border: none;
		color: var(--mt-fg-muted);
		font-size: 16px;
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
		line-height: 1;
		transition: all 0.15s ease;
	}

	.mt-modal-close:hover {
		color: var(--mt-fg);
		background: var(--mt-surface-hover);
	}

	.mt-modal-body {
		padding: 20px;
		overflow-y: auto;
		color: var(--mt-fg);
		font-size: 14px;
	}

	.mt-modal-footer {
		padding: 14px 20px;
		border-top: 1px solid var(--mt-border-muted);
		background: var(--mt-bg-subtle);
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 10px;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes scaleUp {
		from {
			transform: scale(0.96);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>
