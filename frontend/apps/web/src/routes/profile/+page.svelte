<script lang="ts">
	import {
		Button,
		Badge,
		Card,
		StatCard,
		TipTable,
		formatFiatUSD,
		formatBitnobFiat,
		Modal
	} from '@mergetip/ui';
	import { auth } from '../../lib/auth.svelte';

	// Profile User State
	let activeHandle = $derived(auth.session.userHandle || 'xoulomon');
	let activeName = $derived(auth.session.userName || 'Xoulomon');
	let activeAvatar = $derived(auth.session.avatarUrl || `https://github.com/${activeHandle}.png`);

	let profile = $derived({
		handle: activeHandle,
		name: activeName,
		title:
			auth.session.userHandle === 'xoulomon'
				? 'Core Maintainer & Genesis Sponsor'
				: 'Open-Source Contributor',
		avatar: activeAvatar,
		bio: 'Open-source maintainer and Lightning protocol advocate. Building MergeTip to give developers non-custodial, automated Bitcoin micro-rewards for every merged pull request.',
		location: 'Decentralized / Remote',
		lightningAddress: auth.session.lightningAddress || `${activeHandle}@getalby.com`,
		nostrNpub: auth.session.nostrPubkey || 'npub1xoulomon89a74cf8290e219b48c772e01',
		githubUrl: `https://github.com/${activeHandle}`,
		website: 'https://mergetip.dev',
		joinedDate: 'March 2024',
		totalTippedSats: 185000,
		tipsCount: 42,
		prsSponsored: 28,
		contributorsCount: 19,
		balanceSats: auth.session.walletBalanceSats || 385000
	});

	// Active tab
	let activeTab = $state<'activity' | 'repos' | 'zap' | 'proofs'>('activity');

	// Copy feedback state
	let copyNotice = $state<string | null>(null);

	function copyToClipboard(text: string, label: string) {
		navigator.clipboard?.writeText(text);
		copyNotice = label;
		setTimeout(() => {
			if (copyNotice === label) copyNotice = null;
		}, 2200);
	}

	// Modal states
	let showQrModal = $state(false);
	let showTipModal = $state(false);
	let tipAmountSats = $state(2100);
	let tipMemo = $state('Great work on MergeTip! Keep shipping.');
	let tipSuccess = $state(false);
	let tipPaying = $state(false);

	// Tip presets
	const tipPresets = [21, 210, 1000, 2100, 5000, 10000];

	function handleSendTip() {
		tipPaying = true;
		setTimeout(() => {
			tipPaying = false;
			tipSuccess = true;
			setTimeout(() => {
				tipSuccess = false;
				showTipModal = false;
			}, 1800);
		}, 900);
	}

	// Sponsored tips stream
	const sponsoredTips = [
		{
			id: 'tip-xou-01',
			sender: 'xoulomon',
			repo: 'xoulomon/mergetip',
			pr_number: 42,
			pr_title: 'feat(ui): implement Primer tokens and dark/light mode',
			receiver: 'alicesmith',
			amount_sats: 5000,
			on_merge: false,
			state: 'paid' as const,
			created_at: '2026-10-28T05:10:00Z'
		},
		{
			id: 'tip-xou-02',
			sender: 'xoulomon',
			repo: 'xoulomon/mergetip',
			pr_number: 44,
			pr_title: 'feat(core): skip-locked postgres poll queue',
			receiver: 'sarah-core',
			amount_sats: 25000,
			on_merge: true,
			state: 'held' as const,
			created_at: '2026-10-28T04:30:00Z'
		},
		{
			id: 'tip-xou-03',
			sender: 'xoulomon',
			repo: 'xoulomon/nostr-relay-pool',
			pr_number: 17,
			pr_title: 'fix(ws): auto-reconnect backoff with jitter',
			receiver: 'dev_kwame',
			amount_sats: 3500,
			on_merge: false,
			state: 'paid' as const,
			created_at: '2026-10-27T18:22:00Z'
		},
		{
			id: 'tip-xou-04',
			sender: 'xoulomon',
			repo: 'xoulomon/mergetip',
			pr_number: 39,
			pr_title: 'docs: complete NIP-47 and LNURL integration guide',
			receiver: 'bobbuilder',
			amount_sats: 2100,
			on_merge: true,
			state: 'paid' as const,
			created_at: '2026-10-27T11:45:00Z'
		},
		{
			id: 'tip-xou-05',
			sender: 'xoulomon',
			repo: 'nostr-protocol/nips',
			pr_number: 1047,
			pr_title: 'nip-47: clarify budget renewal and notification events',
			receiver: 'fiatjaf',
			amount_sats: 21000,
			on_merge: false,
			state: 'paid' as const,
			created_at: '2026-10-25T14:00:00Z'
		}
	];

	// Repositories maintained
	const maintainedRepos = [
		{
			name: 'xoulomon/mergetip',
			desc: 'Non-custodial Bitcoin tipping protocol for GitHub pull requests via NWC, LNURL, Breez and Bitnob.',
			lang: 'Rust + Svelte',
			stars: 48,
			tipsCount: 22,
			satsDistributed: 98500,
			status: 'Active',
			botInstalled: true
		},
		{
			name: 'xoulomon/nostr-relay-pool',
			desc: 'High-concurrency Nostr WebSocket connection manager with multiplexed subscriptions and auto-healing.',
			lang: 'TypeScript',
			stars: 31,
			tipsCount: 11,
			satsDistributed: 42000,
			status: 'Active',
			botInstalled: true
		},
		{
			name: 'nostr-protocol/nips',
			desc: 'Nostr Implementation Possibilities specification repository — community sponsor for developer work.',
			lang: 'Markdown',
			stars: 3200,
			tipsCount: 9,
			satsDistributed: 44500,
			status: 'Sponsoring',
			botInstalled: false
		}
	];
</script>

<svelte:head>
	<title>@{profile.handle} ({profile.name}) - MergeTip Profile</title>
</svelte:head>

<div class="mt-profile-page">
	<!-- Top Cover Banner -->
	<div class="mt-cover-banner">
		<div class="mt-cover-grid"></div>
		<div class="mt-cover-badge">
			<span class="mt-cover-dot"></span>
			Verified MergeTip Genesis Sponsor
		</div>
	</div>

	<div class="mt-profile-container">
		<!-- Profile Card Header -->
		<div class="mt-profile-header-card">
			<div class="mt-header-main">
				<!-- Avatar with status ring -->
				<div class="mt-avatar-large-wrap">
					<img
						src={profile.avatar}
						alt="@{profile.handle}"
						class="mt-avatar-large"
						onerror={(e) => {
							const el = e.currentTarget as HTMLImageElement;
							el.src =
								'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="%239198a1"><circle cx="12" cy="12" r="10"/></svg>';
						}}
					/>
				</div>

				<!-- Identity & Badges -->
				<div class="mt-header-info">
					<div class="mt-header-title-row">
						<div>
							<h1 class="mt-user-fullname">{profile.name}</h1>
							<div class="mt-user-handle-line">
								<span class="mt-profile-handle">@{profile.handle}</span>
								<span class="mt-role-pill">Core Maintainer</span>
								<span class="mt-nwc-pill">NWC Escrow Active</span>
							</div>
						</div>

						<!-- Quick Actions -->
						<div class="mt-header-actions">
							<Button variant="bolt" onclick={() => (showTipModal = true)}>
								<span>Tip @{profile.handle}</span>
							</Button>
							<Button variant="outline" onclick={() => (showQrModal = true)}>
								<span>QR Code</span>
							</Button>
							<Button
								variant="default"
								onclick={() => copyToClipboard(window.location.href, 'profile')}
							>
								{copyNotice === 'profile' ? 'Link Copied' : 'Share'}
							</Button>
						</div>
					</div>

					<!-- Bio -->
					<p class="mt-user-bio">{profile.bio}</p>

					<!-- Metadata & Protocol Pills -->
					<div class="mt-meta-chips">
						<div class="mt-meta-chip">
							<span>{profile.location}</span>
						</div>
						<div class="mt-meta-chip">
							<span>Member since {profile.joinedDate}</span>
						</div>
						<a
							href={profile.githubUrl}
							target="_blank"
							rel="noreferrer"
							class="mt-meta-chip mt-meta-link"
						>
							<span>github.com/{profile.handle}</span>
						</a>
						<a
							href={profile.website}
							target="_blank"
							rel="noreferrer"
							class="mt-meta-chip mt-meta-link"
						>
							<span>mergetip.dev</span>
						</a>
					</div>

					<!-- Protocol Identity Boxes -->
					<div class="mt-protocol-cards">
						<!-- Lightning Address -->
						<div class="mt-protocol-card">
							<span class="mt-proto-tag">LN</span>
							<div class="mt-card-details">
								<span class="mt-card-label">Lightning Address (LNURL-pay)</span>
								<span class="mt-card-value">{profile.lightningAddress}</span>
							</div>
							<button
								class="mt-card-copy-btn"
								onclick={() => copyToClipboard(profile.lightningAddress, 'ln')}
								title="Copy Lightning Address"
							>
								{copyNotice === 'ln' ? 'Copied' : 'Copy'}
							</button>
						</div>

						<!-- Nostr Pubkey -->
						<div class="mt-protocol-card">
							<span class="mt-proto-tag">NPUB</span>
							<div class="mt-card-details">
								<span class="mt-card-label">Nostr Public Key</span>
								<span class="mt-card-value"
									>{profile.nostrNpub.slice(0, 14)}…{profile.nostrNpub.slice(-8)}</span
								>
							</div>
							<button
								class="mt-card-copy-btn"
								onclick={() => copyToClipboard(profile.nostrNpub, 'nostr')}
								title="Copy Nostr npub"
							>
								{copyNotice === 'nostr' ? 'Copied' : 'Copy'}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Impact Stats Ribbon -->
		<div class="mt-stats-grid">
			<StatCard
				label="Total Sats Disbursed"
				sats={profile.totalTippedSats}
				trend="+32% this month"
				trendUp={true}
				accent="bolt"
			/>
			<StatCard
				label="Average PR Payout"
				sats={4400}
				subtitle="Across 28 pull requests"
				accent="info"
			/>
			<StatCard
				label="Largest Single Tip"
				sats={25000}
				subtitle="PR #44 skip-locked queue"
				accent="warning"
			/>
			<StatCard
				label="Connected NWC Balance"
				sats={profile.balanceSats}
				subtitle="Available for automated merge tips"
				accent="success"
			/>
		</div>

		<!-- Main Content Area with Tabs -->
		<div class="mt-tabs-section">
			<!-- Tab Navigation Bar -->
			<div class="mt-tab-bar" role="tablist">
				<button
					class="mt-tab-btn {activeTab === 'activity' ? 'tab-active' : ''}"
					onclick={() => (activeTab = 'activity')}
					role="tab"
					aria-selected={activeTab === 'activity'}
				>
					<span>Sponsored Tips</span>
					<span class="mt-tab-count">{sponsoredTips.length}</span>
				</button>

				<button
					class="mt-tab-btn {activeTab === 'repos' ? 'tab-active' : ''}"
					onclick={() => (activeTab = 'repos')}
					role="tab"
					aria-selected={activeTab === 'repos'}
				>
					<span>Supported Repositories</span>
					<span class="mt-tab-count">{maintainedRepos.length}</span>
				</button>

				<button
					class="mt-tab-btn {activeTab === 'zap' ? 'tab-active' : ''}"
					onclick={() => (activeTab = 'zap')}
					role="tab"
					aria-selected={activeTab === 'zap'}
				>
					<span>Direct Zap / Tip</span>
				</button>

				<button
					class="mt-tab-btn {activeTab === 'proofs' ? 'tab-active' : ''}"
					onclick={() => (activeTab = 'proofs')}
					role="tab"
					aria-selected={activeTab === 'proofs'}
				>
					<span>Protocol Proofs & Badges</span>
				</button>
			</div>

			<!-- Tab 1: Activity -->
			{#if activeTab === 'activity'}
				<Card
					title="Verified Tipping Activity"
					subtitle="Recent tips disbursed to contributors for merged code and instant commendations."
				>
					<TipTable tips={sponsoredTips} />
				</Card>
			{/if}

			<!-- Tab 2: Maintained Repositories -->
			{#if activeTab === 'repos'}
				<div class="mt-repos-grid">
					{#each maintainedRepos as repo (repo.name)}
						<Card title={repo.name} subtitle={repo.lang}>
							{#snippet badge()}
								{#if repo.botInstalled}
									<Badge variant="paid" size="sm">Bot Active</Badge>
								{:else}
									<Badge variant="neutral" size="sm">Sponsoring</Badge>
								{/if}
							{/snippet}

							<p class="mt-repo-desc">{repo.desc}</p>

							<div class="mt-repo-stats-row">
								<div class="mt-repo-stat">
									<span class="mt-repo-stat-lbl">Tips Sent</span>
									<span class="mt-repo-stat-val">{repo.tipsCount}</span>
								</div>
								<div class="mt-repo-stat">
									<span class="mt-repo-stat-lbl">Total Distributed</span>
									<span class="mt-repo-stat-val">{repo.satsDistributed.toLocaleString()} sats</span>
								</div>
								<div class="mt-repo-stat">
									<span class="mt-repo-stat-lbl">GitHub Stars</span>
									<span class="mt-repo-stat-val">{repo.stars.toLocaleString()} stars</span>
								</div>
							</div>

							{#snippet footer()}
								<div class="mt-repo-footer">
									<a
										href="https://github.com/{repo.name}"
										target="_blank"
										rel="noreferrer"
										class="mt-repo-btn"
									>
										View on GitHub
									</a>
									<a href="/settings" class="mt-repo-settings-btn"> Configure Caps </a>
								</div>
							{/snippet}
						</Card>
					{/each}
				</div>
			{/if}

			<!-- Tab 3: Direct Tip / Zap -->
			{#if activeTab === 'zap'}
				<div class="mt-zap-container">
					<Card
						title="Send a Direct Lightning Tip to @{profile.handle}"
						subtitle="Support @{profile.handle}'s open-source work directly via Lightning Address or WebLN."
					>
						<div class="mt-zap-form">
							<!-- Recipient summary card -->
							<div class="mt-zap-recipient">
								<img src={profile.avatar} alt="@{profile.handle}" class="mt-zap-avatar" />
								<div class="mt-zap-recipient-text">
									<span class="mt-zap-name">{profile.name}</span>
									<span class="mt-zap-address">{profile.lightningAddress}</span>
								</div>
								<Badge variant="bolt" size="sm">Zero Custody</Badge>
							</div>

							<!-- Preset Amount Chips -->
							<div class="mt-form-group">
								<!-- svelte-ignore a11y_label_has_associated_control -->
								<label class="mt-label">Select Amount (Sats)</label>
								<div class="mt-presets-grid">
									{#each tipPresets as preset (preset)}
										<button
											type="button"
											class="mt-preset-chip {tipAmountSats === preset ? 'chip-selected' : ''}"
											onclick={() => (tipAmountSats = preset)}
										>
											<span class="mt-chip-sats">{preset.toLocaleString()}</span>
											<span class="mt-chip-fiat">{formatFiatUSD(preset)}</span>
										</button>
									{/each}
								</div>
							</div>

							<!-- Custom Sat Input -->
							<div class="mt-form-group">
								<label for="custom-sats" class="mt-label">Custom Sat Amount</label>
								<div class="mt-input-with-addons">
									<span class="mt-addon-left">SATS</span>
									<input
										id="custom-sats"
										type="number"
										min="1"
										class="mt-input"
										bind:value={tipAmountSats}
									/>
									<span class="mt-addon-right">sats</span>
								</div>
								<div class="mt-fiat-conversions">
									<span>≈ {formatFiatUSD(tipAmountSats)} USD</span>
									<span class="mt-bullet">•</span>
									<span>{formatBitnobFiat(tipAmountSats, 'NGN')}</span>
									<span class="mt-bullet">•</span>
									<span>{formatBitnobFiat(tipAmountSats, 'GHS')}</span>
									<span class="mt-bullet">•</span>
									<span>{formatBitnobFiat(tipAmountSats, 'KES')}</span>
								</div>
							</div>

							<!-- Message / Memo -->
							<div class="mt-form-group">
								<label for="memo" class="mt-label">Public Note / Memo</label>
								<input
									id="memo"
									type="text"
									class="mt-input"
									bind:value={tipMemo}
									placeholder="e.g. Thanks for MergeTip and quick PR review!"
								/>
							</div>

							<!-- Actions -->
							<div class="mt-zap-actions">
								<Button variant="bolt" size="lg" loading={tipPaying} onclick={handleSendTip}>
									{tipSuccess
										? 'Payment Confirmed'
										: `Pay ${tipAmountSats.toLocaleString()} sats (${formatFiatUSD(tipAmountSats)})`}
								</Button>
								<Button variant="outline" size="lg" onclick={() => (showQrModal = true)}>
									Show QR Code
								</Button>
							</div>
						</div>
					</Card>
				</div>
			{/if}

			<!-- Tab 4: Protocol Proofs & Badges -->
			{#if activeTab === 'proofs'}
				<div class="mt-proofs-grid">
					<!-- Badges Card -->
					<Card title="Earned Protocol Badges">
						<div class="mt-badges-list">
							<div class="mt-badge-item">
								<div class="mt-badge-info">
									<span class="mt-badge-name">Genesis Sponsor</span>
									<span class="mt-badge-desc"
										>One of the first 50 project sponsors on the MergeTip protocol.</span
									>
								</div>
								<Badge variant="bolt" size="sm">Genesis</Badge>
							</div>

							<div class="mt-badge-item">
								<div class="mt-badge-info">
									<span class="mt-badge-name">Non-Custodial Purist</span>
									<span class="mt-badge-desc"
										>100% of tips funded directly through user-held NIP-47 wallet connect keys.</span
									>
								</div>
								<Badge variant="paid" size="sm">Verified</Badge>
							</div>

							<div class="mt-badge-item">
								<div class="mt-badge-info">
									<span class="mt-badge-name">Pan-African Rail Supporter</span>
									<span class="mt-badge-desc"
										>Funded contributor payouts into Bitnob corridors across Nigeria, Ghana & Kenya.</span
									>
								</div>
								<Badge variant="accent" size="sm">Active</Badge>
							</div>

							<div class="mt-badge-item">
								<div class="mt-badge-info">
									<span class="mt-badge-name">Instant Settlement Champion</span>
									<span class="mt-badge-desc"
										>Average merge-to-lightning payout velocity under 2.4 seconds.</span
									>
								</div>
								<Badge variant="verifying" size="sm">Sub-3s</Badge>
							</div>
						</div>
					</Card>

					<!-- Cryptographic Proofs -->
					<Card title="Cryptographic Identity & NWC Escrow">
						<div class="mt-proofs-list">
							<div class="mt-proof-row">
								<span class="mt-proof-label">NWC Relay Connection</span>
								<span class="mt-proof-val">ws://localhost:7000</span>
								<Badge variant="paid" size="sm">Online</Badge>
							</div>

							<div class="mt-proof-row">
								<span class="mt-proof-label">NIP-47 Permissions</span>
								<span class="mt-proof-val">pay_invoice, get_balance, make_invoice</span>
								<Badge variant="neutral" size="sm">Standard</Badge>
							</div>

							<div class="mt-proof-row">
								<span class="mt-proof-label">Monthly Spending Cap</span>
								<span class="mt-proof-val">100,000 sats / month</span>
								<Badge variant="neutral" size="sm">Active</Badge>
							</div>

							<div class="mt-proof-row">
								<span class="mt-proof-label">Per-Tip Threshold Limit</span>
								<span class="mt-proof-val">10,000 sats (auto-approval)</span>
								<Badge variant="neutral" size="sm">Enforced</Badge>
							</div>

							<div class="mt-proof-row">
								<span class="mt-proof-label">LNURL-pay Endpoint</span>
								<span class="mt-proof-val">https://getalby.com/.well-known/lnurlp/xoulomon</span>
								<Badge variant="paid" size="sm">200 OK</Badge>
							</div>
						</div>
					</Card>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Modal: LNURL QR Code -->
<Modal open={showQrModal} title="Lightning Address QR Code" onclose={() => (showQrModal = false)}>
	<div class="mt-qr-dialog">
		<div class="mt-qr-frame">
			<!-- SVG QR Code Placeholder -->
			<svg width="180" height="180" viewBox="0 0 24 24" fill="currentColor" class="mt-qr-svg">
				<path
					d="M2 2h8v8H2V2Zm2 2v4h4V4H4Zm10-2h8v8h-8V2Zm2 2v4h4V4h-4ZM2 14h8v8H2v-8Zm2 2v4h4v-4H4Zm14 2h4v4h-4v-4Zm-4-2h2v2h-2v-2Zm4-4h2v2h-2v-2Zm-4 4h2v2h-2v-2Zm2 2h2v2h-2v-2Z"
				></path>
			</svg>
		</div>
		<div class="mt-qr-meta">
			<span class="mt-qr-address">{profile.lightningAddress}</span>
			<p class="mt-qr-note">
				Scan with Phoenix, Zeus, Cash App, Alby Go, Strike, or any Lightning wallet.
			</p>
		</div>
	</div>

	{#snippet footer()}
		<Button variant="default" onclick={() => copyToClipboard(profile.lightningAddress, 'modal-ln')}>
			{copyNotice === 'modal-ln' ? 'Copied' : 'Copy Address'}
		</Button>
		<Button variant="primary" onclick={() => (showQrModal = false)}>Done</Button>
	{/snippet}
</Modal>

<!-- Modal: Send Tip -->
<Modal open={showTipModal} title="Tip @{profile.handle}" onclose={() => (showTipModal = false)}>
	<div class="mt-modal-tip-body">
		<div class="mt-modal-user-row">
			<img src={profile.avatar} alt="@{profile.handle}" class="mt-modal-avatar" />
			<div>
				<span class="mt-modal-username">{profile.name} (@{profile.handle})</span>
				<span class="mt-modal-address">{profile.lightningAddress}</span>
			</div>
		</div>

		<div class="mt-form-group">
			<label for="modal-amount" class="mt-label">Tip Amount (Sats)</label>
			<input id="modal-amount" type="number" class="mt-input" bind:value={tipAmountSats} />
			<span class="mt-form-hint">≈ {formatFiatUSD(tipAmountSats)} USD</span>
		</div>

		<div class="mt-form-group">
			<label for="modal-memo" class="mt-label">Public Memo</label>
			<input id="modal-memo" type="text" class="mt-input" bind:value={tipMemo} />
		</div>

		{#if tipSuccess}
			<div class="mt-success-banner">
				<span>Payment settled instantly via Lightning! Preimage verified.</span>
			</div>
		{/if}
	</div>

	{#snippet footer()}
		<Button variant="outline" onclick={() => (showTipModal = false)}>Cancel</Button>
		<Button variant="bolt" loading={tipPaying} onclick={handleSendTip}>
			{tipSuccess ? 'Settled' : `Pay ${tipAmountSats.toLocaleString()} sats`}
		</Button>
	{/snippet}
</Modal>

<style>
	.mt-profile-page {
		min-height: 100vh;
		background: var(--mt-bg);
		padding-bottom: 60px;
	}

	/* Cover Banner */
	.mt-cover-banner {
		height: 160px;
		background: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%);
		position: relative;
		border-bottom: 1px solid var(--mt-border);
		overflow: hidden;
	}

	.mt-cover-grid {
		position: absolute;
		inset: 0;
		background-image: radial-gradient(var(--mt-border-glow) 1px, transparent 1px);
		background-size: 24px 24px;
		opacity: 0.6;
	}

	.mt-cover-badge {
		position: absolute;
		bottom: 16px;
		right: 24px;
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		border-radius: 9999px;
		background: rgba(13, 17, 23, 0.8);
		border: 1px solid var(--mt-bolt);
		color: var(--mt-bolt);
		font-size: 11px;
		font-weight: 600;
		backdrop-filter: blur(6px);
		box-shadow: 0 0 12px var(--mt-bolt-glow);
	}

	.mt-cover-dot {
		width: 6px;
		height: 6px;
		border-radius: 9999px;
		background: var(--mt-bolt);
	}

	.mt-profile-container {
		max-width: 1200px;
		margin: -48px auto 0;
		padding: 0 20px;
		display: flex;
		flex-direction: column;
		gap: 24px;
		position: relative;
		z-index: 2;
	}

	/* Profile Header Card */
	.mt-profile-header-card {
		background: var(--mt-surface);
		border: 1px solid var(--mt-border-glow);
		border-radius: 12px;
		padding: 24px 28px;
		box-shadow: 0 4px 20px var(--mt-shadow);
	}

	.mt-header-main {
		display: flex;
		gap: 24px;
		align-items: flex-start;
	}

	.mt-avatar-large-wrap {
		position: relative;
		width: 96px;
		height: 96px;
		flex-shrink: 0;
	}

	.mt-avatar-large {
		width: 96px;
		height: 96px;
		border-radius: 9999px;
		object-fit: cover;
		border: 3px solid var(--mt-bolt);
		box-shadow: 0 0 16px var(--mt-bolt-glow);
		background: var(--mt-surface-subtle);
	}

	.mt-avatar-badge {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 26px;
		height: 26px;
		border-radius: 9999px;
		background: var(--mt-surface);
		border: 2px solid var(--mt-bolt);
		color: var(--mt-bolt);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 13px;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
	}

	.mt-header-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-width: 0;
	}

	.mt-header-title-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
		flex-wrap: wrap;
	}

	.mt-user-fullname {
		font-size: 26px;
		font-weight: 700;
		color: var(--mt-fg);
		line-height: 1.2;
		margin: 0;
	}

	.mt-user-handle-line {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 4px;
		flex-wrap: wrap;
	}

	.mt-profile-handle {
		font-size: 16px;
		font-weight: 600;
		color: var(--mt-fg-muted);
	}

	.mt-role-pill {
		font-size: 11px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 9999px;
		background: var(--mt-bolt-subtle);
		color: var(--mt-bolt);
		border: 1px solid var(--mt-bolt);
	}

	.mt-nwc-pill {
		font-size: 11px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 9999px;
		background: rgba(46, 160, 67, 0.15);
		color: var(--mt-success);
		border: 1px solid var(--mt-success);
	}

	.mt-header-actions {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.mt-action-icon {
		color: var(--mt-bolt);
	}

	.mt-user-bio {
		font-size: 14px;
		line-height: 1.5;
		color: var(--mt-fg);
		margin: 0;
		max-width: 820px;
	}

	.mt-meta-chips {
		display: flex;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
		font-size: 13px;
		color: var(--mt-fg-muted);
	}

	.mt-meta-chip {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.mt-meta-link {
		color: var(--mt-fg-muted);
		text-decoration: none;
		transition: color 0.15s ease;
	}

	.mt-meta-link:hover {
		color: var(--mt-link);
		text-decoration: underline;
	}

	.mt-chip-icon {
		font-size: 13px;
	}

	.mt-protocol-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 12px;
		margin-top: 4px;
	}

	.mt-protocol-card {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 12px;
		background: var(--mt-surface-subtle);
		border: 1px solid var(--mt-border);
		border-radius: 8px;
	}

	.mt-card-icon {
		font-size: 16px;
		color: var(--mt-bolt);
		flex-shrink: 0;
	}

	.mt-card-icon-nostr {
		color: #a371f7;
	}

	.mt-card-details {
		display: flex;
		flex-direction: column;
		gap: 1px;
		flex: 1;
		min-width: 0;
	}

	.mt-card-label {
		font-size: 11px;
		font-weight: 500;
		color: var(--mt-fg-subtle);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.mt-card-value {
		font-family: var(--mt-font-mono);
		font-size: 12px;
		font-weight: 600;
		color: var(--mt-fg);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.mt-card-copy-btn {
		background: var(--mt-btn-bg);
		border: 1px solid var(--mt-border);
		border-radius: 6px;
		padding: 4px 8px;
		font-size: 11px;
		font-weight: 600;
		color: var(--mt-fg-muted);
		cursor: pointer;
		transition: all 0.15s ease;
		flex-shrink: 0;
	}

	.mt-card-copy-btn:hover {
		background: var(--mt-btn-hover);
		color: var(--mt-fg);
		border-color: var(--mt-fg-subtle);
	}

	/* Stats Ribbon */
	.mt-stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 14px;
	}

	/* Tabs Section */
	.mt-tabs-section {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.mt-tab-bar {
		display: flex;
		align-items: center;
		gap: 6px;
		border-bottom: 1px solid var(--mt-border);
		padding-bottom: 2px;
		overflow-x: auto;
	}

	.mt-tab-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px;
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		font-size: 14px;
		font-weight: 500;
		color: var(--mt-fg-muted);
		cursor: pointer;
		transition: all 0.15s ease;
		white-space: nowrap;
	}

	.mt-tab-btn:hover {
		color: var(--mt-fg);
	}

	.mt-tab-btn.tab-active {
		color: var(--mt-fg);
		font-weight: 600;
		border-bottom-color: var(--mt-bolt);
	}

	.mt-tab-emoji {
		font-size: 14px;
	}

	.mt-tab-count {
		font-size: 11px;
		padding: 1px 6px;
		border-radius: 9999px;
		background: var(--mt-surface-hover);
		color: var(--mt-fg-muted);
	}

	/* Repos Grid */
	.mt-repos-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
		gap: 16px;
	}

	.mt-repo-desc {
		font-size: 13px;
		color: var(--mt-fg-muted);
		line-height: 1.45;
		margin: 0 0 16px;
		min-height: 38px;
	}

	.mt-repo-stats-row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		padding: 10px 12px;
		background: var(--mt-surface-subtle);
		border-radius: 8px;
		border: 1px solid var(--mt-border);
	}

	.mt-repo-stat {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.mt-repo-stat-lbl {
		font-size: 10px;
		color: var(--mt-fg-subtle);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.mt-repo-stat-val {
		font-size: 12px;
		font-weight: 700;
		color: var(--mt-fg);
	}

	.mt-repo-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		font-size: 12px;
	}

	.mt-repo-btn {
		color: var(--mt-fg-muted);
		text-decoration: none;
		font-weight: 500;
	}

	.mt-repo-btn:hover {
		color: var(--mt-fg);
	}

	.mt-repo-settings-btn {
		color: var(--mt-link);
		text-decoration: none;
		font-weight: 600;
	}

	.mt-repo-settings-btn:hover {
		text-decoration: underline;
	}

	/* Direct Zap / Tip Tab */
	.mt-zap-container {
		max-width: 680px;
		margin: 0 auto;
		width: 100%;
	}

	.mt-zap-form {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.mt-zap-recipient {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background: var(--mt-surface-subtle);
		border: 1px solid var(--mt-border);
		border-radius: 8px;
	}

	.mt-zap-avatar {
		width: 40px;
		height: 40px;
		border-radius: 9999px;
		border: 2px solid var(--mt-bolt);
	}

	.mt-zap-recipient-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
	}

	.mt-zap-name {
		font-weight: 700;
		font-size: 14px;
		color: var(--mt-fg);
	}

	.mt-zap-address {
		font-family: var(--mt-font-mono);
		font-size: 12px;
		color: var(--mt-fg-muted);
	}

	.mt-form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.mt-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--mt-fg);
	}

	.mt-presets-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
	}

	.mt-preset-chip {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 8px 12px;
		border-radius: 8px;
		background: var(--mt-btn-bg);
		border: 1px solid var(--mt-border);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.mt-preset-chip:hover {
		background: var(--mt-btn-hover);
		border-color: var(--mt-fg-subtle);
	}

	.mt-preset-chip.chip-selected {
		background: var(--mt-bolt-subtle);
		border-color: var(--mt-bolt);
		box-shadow: 0 0 0 1px var(--mt-bolt);
	}

	.mt-chip-sats {
		font-size: 14px;
		font-weight: 700;
		color: var(--mt-fg);
	}

	.mt-chip-fiat {
		font-size: 11px;
		color: var(--mt-fg-muted);
	}

	.mt-input-with-addons {
		display: flex;
		align-items: center;
		background: var(--mt-input-bg);
		border: 1px solid var(--mt-input-border);
		border-radius: 6px;
		overflow: hidden;
	}

	.mt-input-with-addons:focus-within {
		border-color: var(--mt-bolt);
		box-shadow: 0 0 0 3px var(--mt-border-glow);
	}

	.mt-addon-left,
	.mt-addon-right {
		padding: 8px 12px;
		font-size: 13px;
		color: var(--mt-fg-muted);
		background: var(--mt-surface-subtle);
	}

	.mt-addon-left {
		border-right: 1px solid var(--mt-input-border);
		color: var(--mt-bolt);
	}

	.mt-addon-right {
		border-left: 1px solid var(--mt-input-border);
		font-family: var(--mt-font-mono);
	}

	.mt-input {
		flex: 1;
		background: transparent;
		border: none;
		color: var(--mt-fg);
		font-size: 14px;
		padding: 8px 12px;
		outline: none;
	}

	.mt-fiat-conversions {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		color: var(--mt-fg-muted);
		flex-wrap: wrap;
	}

	.mt-bullet {
		color: var(--mt-fg-subtle);
	}

	.mt-form-hint {
		font-size: 11px;
		color: var(--mt-fg-muted);
	}

	.mt-zap-actions {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: 8px;
	}

	/* Proofs & Badges Tab */
	.mt-proofs-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
		gap: 16px;
	}

	.mt-badges-list {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.mt-badge-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 14px;
		background: var(--mt-surface-subtle);
		border: 1px solid var(--mt-border);
		border-radius: 8px;
	}

	.mt-badge-icon {
		font-size: 20px;
		flex-shrink: 0;
	}

	.mt-badge-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
	}

	.mt-badge-name {
		font-size: 14px;
		font-weight: 700;
		color: var(--mt-fg);
	}

	.mt-badge-desc {
		font-size: 12px;
		color: var(--mt-fg-muted);
		line-height: 1.35;
	}

	.mt-proofs-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.mt-proof-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 12px;
		background: var(--mt-surface-subtle);
		border: 1px solid var(--mt-border);
		border-radius: 8px;
		gap: 12px;
	}

	.mt-proof-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--mt-fg);
		flex: 1;
	}

	.mt-proof-val {
		font-family: var(--mt-font-mono);
		font-size: 11px;
		color: var(--mt-fg-muted);
		max-width: 240px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* QR Dialog */
	.mt-qr-dialog {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		padding: 16px 0;
	}

	.mt-qr-frame {
		background: #ffffff;
		padding: 16px;
		border-radius: 12px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
		color: #000000;
	}

	.mt-qr-svg {
		width: 180px;
		height: 180px;
	}

	.mt-qr-meta {
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.mt-qr-address {
		font-family: var(--mt-font-mono);
		font-size: 14px;
		font-weight: 700;
		color: var(--mt-bolt);
	}

	.mt-qr-note {
		font-size: 12px;
		color: var(--mt-fg-muted);
		max-width: 320px;
		margin: 0;
	}

	/* Modal tip body */
	.mt-modal-tip-body {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.mt-modal-user-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 14px;
		background: var(--mt-surface-subtle);
		border-radius: 8px;
		border: 1px solid var(--mt-border);
	}

	.mt-modal-avatar {
		width: 36px;
		height: 36px;
		border-radius: 9999px;
		border: 2px solid var(--mt-bolt);
	}

	.mt-modal-username {
		font-size: 14px;
		font-weight: 700;
		color: var(--mt-fg);
		display: block;
	}

	.mt-modal-address {
		font-family: var(--mt-font-mono);
		font-size: 12px;
		color: var(--mt-fg-muted);
		display: block;
	}

	.mt-success-banner {
		padding: 10px 14px;
		background: rgba(46, 160, 67, 0.15);
		border: 1px solid var(--mt-success);
		border-radius: 8px;
		color: var(--mt-success);
		font-size: 13px;
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.mt-header-main {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}

		.mt-header-title-row {
			flex-direction: column;
			align-items: center;
		}

		.mt-user-handle-line {
			justify-content: center;
		}

		.mt-meta-chips {
			justify-content: center;
		}

		.mt-header-actions {
			justify-content: center;
		}

		.mt-presets-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
