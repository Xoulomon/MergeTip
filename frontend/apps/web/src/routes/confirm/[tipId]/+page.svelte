<script lang="ts">
	import { page } from '$app/state';
	import { Button, Badge, Card, formatSats, formatFiatUSD } from '@mergetip/ui';

	let tipId = $derived(page.params.tipId ?? 'demo-high-value');

	let tipData = {
		id: 'tip-hv-98a71',
		amount_sats: 25000,
		sponsor: 'xoulomon',
		receiver: 'sarah-core',
		repo: 'xoulomon/mergetip',
		pr_number: 44,
		pr_title: 'feat(core): implement skip-locked postgres job queue',
		note: 'stellar architecture and load benchmark results',
		threshold_sats: 10000,
		monthly_budget: 100000,
		monthly_used: 54000
	};

	let processing = $state(false);
	let decision = $state<'approved' | 'rejected' | null>(null);

	function approveTip() {
		processing = true;
		setTimeout(() => {
			processing = false;
			decision = 'approved';
		}, 900);
	}

	function rejectTip() {
		processing = true;
		setTimeout(() => {
			processing = false;
			decision = 'rejected';
		}, 600);
	}
</script>

<div class="mt-confirm-page">
	<div class="mt-confirm-container">
		{#if decision === 'approved'}
			<div class="mt-result-card result-approved">
				<div class="mt-result-icon">⚡</div>
				<h2>Tip Authorized & Executed!</h2>
				<p>
					Dispatched <strong>{tipData.amount_sats.toLocaleString('en-US')} sats</strong> to <strong>@{tipData.receiver}</strong> over Nostr Wallet Connect.
				</p>
				<p class="mt-receipt-proof">
					Preimage: <code>0x89e1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d</code>
				</p>
				<div class="mt-result-actions">
					<Button variant="default" onclick={() => (window.location.href = '/dashboard')}>
						Return to Dashboard
					</Button>
				</div>
			</div>
		{:else if decision === 'rejected'}
			<div class="mt-result-card result-rejected">
				<div class="mt-result-icon">🛑</div>
				<h2>Tip Cancelled</h2>
				<p>
					The tip for {tipData.amount_sats.toLocaleString('en-US')} sats has been rejected. No funds were debited from your wallet.
				</p>
				<div class="mt-result-actions">
					<Button variant="default" onclick={() => (window.location.href = '/dashboard')}>
						Return to Dashboard
					</Button>
				</div>
			</div>
		{:else}
			<!-- Security Header -->
			<div class="mt-confirm-header">
				<div class="mt-warning-badge">
					<Badge variant="expired" size="md">⚠️ Approval Required (FR-12)</Badge>
				</div>
				<h1>High-Value Tip Confirmation</h1>
				<p class="mt-confirm-desc">
					This tip exceeds your automated approval threshold of <strong>{tipData.threshold_sats.toLocaleString('en-US')} sats</strong>. Please review the transaction details below before authorizing payment.
				</p>
			</div>

			<!-- Details Card -->
			<div class="mt-inspection-card">
				<div class="mt-amount-banner">
					<div class="mt-amount-left">
						<span class="mt-amount-sats">{tipData.amount_sats.toLocaleString('en-US')} sats</span>
						<span class="mt-amount-fiat">≈ {formatFiatUSD(tipData.amount_sats)}</span>
					</div>
					<Badge variant="verifying" size="md">Pending Confirmation</Badge>
				</div>

				<div class="mt-breakdown-table">
					<div class="mt-row">
						<span class="mt-lbl">Recipient</span>
						<div class="mt-val mt-val-user">
							<img
								src="https://avatars.githubusercontent.com/{tipData.receiver}"
								alt="@{tipData.receiver}"
								class="mt-user-pic"
								onerror={(e) => {
									const el = e.currentTarget as HTMLImageElement;
									el.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="%239198a1"><circle cx="12" cy="12" r="10"/></svg>';
								}}
							/>
							<strong>@{tipData.receiver}</strong>
						</div>
					</div>

					<div class="mt-row">
						<span class="mt-lbl">Pull Request</span>
						<a
							href="https://github.com/{tipData.repo}/pull/{tipData.pr_number}"
							target="_blank"
							rel="noreferrer"
							class="mt-val mt-pr-link font-mono"
						>
							{tipData.repo}#{tipData.pr_number}
						</a>
					</div>

					<div class="mt-row">
						<span class="mt-lbl">PR Title</span>
						<span class="mt-val">{tipData.pr_title}</span>
					</div>

					{#if tipData.note}
						<div class="mt-row">
							<span class="mt-lbl">Sponsor Note</span>
							<blockquote class="mt-val mt-note">"{tipData.note}"</blockquote>
						</div>
					{/if}

					<div class="mt-row">
						<span class="mt-lbl">Monthly Budget Impact</span>
						<div class="mt-val mt-budget-impact">
							<span>Takes <strong>25%</strong> of total monthly budget</span>
							<div class="mt-mini-track">
								<div class="mt-mini-bar" style="width: 54%"></div>
								<div class="mt-mini-pending" style="width: 25%"></div>
							</div>
							<span class="mt-mini-subtext">Used: 54,000 + This Tip: 25,000 = 79,000 / 100,000 sats</span>
						</div>
					</div>
				</div>

				<!-- Actions Bar -->
				<div class="mt-action-footer">
					<Button
						variant="danger"
						size="lg"
						disabled={processing}
						onclick={rejectTip}
					>
						✕ Reject / Cancel
					</Button>
					<Button
						variant="primary"
						size="lg"
						loading={processing}
						onclick={approveTip}
					>
						⚡ Authorize & Pay {tipData.amount_sats.toLocaleString('en-US')} Sats
					</Button>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.mt-confirm-page {
		padding: 48px 16px;
	}

	.mt-confirm-container {
		max-width: 640px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.mt-confirm-header {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.mt-warning-badge {
		margin-bottom: 4px;
	}

	.mt-confirm-header h1 {
		font-size: 30px;
		font-weight: 800;
		color: var(--mt-fg);
		margin: 0;
	}

	.mt-confirm-desc {
		font-size: 15px;
		color: var(--mt-fg-muted);
		line-height: 1.5;
		margin: 0;
	}

	.mt-inspection-card {
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: var(--mt-shadow-md);
	}

	.mt-amount-banner {
		padding: 20px 24px;
		background: var(--mt-bg-subtle);
		border-bottom: 1px solid var(--mt-border);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.mt-amount-left {
		display: flex;
		align-items: baseline;
		gap: 8px;
	}

	.mt-amount-sats {
		font-size: 28px;
		font-weight: 800;
		color: var(--mt-fg);
	}

	.mt-amount-fiat {
		font-size: 14px;
		color: var(--mt-fg-muted);
	}

	.mt-breakdown-table {
		padding: 20px 24px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		font-size: 14px;
	}

	.mt-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
	}

	.mt-lbl {
		color: var(--mt-fg-muted);
		font-weight: 500;
		font-size: 13px;
		min-width: 140px;
	}

	.mt-val {
		color: var(--mt-fg);
		text-align: right;
	}

	.mt-val-user {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.mt-user-pic {
		width: 22px;
		height: 22px;
		border-radius: 9999px;
	}

	.mt-pr-link {
		color: var(--mt-border-active);
		text-decoration: none;
	}
	.mt-pr-link:hover {
		text-decoration: underline;
	}

	.mt-note {
		margin: 0;
		font-style: italic;
		color: var(--mt-fg-muted);
		text-align: right;
	}

	.mt-budget-impact {
		display: flex;
		flex-direction: column;
		gap: 6px;
		align-items: flex-end;
		width: 100%;
		max-width: 320px;
	}

	.mt-mini-track {
		height: 8px;
		width: 100%;
		background: var(--mt-bg-inset);
		border-radius: 9999px;
		overflow: hidden;
		display: flex;
	}

	.mt-mini-bar {
		background: var(--mt-accent);
		height: 100%;
	}

	.mt-mini-pending {
		background: var(--mt-bolt);
		height: 100%;
	}

	.mt-mini-subtext {
		font-size: 11px;
		color: var(--mt-fg-muted);
	}

	.mt-action-footer {
		padding: 16px 24px;
		background: var(--mt-bg-subtle);
		border-top: 1px solid var(--mt-border);
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 12px;
	}

	/* Result cards */
	.mt-result-card {
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		border-radius: 12px;
		padding: 40px 24px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		box-shadow: var(--mt-shadow-md);
	}

	.mt-result-icon {
		font-size: 48px;
	}

	.mt-result-card h2 {
		font-size: 24px;
		font-weight: 700;
		color: var(--mt-fg);
		margin: 0;
	}

	.mt-result-card p {
		font-size: 15px;
		color: var(--mt-fg-muted);
		margin: 0;
	}

	.mt-receipt-proof {
		font-family: var(--mt-font-mono);
		font-size: 12px;
		background: var(--mt-bg-inset);
		padding: 6px 12px;
		border-radius: 6px;
	}

	.mt-result-actions {
		margin-top: 8px;
	}
</style>
