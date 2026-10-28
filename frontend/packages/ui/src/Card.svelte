<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		subtitle,
		badge,
		action,
		footer,
		children,
		hover = false,
		padding = 'normal'
	}: {
		title?: string | Snippet;
		subtitle?: string | Snippet;
		badge?: Snippet;
		action?: Snippet;
		footer?: Snippet;
		children: Snippet;
		hover?: boolean;
		padding?: 'none' | 'sm' | 'normal' | 'lg';
	} = $props();
</script>

<div class="mt-card {hover ? 'mt-card-hover' : ''}">
	{#if title || subtitle || badge || action}
		<div class="mt-card-header">
			<div class="mt-card-header-left">
				{#if title}
					<div class="mt-card-title">
						{#if typeof title === 'string'}
							<h3>{title}</h3>
						{:else}
							{@render title()}
						{/if}
						{#if badge}
							<div class="mt-card-badge">{@render badge()}</div>
						{/if}
					</div>
				{/if}
				{#if subtitle}
					<div class="mt-card-subtitle">
						{#if typeof subtitle === 'string'}
							<p>{subtitle}</p>
						{:else}
							{@render subtitle()}
						{/if}
					</div>
				{/if}
			</div>
			{#if action}
				<div class="mt-card-action">
					{@render action()}
				</div>
			{/if}
		</div>
	{/if}

	<div class="mt-card-body mt-card-body-{padding}">
		{@render children()}
	</div>

	{#if footer}
		<div class="mt-card-footer">
			{@render footer()}
		</div>
	{/if}
</div>

<style>
	.mt-card {
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		border-radius: 8px;
		box-shadow: var(--mt-shadow-sm);
		overflow: hidden;
		transition: all 0.2s ease-in-out;
	}

	.mt-card-hover:hover {
		border-color: var(--mt-fg-subtle);
		box-shadow: var(--mt-shadow-md);
		transform: translateY(-1px);
	}

	.mt-card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 18px;
		border-bottom: 1px solid var(--mt-border-muted);
		background: var(--mt-surface);
		gap: 12px;
	}

	.mt-card-header-left {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.mt-card-title {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.mt-card-title h3 {
		font-size: 15px;
		font-weight: 600;
		color: var(--mt-fg);
		margin: 0;
	}

	.mt-card-subtitle p {
		font-size: 13px;
		color: var(--mt-fg-muted);
		margin: 0;
	}

	.mt-card-body-none {
		padding: 0;
	}

	.mt-card-body-sm {
		padding: 12px;
	}

	.mt-card-body-normal {
		padding: 18px;
	}

	.mt-card-body-lg {
		padding: 24px;
	}

	.mt-card-footer {
		padding: 12px 18px;
		border-top: 1px solid var(--mt-border-muted);
		background: var(--mt-bg-subtle);
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 13px;
		color: var(--mt-fg-muted);
	}
</style>
