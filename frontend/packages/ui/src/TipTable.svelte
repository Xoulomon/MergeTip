<script lang="ts">
	import Badge from './Badge.svelte';
	import Button from './Button.svelte';
	import { formatSats, formatFiatUSD, formatRelativeTime } from './format';

	export interface TipRow {
		id: string;
		sender: string;
		receiver: string;
		amount_sats: number;
		on_merge: boolean;
		state: 'paid' | 'pledged' | 'verifying' | 'held' | 'paying' | 'expired' | 'failed';
		repo: string;
		pr_number: number;
		pr_title: string;
		note?: string;
		created_at: string;
	}

	let {
		tips = [],
		onselect
	}: {
		tips: TipRow[];
		onselect?: (tip: TipRow) => void;
	} = $props();
</script>

<div class="mt-table-wrapper">
	<table class="mt-table">
		<thead>
			<tr>
				<th>Work / Reference</th>
				<th>Contributor</th>
				<th>Amount</th>
				<th>Trigger</th>
				<th>Status</th>
				<th>Time</th>
				<th class="text-right">Action</th>
			</tr>
		</thead>
		<tbody>
			{#if tips.length === 0}
				<tr>
					<td colspan="7" class="mt-empty-row">
						<div class="mt-empty-state">
							<p>No tips found matching the filter.</p>
						</div>
					</td>
				</tr>
			{:else}
				{#each tips as tip (tip.id)}
					<tr>
						<td>
							<div class="mt-pr-cell">
								<a
									href="https://github.com/{tip.repo}/pull/{tip.pr_number}"
									target="_blank"
									rel="noreferrer"
									class="mt-pr-link"
								>
									<span class="mt-pr-repo">{tip.repo}</span>
									<span class="mt-pr-num">#{tip.pr_number}</span>
								</a>
								<span class="mt-pr-title" title={tip.pr_title}>{tip.pr_title}</span>
							</div>
						</td>

						<td>
							<div class="mt-user-cell">
								<img
									src="https://avatars.githubusercontent.com/{tip.receiver}"
									alt="@{tip.receiver}"
									class="mt-avatar"
									onerror={(e) => {
										const el = e.currentTarget as HTMLImageElement;
										el.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="%239198a1"><circle cx="12" cy="12" r="10"/></svg>';
									}}
								/>
								<span class="mt-handle">@{tip.receiver}</span>
							</div>
						</td>

						<td>
							<div class="mt-amount-cell">
								<span class="mt-sats">{tip.amount_sats.toLocaleString('en-US')} sats</span>
								<span class="mt-fiat">≈ {formatFiatUSD(tip.amount_sats)}</span>
							</div>
						</td>

						<td>
							{#if tip.on_merge}
								<span class="mt-trigger-pill mt-trigger-merge" title="Paid automatically when PR merges">
									<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
										<path d="M5.45 5.154A4.25 4.25 0 0 0 9.25 8h1.838a3.25 3.25 0 1 1 0 1.5H9.25A5.75 5.75 0 0 1 4 4.542V2.75a.75.75 0 0 1 1.5 0v2.404ZM13 10.75a1.75 1.75 0 1 0-3.5 0 1.75 1.75 0 0 0 3.5 0Z"></path>
									</svg>
									on-merge
								</span>
							{:else}
								<span class="mt-trigger-pill mt-trigger-instant" title="Paid immediately upon /tip command">
									instant
								</span>
							{/if}
						</td>

						<td>
							<Badge variant={tip.state} size="sm" />
						</td>

						<td>
							<span class="mt-time" title={tip.created_at}>{formatRelativeTime(tip.created_at)}</span>
						</td>

						<td class="text-right">
							<Button
								size="sm"
								variant="ghost"
								onclick={() => onselect?.(tip)}
							>
								Details
							</Button>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<style>
	.mt-table-wrapper {
		width: 100%;
		overflow-x: auto;
		background: var(--mt-surface);
	}

	.mt-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13px;
		text-align: left;
	}

	.mt-table th {
		background: var(--mt-bg-subtle);
		color: var(--mt-fg-muted);
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 10px 14px;
		border-bottom: 1px solid var(--mt-border);
		white-space: nowrap;
	}

	.mt-table td {
		padding: 12px 14px;
		border-bottom: 1px solid var(--mt-border-muted);
		color: var(--mt-fg);
		vertical-align: middle;
	}

	.mt-table tr:hover {
		background: var(--mt-surface-hover);
	}

	.mt-pr-cell {
		display: flex;
		flex-direction: column;
		gap: 2px;
		max-width: 260px;
	}

	.mt-pr-link {
		color: var(--mt-fg);
		text-decoration: none;
		font-weight: 600;
		font-family: var(--mt-font-mono);
		font-size: 12px;
	}

	.mt-pr-link:hover {
		color: var(--mt-border-active);
		text-decoration: underline;
	}

	.mt-pr-num {
		color: var(--mt-fg-muted);
	}

	.mt-pr-title {
		font-size: 12px;
		color: var(--mt-fg-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.mt-user-cell {
		display: flex;
		align-items: center;
		gap: 8px;
		white-space: nowrap;
	}

	.mt-avatar {
		width: 20px;
		height: 20px;
		border-radius: 9999px;
		object-fit: cover;
	}

	.mt-handle {
		font-weight: 500;
		font-family: var(--mt-font-mono);
		font-size: 12px;
	}

	.mt-amount-cell {
		display: flex;
		flex-direction: column;
		gap: 1px;
		white-space: nowrap;
	}

	.mt-sats {
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.mt-fiat {
		font-size: 11px;
		color: var(--mt-fg-muted);
	}

	.mt-trigger-pill {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 2px 7px;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 500;
		font-family: var(--mt-font-mono);
		line-height: 1.2;
	}

	.mt-trigger-merge {
		background: var(--mt-purple-bg);
		color: var(--mt-purple);
		border: 1px solid var(--mt-purple-border);
	}

	.mt-trigger-instant {
		background: var(--mt-bolt-subtle);
		color: var(--mt-bolt);
		border: 1px solid var(--mt-bolt);
	}

	.mt-time {
		font-size: 12px;
		color: var(--mt-fg-muted);
		white-space: nowrap;
	}

	.text-right {
		text-align: right;
	}

	.mt-empty-row {
		padding: 48px 16px;
		text-align: center;
	}

	.mt-empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		color: var(--mt-fg-muted);
	}

	.mt-empty-icon {
		font-size: 24px;
		opacity: 0.5;
	}
</style>
