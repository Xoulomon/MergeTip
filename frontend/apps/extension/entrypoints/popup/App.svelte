<script lang="ts">
	import { Button, Badge, formatSats, formatFiatUSD } from '@mergetip/ui';

	// Quick amounts from FR-8.2
	const amounts = [21, 210, 2100, 5000];

	let selectedAmount = $state(2100);
	let activeContributor = $state('reviewer');
	let onMerge = $state(true);
	let tipping = $state(false);
	let tipSuccess = $state(false);

	function sendExtensionTip() {
		tipping = true;
		setTimeout(() => {
			tipping = false;
			tipSuccess = true;
			setTimeout(() => {
				tipSuccess = false;
			}, 2000);
		}, 800);
	}
</script>

<main class="mt-extension-popup">
	<!-- Popup Header -->
	<div class="mt-popup-header">
		<div class="mt-popup-brand">
			<span class="mt-popup-bolt">⚡</span>
			<span class="mt-popup-name">MergeTip</span>
		</div>
		<div class="mt-relay-status" title="Nostr relay connected">
			<span class="mt-status-dot"></span>
			<span>Relay Active</span>
		</div>
	</div>

	<!-- Wallet Summary Box -->
	<div class="mt-wallet-card">
		<div class="mt-wallet-top">
			<span class="mt-wallet-lbl">NWC Connected Wallet</span>
			<span class="mt-wallet-sub">Alby Hub</span>
		</div>
		<div class="mt-wallet-val">
			385,000 <span class="mt-sats-unit">sats</span>
		</div>
		<div class="mt-wallet-fiat">
			≈ {formatFiatUSD(385000)}
		</div>
	</div>

	{#if tipSuccess}
		<div class="mt-success-box">
			<span class="mt-success-ico">🎉</span>
			<h4>Tip Dispatched!</h4>
			<p>Sent {selectedAmount.toLocaleString('en-US')} sats to @{activeContributor}.</p>
		</div>
	{:else}
		<!-- Quick Tip Section -->
		<div class="mt-tip-section">
			<span class="mt-section-lbl">Active GitHub Context</span>
			<div class="mt-gh-target">
				<span class="mt-target-repo">xoulomon/mergetip#42</span>
				<span class="mt-target-user">@{activeContributor}</span>
			</div>

			<span class="mt-section-lbl mt-mt-10">Preset Amount</span>
			<div class="mt-amount-grid">
				{#each amounts as amt (amt)}
					<button
						type="button"
						class="mt-amt-chip {selectedAmount === amt ? 'amt-active' : ''}"
						onclick={() => (selectedAmount = amt)}
					>
						{amt.toLocaleString('en-US')}
					</button>
				{/each}
			</div>

			<label class="mt-check-row">
				<input type="checkbox" bind:checked={onMerge} />
				<span>Hold until PR merges (on-merge)</span>
			</label>

			<Button
				variant="bolt"
				size="md"
				loading={tipping}
				onclick={sendExtensionTip}
			>
				⚡ Tip {selectedAmount.toLocaleString('en-US')} Sats
			</Button>
		</div>
	{/if}

	<!-- Popup Footer -->
	<div class="mt-popup-footer">
		<a href="http://localhost:5173/dashboard" target="_blank" rel="noreferrer" class="mt-dash-link">
			Open Web Dashboard ↗
		</a>
		<a href="http://localhost:5173/settings" target="_blank" rel="noreferrer" class="mt-dash-link">
			Settings ⚙️
		</a>
	</div>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
		background: #0d1117;
		color: #f0f6fc;
	}

	.mt-extension-popup {
		width: 330px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		box-sizing: border-box;
	}

	.mt-popup-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.mt-popup-brand {
		display: flex;
		align-items: center;
		gap: 6px;
		font-weight: 700;
		font-size: 16px;
	}

	.mt-popup-bolt {
		color: #e3b341;
		font-size: 18px;
	}

	.mt-relay-status {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 11px;
		color: #9198a1;
		background: #161b22;
		padding: 2px 8px;
		border-radius: 9999px;
		border: 1px solid #30363d;
	}

	.mt-status-dot {
		width: 6px;
		height: 6px;
		border-radius: 9999px;
		background: #3fb950;
	}

	.mt-wallet-card {
		background: #161b22;
		border: 1px solid #30363d;
		border-radius: 8px;
		padding: 12px 14px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.mt-wallet-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 11px;
		color: #9198a1;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.mt-wallet-val {
		font-size: 22px;
		font-weight: 700;
		color: #f0f6fc;
	}

	.mt-sats-unit {
		font-size: 13px;
		color: #e3b341;
		font-weight: 600;
	}

	.mt-wallet-fiat {
		font-size: 12px;
		color: #9198a1;
	}

	.mt-tip-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.mt-section-lbl {
		font-size: 11px;
		color: #9198a1;
		font-weight: 600;
		text-transform: uppercase;
	}

	.mt-mt-10 {
		margin-top: 6px;
	}

	.mt-gh-target {
		background: #212830;
		border: 1px solid #3d444d;
		border-radius: 6px;
		padding: 8px 10px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 12px;
	}

	.mt-target-repo {
		color: #58a6ff;
		font-family: ui-monospace, monospace;
		font-weight: 600;
	}

	.mt-target-user {
		color: #f0f6fc;
		font-weight: 500;
	}

	.mt-amount-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 6px;
	}

	.mt-amt-chip {
		background: #212830;
		border: 1px solid #3d444d;
		border-radius: 6px;
		padding: 6px 0;
		color: #f0f6fc;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		text-align: center;
		transition: all 0.15s ease;
	}

	.mt-amt-chip:hover {
		background: #29313d;
	}

	.amt-active {
		background: rgba(227, 179, 65, 0.2);
		border-color: #e3b341;
		color: #f0c354;
	}

	.mt-check-row {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		color: #9198a1;
		cursor: pointer;
		margin: 4px 0 6px 0;
	}

	.mt-success-box {
		background: rgba(46, 160, 67, 0.15);
		border: 1px solid rgba(63, 185, 80, 0.4);
		border-radius: 8px;
		padding: 20px 14px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}

	.mt-success-ico {
		font-size: 28px;
	}

	.mt-success-box h4 {
		font-size: 15px;
		color: #3fb950;
		margin: 0;
	}

	.mt-success-box p {
		font-size: 12px;
		color: #f0f6fc;
		margin: 0;
	}

	.mt-popup-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 8px;
		border-top: 1px solid #30363d;
		font-size: 12px;
	}

	.mt-dash-link {
		color: #58a6ff;
		text-decoration: none;
	}
	.mt-dash-link:hover {
		text-decoration: underline;
	}
</style>
