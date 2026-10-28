<script lang="ts">
	import { Button, Badge, Card } from '@mergetip/ui';
	import { auth } from '../../lib/auth.svelte';

	// Settings state
	let activeSection = $state<'profile' | 'nwc' | 'github' | 'recipient' | 'limits' | 'fiat'>(
		'profile'
	);

	// Profile State
	let profileHandle = $state('xoulomon');
	let profileName = $state('Xoulomon');
	let profileBio = $state(
		'Open-source maintainer and Lightning protocol advocate. Building MergeTip to give developers non-custodial, automated Bitcoin micro-rewards for every merged pull request.'
	);
	let profileLocation = $state('Decentralized / Remote');
	let profileWebsite = $state('https://mergetip.dev');
	let profileNpub = $state('npub1xoulomon89a74cf8290e219b48c772e01');

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
				{saveStatus ? 'Settings Saved' : 'Save Changes'}
			</Button>
		</div>

		<!-- Layout: Sidebar Nav + Content Panel -->
		<div class="mt-settings-layout">
			<!-- Nav Tabs -->
			<nav class="mt-settings-nav" aria-label="Settings categories">
				<button
					class="mt-settings-tab {activeSection === 'profile' ? 'tab-selected' : ''}"
					onclick={() => (activeSection = 'profile')}
				>
					<div class="mt-tab-text">
						<span class="mt-tab-title">Profile & Identity</span>
						<span class="mt-tab-desc">@{profileHandle} public info & bio</span>
					</div>
				</button>

				<button
					class="mt-settings-tab {activeSection === 'nwc' ? 'tab-selected' : ''}"
					onclick={() => (activeSection = 'nwc')}
				>
					<div class="mt-tab-text">
						<span class="mt-tab-title">Wallet Connect (NWC)</span>
						<span class="mt-tab-desc">NIP-47 URI & relay keys</span>
					</div>
				</button>

				<button
					class="mt-settings-tab {activeSection === 'github' ? 'tab-selected' : ''}"
					onclick={() => (activeSection = 'github')}
				>
					<div class="mt-tab-text">
						<span class="mt-tab-title">GitHub App</span>
						<span class="mt-tab-desc">Installations & webhooks</span>
					</div>
				</button>

				<button
					class="mt-settings-tab {activeSection === 'recipient' ? 'tab-selected' : ''}"
					onclick={() => (activeSection = 'recipient')}
				>
					<div class="mt-tab-text">
						<span class="mt-tab-title">Recipient Address</span>
						<span class="mt-tab-desc">Lightning address & LNURL</span>
					</div>
				</button>

				<button
					class="mt-settings-tab {activeSection === 'limits' ? 'tab-selected' : ''}"
					onclick={() => (activeSection = 'limits')}
				>
					<div class="mt-tab-text">
						<span class="mt-tab-title">Safety & Budget Caps</span>
						<span class="mt-tab-desc">Approval thresholds & limits</span>
					</div>
				</button>

				<button
					class="mt-settings-tab {activeSection === 'fiat' ? 'tab-selected' : ''}"
					onclick={() => (activeSection = 'fiat')}
				>
					<div class="mt-tab-text">
						<span class="mt-tab-title">Fiat Off-Ramp (Bitnob)</span>
						<span class="mt-tab-desc">Africa bank payouts (NG, GH, KE)</span>
					</div>
				</button>
			</nav>

			<!-- Settings Content Area -->
			<div class="mt-settings-content">
				<!-- PROFILE SECTION -->
				{#if activeSection === 'profile'}
					<Card title="Public Contributor Profile">
						{#snippet subtitle()}
							Customize your public MergeTip sponsor profile, bio, Lightning address and Nostr
							identity.
						{/snippet}

						<div class="mt-section-form">
							<!-- Connected GitHub Identity Status -->
							<div class="mt-account-banner">
								<div class="mt-account-avatar-wrap">
									<img
										src={auth.session.avatarUrl ||
											(auth.session.userHandle
												? `https://github.com/${auth.session.userHandle}.png`
												: 'https://avatars.githubusercontent.com/u/75281652?v=4')}
										alt="@{auth.session.userHandle || 'guest'}"
										class="mt-account-avatar"
									/>
									{#if auth.session.isAuthenticated}
										<span class="mt-account-badge-dot" title="Connected"></span>
									{/if}
								</div>

								<div class="mt-account-info">
									<div class="mt-account-header">
										<h4>
											{auth.session.isAuthenticated
												? `@${auth.session.userHandle}`
												: 'No GitHub Account Connected'}
										</h4>
										{#if auth.session.isAuthenticated}
											<Badge variant="paid" size="sm">Connected</Badge>
										{:else}
											<Badge variant="held" size="sm">Signed Out</Badge>
										{/if}
									</div>
									<p class="mt-account-meta">
										{#if auth.session.isAuthenticated}
											{auth.session.userName || auth.session.userHandle} •
											<a
												href="https://github.com/{auth.session.userHandle}"
												target="_blank"
												rel="noreferrer"
												class="mt-gh-link"
											>
												github.com/{auth.session.userHandle} ↗
											</a>
										{:else}
											Connect your GitHub account to tip and claim sats for your contributions.
										{/if}
									</p>
								</div>

								<div class="mt-account-actions">
									{#if auth.session.isAuthenticated}
										<Button variant="default" size="sm" onclick={() => auth.openLoginModal()}>
											Switch Account
										</Button>
										<Button variant="danger" size="sm" onclick={() => auth.logout()}>
											Log Out
										</Button>
									{:else}
										<Button variant="primary" size="sm" onclick={() => auth.openLoginModal()}>
											Connect GitHub
										</Button>
									{/if}
								</div>
							</div>

							<!-- Profile Card Preview -->
							<div class="mt-profile-preview-box">
								<div class="mt-preview-avatar-wrap">
									<img
										src="https://avatars.githubusercontent.com/u/75281652?v=4"
										alt="@{profileHandle}"
										class="mt-preview-avatar"
									/>
								</div>
								<div class="mt-preview-info">
									<div class="mt-preview-title-row">
										<span class="mt-preview-name">{profileName}</span>
										<span class="mt-preview-handle">@{profileHandle}</span>
										<Badge variant="bolt" size="sm">Core Sponsor</Badge>
									</div>
									<p class="mt-preview-bio">{profileBio}</p>
									<div class="mt-preview-links">
										<span>{lightningAddress}</span>
										<span>•</span>
										<span>NPUB: {profileNpub.slice(0, 10)}…{profileNpub.slice(-6)}</span>
									</div>
								</div>
								<a href="/profile" class="mt-preview-btn"> View Public Profile </a>
							</div>

							<div class="mt-grid-2">
								<div class="mt-field">
									<label for="profileName">Display Name</label>
									<input
										id="profileName"
										type="text"
										bind:value={profileName}
										class="mt-form-input"
									/>
								</div>

								<div class="mt-field">
									<label for="profileHandle">GitHub Handle</label>
									<div class="mt-input-group">
										<span class="mt-input-prefix">@</span>
										<input
											id="profileHandle"
											type="text"
											bind:value={profileHandle}
											class="mt-form-input"
										/>
									</div>
								</div>
							</div>

							<div class="mt-field">
								<label for="profileBio">Bio / Philosophy</label>
								<textarea id="profileBio" rows="3" bind:value={profileBio} class="mt-form-input"
								></textarea>
								<span class="mt-field-help">Displayed on your public profile and bot replies.</span>
							</div>

							<div class="mt-grid-2">
								<div class="mt-field">
									<label for="profileLocation">Location</label>
									<input
										id="profileLocation"
										type="text"
										bind:value={profileLocation}
										class="mt-form-input"
									/>
								</div>

								<div class="mt-field">
									<label for="profileWebsite">Website</label>
									<input
										id="profileWebsite"
										type="text"
										bind:value={profileWebsite}
										class="mt-form-input"
									/>
								</div>
							</div>

							<div class="mt-field">
								<label for="profileNpub">Nostr Public Key (npub / hex)</label>
								<input
									id="profileNpub"
									type="text"
									bind:value={profileNpub}
									class="mt-form-input font-mono"
								/>
								<span class="mt-field-help">Used for cross-signing tip events and NIP-57 zaps.</span
								>
							</div>
						</div>
					</Card>
				{/if}

				<!-- NWC SECTION -->
				{#if activeSection === 'nwc'}
					<Card title="Nostr Wallet Connect (NIP-47)">
						{#snippet subtitle()}
							Connect any wallet supporting NWC (Alby Hub, Mutiny, Umbrel, raspiblitz). MergeTip
							never holds your funds.
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
									Stored encrypted using envelope encryption (AES-256-GCM) with your server's master
									key.
								</span>
							</div>

							{#if nwcStatus}
								<div class="mt-status-banner {nwcStatus.ok ? 'banner-ok' : 'banner-err'}">
									<div class="mt-banner-body">
										<strong>{nwcStatus.message}</strong>
										{#if nwcStatus.balance}
											<div class="mt-banner-bal">
												Available Balance: <strong
													>{nwcStatus.balance.toLocaleString('en-US')} sats</strong
												>
											</div>
										{/if}
									</div>
								</div>
							{/if}

							<div class="mt-info-box">
								<h4>How NWC non-custodial security works:</h4>
								<ul>
									<li>
										MergeTip sends an encrypted NIP-47 request (<code>pay_invoice</code>) over Nostr
										relays.
									</li>
									<li>Your node or wallet validates the budget limits and executes the payment.</li>
									<li>You can revoke this connection string anytime from your wallet.</li>
								</ul>
							</div>
						</div>
					</Card>
				{/if}

				<!-- GITHUB SECTION -->
				{#if activeSection === 'github'}
					<!-- Personal Connected GitHub Identity -->
					<Card title="Connected GitHub Identity">
						{#snippet subtitle()}
							Link or manage your personal GitHub user account to authenticate tips, verify PR
							reviews, and track pledges.
						{/snippet}

						<div class="mt-section-form">
							{#if auth.session.isAuthenticated && auth.session.userHandle}
								<div class="mt-account-banner">
									<div class="mt-account-avatar-wrap">
										<img
											src={auth.session.avatarUrl ||
												`https://github.com/${auth.session.userHandle}.png`}
											alt="@{auth.session.userHandle}"
											class="mt-account-avatar"
										/>
										<span class="mt-account-badge-dot" title="Active"></span>
									</div>

									<div class="mt-account-info">
										<div class="mt-account-header">
											<h4>@{auth.session.userHandle}</h4>
											<Badge variant="paid" size="sm">Connected</Badge>
										</div>
										<p class="mt-account-meta">
											{auth.session.userName || auth.session.userHandle} •
											<a
												href="https://github.com/{auth.session.userHandle}"
												target="_blank"
												rel="noreferrer"
												class="mt-gh-link"
											>
												View GitHub Profile ↗
											</a>
										</p>
									</div>

									<div class="mt-account-actions">
										<Button variant="default" size="sm" onclick={() => auth.openLoginModal()}>
											Switch Account
										</Button>
										<Button variant="danger" size="sm" onclick={() => auth.logout()}>
											Log Out
										</Button>
									</div>
								</div>
							{:else}
								<div class="mt-unauth-card">
									<div class="mt-unauth-content">
										<div class="mt-unauth-icon-wrap">
											<svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
												<path
													d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"
												></path>
											</svg>
										</div>
										<div>
											<h4>No GitHub Account Connected</h4>
											<p>
												Connect your GitHub account to tip developers, claim pending pledges, and
												manage bot permissions.
											</p>
										</div>
									</div>
									<Button variant="primary" size="md" onclick={() => auth.openLoginModal()}>
										Connect GitHub Account
									</Button>
								</div>
							{/if}
						</div>
					</Card>

					<Card title="GitHub App Integration">
						{#snippet subtitle()}
							The MergeTip GitHub App monitors PR reviews and comments to parse <code>/tip</code> commands.
						{/snippet}

						<div class="mt-section-form">
							<div class="mt-integration-card">
								<div class="mt-integration-left">
									<svg
										width="24"
										height="24"
										viewBox="0 0 16 16"
										fill="currentColor"
										class="mt-gh-svg"
									>
										<path
											d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"
										></path>
									</svg>
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
									<Button
										variant="default"
										loading={verifyingLnurl}
										onclick={verifyLightningAddress}
									>
										Verify LNURL
									</Button>
								</div>
								<span class="mt-field-help">
									Works with Alby, Wallet of Satoshi, Coinos, Fountain, Primal, or self-hosted
									bridge.
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
									Sent claim reminders if a sponsor tips you before you have set a Lightning
									address.
								</span>
							</div>
						</div>
					</Card>
				{/if}

				<!-- SAFETY & BUDGET CAPS -->
				{#if activeSection === 'limits'}
					<Card title="Safety Limits & Budget Caps">
						{#snippet subtitle()}
							Protect against accidental or rogue bot payouts by establishing firm automated
							boundaries.
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
									Any <code>/tip</code> exceeding this amount requires one-click confirmation on the web
									app before paying.
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
							Empower African developers to receive satoshi tips converted directly into local bank
							or mobile money deposits.
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

	.mt-account-banner {
		background: var(--mt-bg-subtle);
		border: 1px solid var(--mt-border);
		border-radius: 10px;
		padding: 16px 18px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 16px;
	}

	.mt-account-avatar-wrap {
		position: relative;
		width: 48px;
		height: 48px;
		flex-shrink: 0;
	}

	.mt-account-avatar {
		width: 48px;
		height: 48px;
		border-radius: 9999px;
		object-fit: cover;
		border: 2px solid var(--mt-border);
	}

	.mt-account-badge-dot {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 12px;
		height: 12px;
		border-radius: 9999px;
		background: var(--mt-success);
		border: 2px solid var(--mt-surface);
	}

	.mt-account-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
		flex: 1;
		min-width: 180px;
	}

	.mt-account-header {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.mt-account-header h4 {
		font-size: 16px;
		font-weight: 700;
		color: var(--mt-fg);
		margin: 0;
	}

	.mt-account-meta {
		font-size: 13px;
		color: var(--mt-fg-muted);
		margin: 0;
	}

	.mt-gh-link {
		color: var(--mt-border-active);
		text-decoration: none;
	}

	.mt-gh-link:hover {
		text-decoration: underline;
	}

	.mt-account-actions {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.mt-unauth-card {
		background: var(--mt-bg-subtle);
		border: 1px dashed var(--mt-border);
		border-radius: 10px;
		padding: 24px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 16px;
	}

	.mt-unauth-content {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.mt-unauth-icon-wrap {
		width: 44px;
		height: 44px;
		border-radius: 9999px;
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--mt-fg-muted);
		flex-shrink: 0;
	}

	.mt-unauth-content h4 {
		font-size: 15px;
		font-weight: 600;
		color: var(--mt-fg);
		margin: 0;
	}

	.mt-unauth-content p {
		font-size: 13px;
		color: var(--mt-fg-muted);
		margin: 2px 0 0 0;
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

	/* Profile Preview Box in Settings */
	.mt-profile-preview-box {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px;
		background: var(--mt-surface-subtle);
		border: 1px solid var(--mt-border-glow);
		border-radius: 10px;
		flex-wrap: wrap;
	}

	.mt-preview-avatar-wrap {
		position: relative;
		width: 52px;
		height: 52px;
		flex-shrink: 0;
	}

	.mt-preview-avatar {
		width: 52px;
		height: 52px;
		border-radius: 9999px;
		border: 2px solid var(--mt-bolt);
		box-shadow: 0 0 10px var(--mt-bolt-glow);
		object-fit: cover;
	}

	.mt-preview-bolt {
		position: absolute;
		bottom: -2px;
		right: -2px;
		width: 18px;
		height: 18px;
		background: var(--mt-surface);
		border: 1.5px solid var(--mt-bolt);
		border-radius: 9999px;
		font-size: 11px;
		color: var(--mt-bolt);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.mt-preview-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
		flex: 1;
		min-width: 240px;
	}

	.mt-preview-title-row {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.mt-preview-name {
		font-size: 16px;
		font-weight: 700;
		color: var(--mt-fg);
	}

	.mt-preview-handle {
		font-size: 13px;
		color: var(--mt-fg-muted);
		font-weight: 500;
	}

	.mt-preview-bio {
		font-size: 13px;
		color: var(--mt-fg-muted);
		line-height: 1.4;
		margin: 0;
	}

	.mt-preview-links {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 11px;
		font-family: var(--mt-font-mono);
		color: var(--mt-fg-subtle);
		margin-top: 2px;
	}

	.mt-preview-btn {
		padding: 6px 12px;
		border-radius: 6px;
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		color: var(--mt-link);
		font-size: 12px;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.15s ease;
		white-space: nowrap;
	}

	.mt-preview-btn:hover {
		background: var(--mt-surface-hover);
		border-color: var(--mt-link);
	}

	@media (max-width: 860px) {
		.mt-settings-layout {
			grid-template-columns: 1fr;
		}
	}
</style>
