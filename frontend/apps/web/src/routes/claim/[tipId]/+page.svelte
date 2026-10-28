<script lang="ts">
	import { page } from '$app/state';
	import { Button, Badge, formatFiatUSD, formatBitnobFiat } from '@mergetip/ui';

	// Sample tip data
	const pledge = {
		id: page.params.tipId ?? 'tip-pledge-8f2a1',
		amount_sats: 5000,
		sponsor: 'xoulomon',
		receiver: 'alicesmith',
		repo: 'xoulomon/mergetip',
		pr_number: 42,
		pr_title: 'feat(payer): implement NIP-47 client with auto-reconnect',
		note: 'thank you for the speedy code review and suggestions',
		expires_at: '29 days, 18 hours'
	};

	let activeClaimTab = $state<'lnurl' | 'breez' | 'invoice' | 'bitnob'>('lnurl');

	// Tab states
	let userLnAddress = $state('');
	let bolt11Invoice = $state('');
	let fiatCurrency = $state<'NGN' | 'GHS' | 'KES'>('NGN');
	let fiatAccount = $state('');
	let fiatBank = $state('Access Bank Plc');

	// In-browser Breez Spark wallet mock
	let breezWalletCreated = $state(false);
	let breezSeedPhrase = $state(
		'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
	);

	// Settlement status
	let claiming = $state(false);
	let claimCompleted = $state(false);
	let claimTxReceipt = $state<{ preimage: string; method: string } | null>(null);

	function executeClaim(methodName: string) {
		claiming = true;
		setTimeout(() => {
			claiming = false;
			claimCompleted = true;
			claimTxReceipt = {
				preimage: '0x3c9f28a1e4b5d6c708192a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d',
				method: methodName
			};
		}, 1000);
	}
</script>

<div class="mt-claim-page">
	<div class="mt-claim-container">
		{#if claimCompleted && claimTxReceipt}
			<!-- Claim Success Receipt View -->
			<div class="mt-receipt-card">
				<h2>Sats Successfully Claimed!</h2>
				<p class="mt-receipt-desc">
					Your <strong>{pledge.amount_sats.toLocaleString('en-US')} sats</strong> have been
					transferred via {claimTxReceipt.method}.
				</p>

				<div class="mt-receipt-box">
					<div class="mt-receipt-row">
						<span>Settled Amount</span>
						<strong
							>{pledge.amount_sats.toLocaleString('en-US')} sats ({formatFiatUSD(
								pledge.amount_sats
							)})</strong
						>
					</div>
					<div class="mt-receipt-row">
						<span>Sponsor</span>
						<span>@{pledge.sponsor}</span>
					</div>
					<div class="mt-receipt-row">
						<span>Work Reference</span>
						<span>{pledge.repo}#{pledge.pr_number}</span>
					</div>
					<div class="mt-receipt-row">
						<span>Payment Proof (Preimage)</span>
						<code class="mt-preimage-code">{claimTxReceipt.preimage}</code>
					</div>
					<div class="mt-receipt-row">
						<span>Status</span>
						<Badge variant="paid" size="md">Settled on Lightning</Badge>
					</div>
				</div>

				<div class="mt-receipt-actions">
					<Button variant="default" onclick={() => (window.location.href = '/dashboard')}>
						Go to Dashboard
					</Button>
					<Button variant="primary" onclick={() => (window.location.href = '/')}>
						Explore MergeTip
					</Button>
				</div>
			</div>
		{:else}
			<!-- Claim Header Hero -->
			<div class="mt-claim-header">
				<div class="mt-claim-badge">
					<Badge variant="bolt" size="md">Cryptographic Pledge</Badge>
					<span class="mt-expiry-text">Expires in {pledge.expires_at}</span>
				</div>

				<h1>Claim your sats</h1>
				<p class="mt-claim-intro">
					You were tipped <strong>{pledge.amount_sats.toLocaleString('en-US')} sats</strong>
					({formatFiatUSD(pledge.amount_sats)}) by <strong>@{pledge.sponsor}</strong> for your contribution!
				</p>

				<!-- Contribution Context Card -->
				<div class="mt-context-card">
					<div class="mt-context-meta">
						<span class="mt-context-repo">{pledge.repo}#{pledge.pr_number}</span>
						<span class="mt-context-title">{pledge.pr_title}</span>
					</div>
					{#if pledge.note}
						<div class="mt-context-note">
							"{pledge.note}"
						</div>
					{/if}
				</div>
			</div>

			<!-- Claim Methods Card -->
			<div class="mt-methods-card">
				<div class="mt-methods-tabs">
					<button
						class="mt-method-tab {activeClaimTab === 'lnurl' ? 'tab-active' : ''}"
						onclick={() => (activeClaimTab = 'lnurl')}
					>
						<span>Lightning Address</span>
					</button>

					<button
						class="mt-method-tab {activeClaimTab === 'breez' ? 'tab-active' : ''}"
						onclick={() => (activeClaimTab = 'breez')}
					>
						<span>Instant Web Wallet</span>
					</button>

					<button
						class="mt-method-tab {activeClaimTab === 'invoice' ? 'tab-active' : ''}"
						onclick={() => (activeClaimTab = 'invoice')}
					>
						<span>Bolt11 Invoice</span>
					</button>

					<button
						class="mt-method-tab {activeClaimTab === 'bitnob' ? 'tab-active' : ''}"
						onclick={() => (activeClaimTab = 'bitnob')}
					>
						<span>African Fiat Bank</span>
					</button>
				</div>

				<div class="mt-methods-body">
					<!-- METHOD 1: LIGHTNING ADDRESS -->
					{#if activeClaimTab === 'lnurl'}
						<div class="mt-method-panel">
							<h3>Payout to Lightning Address</h3>
							<p>
								Enter your Lightning address (e.g. Alby, Wallet of Satoshi, Coinos, Primal) for
								instantaneous transfer.
							</p>

							<div class="mt-claim-field">
								<label for="lnAddressInput">Your Lightning Address</label>
								<input
									id="lnAddressInput"
									type="text"
									placeholder="alice@getalby.com"
									bind:value={userLnAddress}
									class="mt-form-input font-mono"
								/>
							</div>

							<div class="mt-action-row">
								<Button
									variant="bolt"
									size="lg"
									loading={claiming}
									disabled={!userLnAddress}
									onclick={() => executeClaim(`Lightning Address (${userLnAddress})`)}
								>
									Claim {pledge.amount_sats.toLocaleString('en-US')} Sats Directly
								</Button>
							</div>
						</div>
					{/if}

					<!-- METHOD 2: BREEZ SPARK SDK (INSTANT IN-BROWSER WALLET) -->
					{#if activeClaimTab === 'breez'}
						<div class="mt-method-panel">
							<h3>Instant In-Browser Web Wallet (Breez Spark SDK)</h3>
							<p>
								Don't have a Lightning wallet yet? Create a non-custodial WebAssembly wallet
								directly in your browser with 1 click.
							</p>

							{#if !breezWalletCreated}
								<div class="mt-spark-cta">
									<div class="mt-spark-features">
										<div class="mt-spark-feat">Zero custodial risk — keys stay in your browser</div>
										<div class="mt-spark-feat">Instant sub-second claim</div>
										<div class="mt-spark-feat">Export seed words or LNURL anytime</div>
									</div>

									<Button
										variant="primary"
										size="lg"
										onclick={() => {
											breezWalletCreated = true;
										}}
									>
										Create Instant Browser Wallet
									</Button>
								</div>
							{:else}
								<div class="mt-spark-wallet-view">
									<div class="mt-wallet-badge">
										<Badge variant="paid">Breez Spark WASM Ready</Badge>
										<span class="mt-spark-balance">Balance: 0 sats</span>
									</div>

									<div class="mt-seed-box">
										<span class="mt-seed-title">Your 12-Word Recovery Seed Phrase (Save this):</span
										>
										<code class="mt-seed-words">{breezSeedPhrase}</code>
									</div>

									<Button
										variant="bolt"
										size="lg"
										loading={claiming}
										onclick={() => executeClaim('Breez Spark In-Browser Wallet')}
									>
										Deposit {pledge.amount_sats.toLocaleString('en-US')} Sats Into Browser Wallet
									</Button>
								</div>
							{/if}
						</div>
					{/if}

					<!-- METHOD 3: BOLT11 INVOICE -->
					{#if activeClaimTab === 'invoice'}
						<div class="mt-method-panel">
							<h3>One-Time Lightning Invoice (Bolt11)</h3>
							<p>
								Generate a Lightning invoice for exactly <strong
									>{pledge.amount_sats.toLocaleString('en-US')} sats</strong
								> from any wallet and paste it here.
							</p>

							<div class="mt-claim-field">
								<label for="bolt11Input">Bolt11 Lightning Invoice</label>
								<textarea
									id="bolt11Input"
									rows="3"
									placeholder="lnbc50u1p..."
									bind:value={bolt11Invoice}
									class="mt-form-input font-mono"></textarea>
							</div>

							<div class="mt-action-row">
								<Button
									variant="bolt"
									size="lg"
									loading={claiming}
									disabled={!bolt11Invoice}
									onclick={() => executeClaim('Bolt11 Invoice')}
								>
									Pay Invoice Now
								</Button>
							</div>
						</div>
					{/if}

					<!-- METHOD 4: BITNOB FIAT RAILS -->
					{#if activeClaimTab === 'bitnob'}
						<div class="mt-method-panel">
							<h3>Local African Fiat Bank Transfer (Bitnob Payouts)</h3>
							<p>
								Auto-convert your satoshi reward into local fiat currency deposited straight to your
								bank account or mobile money.
							</p>

							<div class="mt-fiat-quote-pill">
								<span>Estimated Payout:</span>
								<strong>{formatBitnobFiat(pledge.amount_sats, fiatCurrency)}</strong>
								<span class="mt-fiat-rate">(1 BTC ≈ $68,000 USD)</span>
							</div>

							<div class="mt-claim-field">
								<label for="fiatCurr">Currency & Country</label>
								<select id="fiatCurr" bind:value={fiatCurrency} class="mt-form-input">
									<option value="NGN">Nigeria — Nigerian Naira (NGN ₦)</option>
									<option value="GHS">Ghana — Ghanaian Cedi (GHS GH₵)</option>
									<option value="KES">Kenya — Kenyan Shilling (KES KSh)</option>
								</select>
							</div>

							<div class="mt-claim-field">
								<label for="bankName">Beneficiary Bank / Mobile Money Provider</label>
								<input
									id="bankName"
									type="text"
									bind:value={fiatBank}
									class="mt-form-input"
									placeholder="e.g. Access Bank, Zenith Bank, M-PESA"
								/>
							</div>

							<div class="mt-claim-field">
								<label for="accountNumber">Account Number / Phone Number</label>
								<input
									id="accountNumber"
									type="text"
									bind:value={fiatAccount}
									placeholder="e.g. 0123456789"
									class="mt-form-input font-mono"
								/>
							</div>

							<div class="mt-action-row">
								<Button
									variant="primary"
									size="lg"
									loading={claiming}
									disabled={!fiatAccount}
									onclick={() =>
										executeClaim(
											`Bitnob Fiat Transfer (${formatBitnobFiat(pledge.amount_sats, fiatCurrency)})`
										)}
								>
									Initiate Bank Payout via Bitnob
								</Button>
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.mt-claim-page {
		padding: 48px 16px;
	}

	.mt-claim-container {
		max-width: 680px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.mt-claim-header {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.mt-claim-badge {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.mt-expiry-text {
		font-size: 12px;
		color: var(--mt-warning);
		font-weight: 500;
	}

	.mt-claim-header h1 {
		font-size: 32px;
		font-weight: 800;
		color: var(--mt-fg);
		margin: 0;
	}

	.mt-claim-intro {
		font-size: 16px;
		color: var(--mt-fg-muted);
		line-height: 1.5;
		margin: 0;
	}

	.mt-context-card {
		margin-top: 8px;
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		border-radius: 8px;
		padding: 12px 16px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		text-align: left;
		width: 100%;
		box-shadow: var(--mt-shadow-sm);
	}

	.mt-context-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
	}

	.mt-context-repo {
		font-family: var(--mt-font-mono);
		font-weight: 600;
		color: var(--mt-border-active);
	}

	.mt-context-title {
		color: var(--mt-fg);
		font-weight: 500;
	}

	.mt-context-note {
		font-size: 13px;
		color: var(--mt-fg-muted);
		font-style: italic;
	}

	/* Methods Card */
	.mt-methods-card {
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: var(--mt-shadow-md);
	}

	.mt-methods-tabs {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		border-bottom: 1px solid var(--mt-border);
		background: var(--mt-bg-subtle);
	}

	.mt-method-tab {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 14px 8px;
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		font-size: 12px;
		font-weight: 600;
		color: var(--mt-fg-muted);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.mt-method-tab:hover {
		color: var(--mt-fg);
		background: var(--mt-surface-hover);
	}

	.tab-active {
		color: var(--mt-fg);
		background: var(--mt-surface);
		border-bottom-color: var(--mt-bolt);
	}

	.mt-tab-ico {
		font-size: 18px;
	}

	.mt-methods-body {
		padding: 24px;
	}

	.mt-method-panel {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.mt-method-panel h3 {
		font-size: 18px;
		font-weight: 700;
		color: var(--mt-fg);
		margin: 0;
	}

	.mt-method-panel p {
		font-size: 14px;
		color: var(--mt-fg-muted);
		margin: 0;
		line-height: 1.5;
	}

	.mt-claim-field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.mt-claim-field label {
		font-size: 13px;
		font-weight: 600;
		color: var(--mt-fg);
	}

	.mt-form-input {
		background: var(--mt-bg-inset);
		border: 1px solid var(--mt-border);
		border-radius: 6px;
		padding: 10px 14px;
		font-size: 14px;
		color: var(--mt-fg);
		outline: none;
		width: 100%;
	}

	.mt-form-input:focus {
		border-color: var(--mt-border-active);
		box-shadow: 0 0 0 2px rgba(9, 105, 218, 0.2);
	}

	.mt-action-row {
		margin-top: 8px;
	}

	/* Spark Wallet view */
	.mt-spark-cta {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 16px 0;
	}

	.mt-spark-features {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 13px;
		color: var(--mt-fg-muted);
	}

	.mt-spark-wallet-view {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.mt-wallet-badge {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: var(--mt-bg-subtle);
		padding: 10px 14px;
		border-radius: 6px;
		border: 1px solid var(--mt-border-muted);
	}

	.mt-spark-balance {
		font-size: 13px;
		font-weight: 600;
		color: var(--mt-fg);
	}

	.mt-seed-box {
		background: var(--mt-bg-inset);
		border: 1px solid var(--mt-border);
		border-radius: 6px;
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.mt-seed-title {
		font-size: 11px;
		font-weight: 600;
		color: var(--mt-warning);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.mt-seed-words {
		font-family: var(--mt-font-mono);
		font-size: 12px;
		color: var(--mt-fg);
		line-height: 1.5;
	}

	.mt-fiat-quote-pill {
		background: var(--mt-accent-subtle);
		border: 1px solid var(--mt-accent);
		border-radius: 6px;
		padding: 10px 14px;
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		color: var(--mt-fg);
	}

	.mt-fiat-quote-pill strong {
		color: var(--mt-accent);
		font-size: 16px;
	}

	.mt-fiat-rate {
		font-size: 11px;
		color: var(--mt-fg-muted);
		margin-left: auto;
	}

	/* Success Receipt */
	.mt-receipt-card {
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		border-radius: 12px;
		padding: 36px 24px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		box-shadow: var(--mt-shadow-md);
	}

	.mt-receipt-icon {
		font-size: 48px;
	}

	.mt-receipt-card h2 {
		font-size: 24px;
		font-weight: 700;
		color: var(--mt-fg);
		margin: 0;
	}

	.mt-receipt-desc {
		font-size: 15px;
		color: var(--mt-fg-muted);
		margin: 0;
	}

	.mt-receipt-box {
		width: 100%;
		background: var(--mt-bg-subtle);
		border: 1px solid var(--mt-border-muted);
		border-radius: 8px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		text-align: left;
		font-size: 13px;
		margin-top: 8px;
	}

	.mt-receipt-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.mt-receipt-row span:first-child {
		color: var(--mt-fg-muted);
	}

	.mt-preimage-code {
		font-family: var(--mt-font-mono);
		font-size: 11px;
		max-width: 220px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.mt-receipt-actions {
		display: flex;
		gap: 12px;
		margin-top: 8px;
	}

	@media (max-width: 600px) {
		.mt-methods-tabs {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
