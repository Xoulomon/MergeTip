<script lang="ts">
	import type { Snippet } from 'svelte';
	import { formatFiatUSD } from './format';

	let {
		label,
		sats,
		fiat,
		icon,
		trend,
		trendUp = true,
		subtitle,
		accent = 'default'
	}: {
		label: string;
		sats: number;
		fiat?: string;
		icon?: Snippet;
		trend?: string;
		trendUp?: boolean;
		subtitle?: string;
		accent?: 'default' | 'bolt' | 'success' | 'warning' | 'info';
	} = $props();

	let fiatDisplay = $derived(fiat ?? formatFiatUSD(sats));
</script>

<div class="mt-stat-card mt-stat-{accent}">
	<div class="mt-stat-header">
		<span class="mt-stat-label">{label}</span>
		{#if icon}
			<div class="mt-stat-icon">
				{@render icon()}
			</div>
		{/if}
	</div>

	<div class="mt-stat-main">
		<div class="mt-stat-sats">
			{sats.toLocaleString('en-US')}
			<span class="mt-stat-unit">sats</span>
		</div>
		<div class="mt-stat-fiat">
			≈ {fiatDisplay}
		</div>
	</div>

	{#if trend || subtitle}
		<div class="mt-stat-footer">
			{#if trend}
				<span class="mt-stat-trend {trendUp ? 'mt-trend-up' : 'mt-trend-down'}">
					{trendUp ? '↑' : '↓'}
					{trend}
				</span>
			{/if}
			{#if subtitle}
				<span class="mt-stat-subtext">{subtitle}</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	.mt-stat-card {
		background: var(--mt-glass-bg);
		backdrop-filter: var(--mt-glass-blur);
		-webkit-backdrop-filter: var(--mt-glass-blur);
		border: 1px solid var(--mt-glass-border);
		border-radius: 12px;
		padding: 16px 18px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		box-shadow: var(--mt-shadow-sm);
		transition:
			transform var(--duration-normal) var(--ease-out),
			box-shadow var(--duration-normal) var(--ease-out),
			border-color var(--duration-normal) var(--ease-out);
		position: relative;
		overflow: hidden;
	}

	.mt-stat-card:hover {
		box-shadow:
			var(--mt-shadow-md),
			0 0 16px var(--mt-bolt-subtle);
		border-color: var(--mt-bolt);
		transform: translateY(-2px);
	}

	.mt-stat-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.mt-stat-label {
		font-size: 13px;
		font-weight: 500;
		color: var(--mt-fg-muted);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.mt-stat-icon {
		color: var(--mt-fg-muted);
		display: flex;
		align-items: center;
	}

	.mt-stat-bolt .mt-stat-icon {
		color: var(--mt-bolt);
	}
	.mt-stat-success .mt-stat-icon {
		color: var(--mt-success);
	}
	.mt-stat-warning .mt-stat-icon {
		color: var(--mt-warning);
	}

	.mt-stat-main {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.mt-stat-sats {
		font-size: 26px;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--mt-fg);
		display: flex;
		align-items: baseline;
		gap: 6px;
		font-variant-numeric: tabular-nums;
	}

	.mt-stat-unit {
		font-size: 14px;
		font-weight: 500;
		color: var(--mt-bolt);
	}

	.mt-stat-fiat {
		font-size: 13px;
		color: var(--mt-fg-muted);
		font-variant-numeric: tabular-nums;
	}

	.mt-stat-footer {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		padding-top: 4px;
		border-top: 1px solid var(--mt-border-muted);
	}

	.mt-stat-trend {
		font-weight: 600;
	}
	.mt-trend-up {
		color: var(--mt-success);
	}
	.mt-trend-down {
		color: var(--mt-danger);
	}

	.mt-stat-subtext {
		color: var(--mt-fg-subtle);
	}
</style>
