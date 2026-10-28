<script lang="ts">
	import { Button, Badge, Card } from '@mergetip/ui';

	// Settings state
	let activeSection = $state<'nwc' | 'github' | 'recipient' | 'limits' | 'fiat'>('nwc');

	// NWC State
	let nwcUri = $state(
		'nostr+walletconnect://b889ff5b1513b641e2a139f661a661364979c5beee91842f8f0ef42ab558e9d4?relay=ws%3A%2F%2Flocalhost%3A7000&secret=71a1795c43d8a87a6e1189c47e8c07e05697a22eb2c3eb795610ef39f1c7136d'
	);
	let testingNwc = $state(false);
	let nwcStatus = $state<{ ok: boolean; message: string; balance?: number } | null>({
		ok: true,
		message: 'Connected to relay ws://localhost:7000. Permissions: pay_invoice, get_balance.',
		balance: 385000
	});

	// GitHub App State
	let installedOrgs = $state(['xoulomon', 'mergetip']);
	let botName = $state('mergetip-bot');

	// Recipient State
	let lightningAddress = $state('xoulomon@getalby.com');
	let fallbackEmail = $state('tips@mail.mergetip.dev');
	let verifyingLnurl = $state(false);
	let lnurlResult = $state<{ ok: boolean; message: string } | null>({
		ok: true,
		message: 'Valid Lightning Address resolved via LNURL-pay (max 10,000,000 sats)'
	});

	// Budget Caps
	let perTipCap = $state(25000);
	let confirmationThreshold = $state(10000);
	let monthlyCap = $state(100000);

	// Fiat Off-ramp (Bitnob)
	let fiatEnabled = $state(true);
	let fiatCurrency = $state<'NGN' | 'GHS' | 'KES'>('NGN');
	let bankAccountNumber = $state('0123456789');
	let bankName = $state('Access Bank Plc');

	let saveStatus = $state(false);

	function testNwcConnection() {
		testingNwc = true;
		setTimeout(() => {
			testingNwc = false;
			nwcStatus = {
				ok: true,
				message: 'NIP-47 handshake successful. Wallet connection verified on relay.',
				balance: 385000
			};
		}, 800);
	}

	function verifyLightningAddress() {
		verifyingLnurl = true;
		setTimeout(() => {
			verifyingLnurl = false;
			lnurlResult = {
				ok: true,
				message: `LNURL-pay metadata confirmed for ${lightningAddress}. Ready for instant payouts.`
			};
		}, 700);
	}

	function handleSave() {
		saveStatus = true;
		setTimeout(() => {
			saveStatus = false;
		}, 1500);
	}
</script>

<div class="mt-settings-page">
	<div class="mt-settings-container">
		<!-- Header -->
		<div class="mt-settings-header">
			<div>
				<h1>Settings & Connections</h1>
				<p>Manage your Nostr Wallet Connect keys, GitHub App, recipient address and budget caps.</p>
			</div>
			<Button variant="primary" onclick={handleSave}>
				{saveStatus ? '✓ Settings Saved' : 'Save Changes'}
			</Button>
		</div>

		<!-- Layout: Sidebar Nav + Content Panel -->
		<div class="mt-settings-layout">
			<!-- Nav Tabs -->
			<nav class="mt-settings-nav" aria-label="Settings categories">
				<button
					class="mt-settings-tab {activeSection === 'nwc' ? 'tab-selected' : ''}"
					onclick={() => (activeSection = 'nwc')}
				>
					<span class="mt-tab-icon">⚡</span>
					<div class="mt-tab-text">
						<span class="mt-tab-title">Wallet Connect (NWC)</span>
						<span class="mt-tab-desc">NIP-47 URI & relay keys</span>
					</div>
				</button>

				<button
					class="mt-settings-tab {activeSection === 'github' ? 'tab-selected' : ''}"
					onclick={() => (activeSection = 'github')}
				>
					<span class="mt-tab-icon">🐙</span>
					<div class="mt-tab-text">
						<span class="mt-tab-title">GitHub App</span>
						<span class="mt-tab-desc">Installations & webhooks</span>
					</div>
				</button>

				<button
					class="mt-settings-tab {activeSection === 'recipient' ? 'tab-selected' : ''}"
					onclick={() => (activeSection = 'recipient')}
				>
					<span class="mt-tab-icon">🏷️</span>
					<div class="mt-tab-text">
						<span class="mt-tab-title">Recipient Address</span>
						<span class="mt-tab-desc">Lightning address & LNURL</span>
					</div>
				</button>

				<button
					class="mt-settings-tab {activeSection === 'limits' ? 'tab-selected' : ''}"
					onclick={() => (activeSection = 'limits')}
				>
					<span class="mt-tab-icon">🛡️</span>
					<div class="mt-tab-text">
						<span class="mt-tab-title">Safety & Budget Caps</span>
						<span class="mt-tab-desc">Approval thresholds & limits</span>
					</div>
				</button>

				<button
					class="mt-settings-tab {activeSection === 'fiat' ? 'tab-selected' : ''}"
					onclick={() => (activeSection = 'fiat')}
				>
					<span class="mt-tab-icon">🌍</span>
					<div class="mt-tab-text">
						<span class="mt-tab-title">Fiat Off-Ramp (Bitnob)</span>
						<span class="mt-tab-desc">Africa bank payouts (NG, GH, KE)</span>
					</div>
				</button>
			</nav>

			<!-- Settings Content Area -->
			<div class="mt-settings-content">
				<!-- NWC SECTION -->
				{#if activeSection === 'nwc'}
					<Card title="Nostr Wallet Connect (NIP-47)">
						{#snippet subtitle()}
							Connect any wallet supporting NWC (Alby Hub, Mutiny, Umbrel, raspiblitz). MergeTip never holds your funds.
						{/snippet}

						<div class="mt-section-form">
							<div class="mt-field">
								<label for="nwcUri">NWC Connection URI</label>
								<div class="mt-input-action-row">
									<input
										id="nwcUri"
										type="password"
										bind:value={nwcUri}
										class="mt-form-input font-mono"
										placeholder="nostr+walletconnect://..."
									/>
									<Button variant="default" loading={testingNwc} onclick={testNwcConnection}>
										Test Connection
									</Button>
								</div>
								<span class="mt-field-help">
									Stored encrypted using envelope encryption (AES-256-GCM) with your server's master key.
								</span>
							</div>

							{#if nwcStatus}
								<div class="mt-status-banner {nwcStatus.ok ? 'banner-ok' : 'banner-err'}">
									<span class="mt-banner-icon">{nwcStatus.ok ? '✅' : '⚠️'}</span>
									<div class="mt-banner-body">
										<strong>{nwcStatus.message}</strong>
										{#if nwcStatus.balance}
											<div class="mt-banner-bal">
												Available Balance: <strong>{nwcStatus.balance.toLocaleString('en-US')} sats</strong>
											</div>
										{/if}
									</div>
								</div>
							{/if}

							<div class="mt-info-box">
								<h4>How NWC non-custodial security works:</h4>
								<ul>
									<li>MergeTip sends an encrypted NIP-47 request (<code>pay_invoice</code>) over Nostr relays.</li>
									<li>Your node or wallet validates the budget limits and executes the payment.</li>
									<li>You can revoke this connection string anytime from your wallet.</li>
								</ul>
							</div>
						</div>
					</Card>
				{/if}

				<!-- GITHUB SECTION -->
				{#if activeSection === 'github'}
					<Card title="GitHub App Integration">
						{#snippet subtitle()}
							The MergeTip GitHub App monitors PR reviews and comments to parse <code>/tip</code> commands.
						{/snippet}

						<div class="mt-section-form">
							<div class="mt-integration-card">
								<div class="mt-integration-left">
									<div class="mt-gh-icon">🐙</div>
									<div>
										<h4>MergeTip Bot (@{botName})</h4>
										<p>Active on <strong>{installedOrgs.length} organizations</strong></p>
									</div>
								</div>
								<Badge variant="paid" size="md">Installed & Active</Badge>
							</div>

							<div class="mt-field">
								<span class="mt-field-label">Active Organizations</span>
								<div class="mt-orgs-list">
									{#each installedOrgs as org (org)}
										<div class="mt-org-chip">
											<span>github.com/{org}</span>
											<span class="mt-org-check">✓</span>
										</div>
									{/each}
								</div>
							</div>

							<div class="mt-field">
								<span class="mt-field-label">Webhook Endpoint</span>
								<code class="mt-code-box">http://localhost:8080/v1/webhooks/github</code>
								<span class="mt-field-help">
									Verified via GitHub HMAC SHA-256 signature (<code>GITHUB_WEBHOOK_SECRET</code>).
								</span>
							</div>
						</div>
					</Card>
				{/if}

				<!-- RECIPIENT SECTION -->
				{#if activeSection === 'recipient'}
					<Card title="Recipient Address & Notification Preferences">
						{#snippet subtitle()}
							When other developers tip you for your contributions on GitHub, sats will route here.
						{/snippet}

						<div class="mt-section-form">
							<div class="mt-field">
								<label for="lnAddress">Your Lightning Address</label>
								<div class="mt-input-action-row">
									<input
										id="lnAddress"
										type="text"
										bind:value={lightningAddress}
										class="mt-form-input font-mono"
										placeholder="you@domain.com"
									/>
									<Button variant="default" loading={verifyingLnurl} onclick={verifyLightningAddress}>
										Verify LNURL
									</Button>
								</div>
								<span class="mt-field-help">
									Works with Alby, Wallet of Satoshi, Coinos, Fountain, Primal, or self-hosted bridge.
								</span>
							</div>

							{#if lnurlResult}
								<div class="mt-status-banner banner-ok">
									<span class="mt-banner-icon">✓</span>
									<span>{lnurlResult.message}</span>
								</div>
							{/if}

							<div class="mt-field">
								<label for="email">Fallback Email for Pledges</label>
								<input
									id="email"
									type="email"
									bind:value={fallbackEmail}
									class="mt-form-input"
									placeholder="you@email.com"
								/>
								<span class="mt-field-help">
									Sent claim reminders if a sponsor tips you before you have set a Lightning address.
								</span>
							</div>
						</div>
					</Card>
				{/if}

				<!-- SAFETY & BUDGET CAPS -->
				{#if activeSection === 'limits'}
					<Card title="Safety Limits & Budget Caps">
						{#snippet subtitle()}
							Protect against accidental or rogue bot payouts by establishing firm automated boundaries.
						{/snippet}

						<div class="mt-section-form">
							<div class="mt-field">
								<label for="highValue">High-Value Confirmation Threshold</label>
								<div class="mt-input-unit">
									<input
										id="highValue"
										type="number"
										step="1000"
										bind:value={confirmationThreshold}
										class="mt-form-input"
									/>
									<span class="mt-unit-tag">sats</span>
								</div>
								<span class="mt-field-help">
									Any <code>/tip</code> exceeding this amount requires one-click confirmation on the web app before paying.
								</span>
							</div>

							<div class="mt-field">
								<label for="perTip">Per-Tip Hard Cap</label>
								<div class="mt-input-unit">
									<input
										id="perTip"
										type="number"
										step="1000"
										bind:value={perTipCap}
										class="mt-form-input"
									/>
									<span class="mt-unit-tag">sats</span>
								</div>
								<span class="mt-field-help">
									The parser will reject any tip command asking for more than this ceiling.
								</span>
							</div>

							<div class="mt-field">
								<label for="monthlyBudget">Monthly Spending Cap</label>
								<div class="mt-input-unit">
									<input
										id="monthlyBudget"
										type="number"
										step="10000"
										bind:value={monthlyCap}
										class="mt-form-input"
									/>
									<span class="mt-unit-tag">sats</span>
								</div>
								<span class="mt-field-help">
									Maximum total sats your GitHub App can dispatch in a 30-day billing cycle.
								</span>
							</div>
						</div>
					</Card>
				{/if}

				<!-- FIAT RAILS (BITNOB) -->
				{#if activeSection === 'fiat'}
					<Card title="Local African Fiat Off-Ramp (Bitnob Payouts)">
						{#snippet subtitle()}
							Empower African developers to receive satoshi tips converted directly into local bank or mobile money deposits.
						{/snippet}

						<div class="mt-section-form">
							<div class="mt-toggle-card">
								<div>
									<h4>Auto-Convert Tips to Fiat</h4>
									<p>Automatically off-ramp received tips into your local currency bank account.</p>
								</div>
								<input type="checkbox" bind:checked={fiatEnabled} class="mt-checkbox" />
							</div>

							{#if fiatEnabled}
								<div class="mt-field">
									<label for="currencySelect">Payout Currency</label>
									<select id="currencySelect" bind:value={fiatCurrency} class="mt-form-input">
										<option value="NGN">Nigerian Naira (NGN - ₦)</option>
										<option value="GHS">Ghanaian Cedi (GHS - GH₵)</option>
										<option value="KES">Kenyan Shilling (KES - KSh)</option>
									</select>
								</div>

								<div class="mt-field">
									<label for="bankSelect">Beneficiary Bank</label>
									<input
										id="bankSelect"
										type="text"
										bind:value={bankName}
										class="mt-form-input"
										placeholder="e.g. Access Bank, GTBank, M-PESA"
									/>
								</div>

								<div class="mt-field">
									<label for="accountNum">Account / Mobile Money Number</label>
									<input
										id="accountNum"
										type="text"
										bind:value={bankAccountNumber}
										class="mt-form-input font-mono"
										placeholder="0123456789"
									/>
								</div>

								<div class="mt-info-box">
									<h4>Bitnob Payouts API Sandbox active:</h4>
									<p>Quotes and settlements are verified via HMAC-SHA512 webhook signatures.</p>
								</div>
							{/if}
						</div>
					</Card>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.mt-settings-page {
		padding: 32px 16px;
	}

	.mt-settings-container {
		max-width: 1140px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.mt-settings-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 16px;
		padding-bottom: 20px;
		border-bottom: 1px solid var(--mt-border);
	}

	.mt-settings-header h1 {
		font-size: 28px;
		font-weight: 700;
		color: var(--mt-fg);
		margin: 0;
	}

	.mt-settings-header p {
		font-size: 14px;
		color: var(--mt-fg-muted);
		margin: 4px 0 0 0;
	}

	.mt-settings-layout {
		display: grid;
		grid-template-columns: 280px 1fr;
		gap: 32px;
		align-items: flex-start;
	}

	.mt-settings-nav {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.mt-settings-tab {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 12px 14px;
		border-radius: 8px;
		background: transparent;
		border: 1px solid transparent;
		text-align: left;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.mt-settings-tab:hover {
		background: var(--mt-surface-hover);
	}

	.tab-selected {
		background: var(--mt-surface);
		border-color: var(--mt-border);
		box-shadow: var(--mt-shadow-sm);
	}

	.mt-tab-icon {
		font-size: 18px;
		line-height: 1.2;
	}

	.mt-tab-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.mt-tab-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--mt-fg);
	}

	.mt-tab-desc {
		font-size: 12px;
		color: var(--mt-fg-muted);
	}

	.mt-settings-content {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.mt-section-form {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.mt-field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.mt-field label,
	.mt-field-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--mt-fg);
	}

	.mt-field-help {
		font-size: 12px;
		color: var(--mt-fg-muted);
		line-height: 1.4;
	}

	.mt-form-input {
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		border-radius: 6px;
		padding: 8px 12px;
		font-size: 14px;
		color: var(--mt-fg);
		outline: none;
		width: 100%;
	}

	.mt-form-input:focus {
		border-color: var(--mt-border-active);
		box-shadow: 0 0 0 2px rgba(9, 105, 218, 0.2);
	}

	.mt-input-action-row {
		display: flex;
		gap: 10px;
	}

	.mt-input-unit {
		position: relative;
		display: flex;
		align-items: center;
	}

	.mt-unit-tag {
		position: absolute;
		right: 12px;
		font-size: 13px;
		font-weight: 500;
		color: var(--mt-bolt);
	}

	.mt-status-banner {
		padding: 12px 16px;
		border-radius: 6px;
		display: flex;
		align-items: flex-start;
		gap: 10px;
		font-size: 13px;
		line-height: 1.5;
	}

	.banner-ok {
		background: var(--mt-success-bg);
		color: var(--mt-success);
		border: 1px solid var(--mt-success-border);
	}

	.banner-err {
		background: var(--mt-danger-bg);
		color: var(--mt-danger);
		border: 1px solid var(--mt-danger-border);
	}

	.mt-banner-bal {
		font-size: 12px;
		margin-top: 2px;
	}

	.mt-info-box {
		background: var(--mt-bg-subtle);
		border: 1px solid var(--mt-border-muted);
		border-radius: 6px;
		padding: 14px 16px;
		font-size: 13px;
		color: var(--mt-fg-muted);
	}

	.mt-info-box h4 {
		font-size: 13px;
		font-weight: 600;
		color: var(--mt-fg);
		margin: 0 0 6px 0;
	}

	.mt-info-box ul {
		margin: 0;
		padding-left: 20px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.mt-integration-card,
	.mt-toggle-card {
		background: var(--mt-bg-subtle);
		border: 1px solid var(--mt-border-muted);
		border-radius: 8px;
		padding: 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.mt-integration-left {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.mt-gh-icon {
		font-size: 24px;
	}

	.mt-integration-left h4,
	.mt-toggle-card h4 {
		font-size: 14px;
		font-weight: 600;
		color: var(--mt-fg);
		margin: 0;
	}

	.mt-integration-left p,
	.mt-toggle-card p {
		font-size: 12px;
		color: var(--mt-fg-muted);
		margin: 2px 0 0 0;
	}

	.mt-orgs-list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.mt-org-chip {
		display: flex;
		align-items: center;
		gap: 6px;
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		border-radius: 6px;
		padding: 6px 12px;
		font-size: 13px;
		font-family: var(--mt-font-mono);
		color: var(--mt-fg);
	}

	.mt-org-check {
		color: var(--mt-success);
		font-weight: 700;
	}

	.mt-code-box {
		background: var(--mt-bg-inset);
		border: 1px solid var(--mt-border-muted);
		border-radius: 6px;
		padding: 8px 12px;
		font-family: var(--mt-font-mono);
		font-size: 13px;
		color: var(--mt-fg);
	}

	.mt-checkbox {
		width: 18px;
		height: 18px;
		cursor: pointer;
	}

	@media (max-width: 860px) {
		.mt-settings-layout {
			grid-template-columns: 1fr;
		}
	}
</style>
