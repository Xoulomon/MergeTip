<script lang="ts">
	import {
		Button,
		Badge,
		StatCard,
		Modal,
		TipTable,
		formatFiatUSD,
		formatRelativeTime,
		type TipRow
	} from '@mergetip/ui';

	// Mock data representing realistic GitHub tips
	let sampleTips = $state<TipRow[]>([
		{
			id: 'tip-8f2a1',
			sender: 'xoulomon',
			receiver: 'alicesmith',
			amount_sats: 5000,
			on_merge: true,
			state: 'held',
			repo: 'xoulomon/mergetip',
			pr_number: 42,
			pr_title: 'feat(payer): implement NIP-47 client with auto-reconnect',
			note: 'thank you for the speedy refactor',
			created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString()
		},
		{
			id: 'tip-7c9b3',
			sender: 'xoulomon',
			receiver: 'bob-builder',
			amount_sats: 2100,
			on_merge: false,
			state: 'paid',
			repo: 'xoulomon/mergetip',
			pr_number: 38,
			pr_title: 'docs: add ADR on monorepo layout and utoipa contract',
			note: 'great documentation writeup',
			created_at: new Date(Date.now() - 1000 * 60 * 95).toISOString()
		},
		{
			id: 'tip-6d1e4',
			sender: 'xoulomon',
			receiver: 'carol-crypto',
			amount_sats: 10000,
			on_merge: false,
			state: 'pledged',
			repo: 'rust-nostr/nostr',
			pr_number: 312,
			pr_title: 'fix: handle relay websocket close event cleanly',
			note: 'critical bugfix for high-latency relays',
			created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
		},
		{
			id: 'tip-5a3f2',
			sender: 'xoulomon',
			receiver: 'david-dev',
			amount_sats: 1000,
			on_merge: false,
			state: 'paid',
			repo: 'octocrab/octocrab',
			pr_number: 104,
			pr_title: 'refactor: upgrade reqwest to 0.13 with rustls',
			note: 'for the dependency maintenance',
			created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString()
		},
		{
			id: 'tip-4b8c9',
			sender: 'xoulomon',
			receiver: 'eva-engineer',
			amount_sats: 2500,
			on_merge: true,
			state: 'held',
			repo: 'xoulomon/mergetip',
			pr_number: 40,
			pr_title: 'test: add proptests for command grammar parser',
			note: 'fantastic test coverage',
			created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString()
		},
		{
			id: 'tip-3e7d1',
			sender: 'xoulomon',
			receiver: 'frank-frontend',
			amount_sats: 2100,
			on_merge: false,
			state: 'paid',
			repo: 'xoulomon/mergetip',
			pr_number: 31,
			pr_title: 'ui: Primer-style design tokens and dark mode support',
			note: 'looks very clean!',
			created_at: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString()
		},
		{
			id: 'tip-2f9a0',
			sender: 'xoulomon',
			receiver: 'grace-gh',
			amount_sats: 500,
			on_merge: false,
			state: 'paid',
			repo: 'xoulomon/mergetip',
			pr_number: 29,
			pr_title: 'ci: add cargo-deny and supply chain audit',
			note: 'security audit appreciated',
			created_at: new Date(Date.now() - 1000 * 60 * 60 * 75).toISOString()
		}
	]);

	// Filter state
	let selectedTab = $state<'all' | 'paid' | 'pledged' | 'held' | 'verifying'>('all');
	let searchQuery = $state('');

	let filteredTips = $derived(
		sampleTips.filter((tip) => {
			const matchesTab = selectedTab === 'all' || tip.state === selectedTab;
			const q = searchQuery.toLowerCase().trim();
			const matchesSearch =
				!q ||
				tip.receiver.toLowerCase().includes(q) ||
				tip.repo.toLowerCase().includes(q) ||
				tip.pr_title.toLowerCase().includes(q) ||
				tip.note?.toLowerCase().includes(q);
			return matchesTab && matchesSearch;
		})
	);

	// Details modal state
	let selectedTip = $state<TipRow | null>(null);

	// Send manual tip modal state
	let sendModalOpen = $state(false);
	let newReceiver = $state('');
	let newAmount = $state(2100);
	let newRepo = $state('xoulomon/mergetip');
	let newPrNum = $state(45);
	let newOnMerge = $state(false);
	let newNote = $state('for your open-source help');
	let sendSuccess = $state(false);

	function submitManualTip() {
		if (!newReceiver) return;
		const cleanHandle = newReceiver.replace(/^@/, '');
		const createdTip: TipRow = {
			id: `tip-${Math.random().toString(36).substring(2, 7)}`,
			sender: 'xoulomon',
			receiver: cleanHandle,
			amount_sats: Number(newAmount),
			on_merge: newOnMerge,
			state: newOnMerge ? 'held' : 'paid',
			repo: newRepo,
			pr_number: Number(newPrNum),
			pr_title: `Manual tip from dashboard`,
			note: newNote,
			created_at: new Date().toISOString()
		};

		sampleTips = [createdTip, ...sampleTips];
		sendSuccess = true;
		setTimeout(() => {
			sendSuccess = false;
			sendModalOpen = false;
			newReceiver = '';
		}, 1200);
	}
</script>

<div class="mt-dashboard-page">
	<div class="mt-dashboard-container">
		<!-- Header Toolbar -->
		<div class="mt-dashboard-header">
			<div>
				<div class="mt-header-badge">
					<Badge variant="bolt" size="sm">Sponsor Account</Badge>
				</div>
				<h1>Sponsor Dashboard</h1>
				<p>
					Real-time monitoring of your Nostr Wallet Connect tips, active pledges and monthly caps.
				</p>
			</div>

			<div class="mt-header-actions">
				<Button variant="default" size="md" onclick={() => (window.location.href = '/settings')}>
					Settings
				</Button>
				<Button variant="bolt" size="md" onclick={() => (sendModalOpen = true)}>
					Send Manual Tip
				</Button>
			</div>
		</div>

		<!-- Monthly Budget Card -->
		<div class="mt-budget-card">
			<div class="mt-budget-top">
				<div class="mt-budget-info">
					<span class="mt-budget-title">Monthly Spending Budget</span>
					<span class="mt-budget-dates">Current Cycle: Oct 1 – Oct 31, 2026</span>
				</div>
				<div class="mt-budget-nums">
					<span class="mt-budget-used">84,200</span>
					<span class="mt-budget-divider">/</span>
					<span class="mt-budget-limit">100,000 sats</span>
					<span class="mt-budget-fiat">(≈ {formatFiatUSD(84200)} / {formatFiatUSD(100000)})</span>
				</div>
			</div>

			<div class="mt-progress-track">
				<div class="mt-progress-bar" style="width: 84.2%"></div>
			</div>

			<div class="mt-budget-meta">
				<span>15,800 sats remaining</span>
				<span>High-value confirmation threshold: <strong>10,000 sats</strong></span>
			</div>
		</div>

		<!-- Stat Cards Grid -->
		<div class="mt-stats-grid">
			<StatCard
				label="Total Sent"
				sats={142500}
				trend="18% this month"
				trendUp={true}
				subtitle="52 contributions rewarded"
				accent="bolt"
			/>
			<StatCard
				label="Total Received"
				sats={28400}
				trend="4 reviews"
				trendUp={true}
				subtitle="as contributor"
				accent="success"
			/>
			<StatCard
				label="Active Pledges"
				sats={12500}
				trend="3 pending"
				trendUp={true}
				subtitle="awaiting contributor claim"
				accent="warning"
			/>
			<StatCard
				label="Connected NWC Balance"
				sats={385000}
				subtitle="Alby Hub via Nostr relay"
				accent="default"
			/>
		</div>

		<!-- Tip Activity Section -->
		<div class="mt-activity-card">
			<div class="mt-activity-header">
				<div class="mt-tabs">
					<button
						class="mt-tab {selectedTab === 'all' ? 'mt-tab-active' : ''}"
						onclick={() => (selectedTab = 'all')}
					>
						All Activity <span class="mt-tab-count">{sampleTips.length}</span>
					</button>
					<button
						class="mt-tab {selectedTab === 'paid' ? 'mt-tab-active' : ''}"
						onclick={() => (selectedTab = 'paid')}
					>
						Paid <span class="mt-tab-count"
							>{sampleTips.filter((t) => t.state === 'paid').length}</span
						>
					</button>
					<button
						class="mt-tab {selectedTab === 'held' ? 'mt-tab-active' : ''}"
						onclick={() => (selectedTab = 'held')}
					>
						Held on-merge <span class="mt-tab-count"
							>{sampleTips.filter((t) => t.state === 'held').length}</span
						>
					</button>
					<button
						class="mt-tab {selectedTab === 'pledged' ? 'mt-tab-active' : ''}"
						onclick={() => (selectedTab = 'pledged')}
					>
						Pledged <span class="mt-tab-count"
							>{sampleTips.filter((t) => t.state === 'pledged').length}</span
						>
					</button>
				</div>

				<div class="mt-search-box">
					<input
						type="text"
						placeholder="Filter by @contributor or repo..."
						bind:value={searchQuery}
						class="mt-search-input"
					/>
				</div>
			</div>

			<TipTable tips={filteredTips} onselect={(tip) => (selectedTip = tip)} />
		</div>
	</div>

	<!-- Tip Details Modal -->
	<Modal
		open={Boolean(selectedTip)}
		title="Tip Transaction Details"
		subtitle={selectedTip
			? `${selectedTip.id} • ${formatRelativeTime(selectedTip.created_at)}`
			: ''}
		onclose={() => (selectedTip = null)}
	>
		{#if selectedTip}
			<div class="mt-tip-details">
				<div class="mt-details-header-card">
					<div class="mt-details-amount">
						<span class="mt-sats-huge">{selectedTip.amount_sats.toLocaleString('en-US')}</span>
						<span class="mt-sats-lbl">sats</span>
						<span class="mt-fiat-pill">≈ {formatFiatUSD(selectedTip.amount_sats)}</span>
					</div>
					<Badge variant={selectedTip.state} size="md" />
				</div>

				<div class="mt-details-grid">
					<div class="mt-detail-item">
						<span class="mt-detail-label">Contributor</span>
						<div class="mt-user-link">
							<img
								src="https://avatars.githubusercontent.com/{selectedTip.receiver}"
								alt="@{selectedTip.receiver}"
								class="mt-detail-avatar"
							/>
							<strong>@{selectedTip.receiver}</strong>
						</div>
					</div>

					<div class="mt-detail-item">
						<span class="mt-detail-label">Sponsor</span>
						<span>@{selectedTip.sender}</span>
					</div>

					<div class="mt-detail-item">
						<span class="mt-detail-label">Repository & PR</span>
						<a
							href="https://github.com/{selectedTip.repo}/pull/{selectedTip.pr_number}"
							target="_blank"
							rel="noreferrer"
							class="mt-code-link"
						>
							{selectedTip.repo}#{selectedTip.pr_number}
						</a>
					</div>

					<div class="mt-detail-item">
						<span class="mt-detail-label">Trigger Condition</span>
						<span>{selectedTip.on_merge ? 'Held until PR merges' : 'Instant execution'}</span>
					</div>

					<div class="mt-detail-item full-width">
						<span class="mt-detail-label">PR Title</span>
						<span class="mt-detail-title">{selectedTip.pr_title}</span>
					</div>

					{#if selectedTip.note}
						<div class="mt-detail-item full-width">
							<span class="mt-detail-label">Tip Note</span>
							<blockquote class="mt-note-quote">"{selectedTip.note}"</blockquote>
						</div>
					{/if}

					<div class="mt-detail-item full-width">
						<span class="mt-detail-label">NWC Cryptographic Preimage</span>
						<code class="mt-hash-code"
							>0x4f8a129d8b37e2b109c8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6</code
						>
					</div>
				</div>
			</div>
		{/if}

		{#snippet footer()}
			<Button variant="default" size="sm" onclick={() => (selectedTip = null)}>Close</Button>
			{#if selectedTip?.state === 'pledged'}
				<Button
					variant="primary"
					size="sm"
					onclick={() => (window.location.href = `/claim/${selectedTip?.id}`)}
				>
					View Claim Page
				</Button>
			{/if}
		{/snippet}
	</Modal>

	<!-- Manual Tip Modal -->
	<Modal
		open={sendModalOpen}
		title="Send Satoshi Tip"
		subtitle="Dispatch a non-custodial tip from your connected NWC wallet."
		onclose={() => (sendModalOpen = false)}
	>
		{#if sendSuccess}
			<div class="mt-success-alert">
				<h3>Payment Dispatched</h3>
				<p>Sent {newAmount.toLocaleString('en-US')} sats to @{newReceiver}. Recorded on relay.</p>
			</div>
		{:else}
			<form
				class="mt-send-form"
				onsubmit={(e) => {
					e.preventDefault();
					submitManualTip();
				}}
			>
				<div class="mt-form-group">
					<label for="recipient">GitHub Contributor Username</label>
					<div class="mt-input-prefix-wrapper">
						<span class="mt-prefix">@</span>
						<input
							id="recipient"
							type="text"
							placeholder="alice"
							bind:value={newReceiver}
							required
							class="mt-text-input with-prefix"
						/>
					</div>
				</div>

				<div class="mt-form-group">
					<label for="amount">Amount in Sats</label>
					<input
						id="amount"
						type="number"
						min="1"
						step="1"
						bind:value={newAmount}
						required
						class="mt-text-input"
					/>
					<div class="mt-amount-presets">
						{#each [500, 1000, 2100, 5000, 10000] as amt (amt)}
							<button
								type="button"
								class="mt-preset-chip {newAmount === amt ? 'chip-active' : ''}"
								onclick={() => (newAmount = amt)}
							>
								{amt.toLocaleString('en-US')}
							</button>
						{/each}
					</div>
				</div>

				<div class="mt-form-row">
					<div class="mt-form-group flex-1">
						<label for="repo">GitHub Repository</label>
						<input id="repo" type="text" bind:value={newRepo} required class="mt-text-input" />
					</div>
					<div class="mt-form-group w-32">
						<label for="pr">PR #</label>
						<input id="pr" type="number" bind:value={newPrNum} required class="mt-text-input" />
					</div>
				</div>

				<div class="mt-form-group">
					<label for="note">Note (optional)</label>
					<input
						id="note"
						type="text"
						placeholder="for great code review"
						bind:value={newNote}
						class="mt-text-input"
					/>
				</div>

				<div class="mt-form-check">
					<input type="checkbox" id="onMergeCheck" bind:checked={newOnMerge} />
					<label for="onMergeCheck">
						<strong>Hold until PR merges</strong> (Pledge triggers automatically on GitHub webhook)
					</label>
				</div>
			</form>
		{/if}

		{#snippet footer()}
			{#if !sendSuccess}
				<Button variant="default" size="sm" onclick={() => (sendModalOpen = false)}>Cancel</Button>
				<Button variant="bolt" size="sm" onclick={submitManualTip}>
					Authorize & Pay {newAmount.toLocaleString('en-US')} sats
				</Button>
			{/if}
		{/snippet}
	</Modal>
</div>

<style>
	.mt-dashboard-page {
		padding: 32px 16px;
	}

	.mt-dashboard-container {
		max-width: 1240px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.mt-dashboard-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
	}

	.mt-header-badge {
		margin-bottom: 6px;
	}

	.mt-dashboard-header h1 {
		font-size: 28px;
		font-weight: 700;
		color: var(--mt-fg);
		margin: 0;
	}

	.mt-dashboard-header p {
		font-size: 14px;
		color: var(--mt-fg-muted);
		margin: 4px 0 0 0;
	}

	.mt-header-actions {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	/* Budget Card */
	.mt-budget-card {
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		border-radius: 10px;
		padding: 20px 24px;
		box-shadow: var(--mt-shadow-sm);
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.mt-budget-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 12px;
	}

	.mt-budget-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.mt-budget-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--mt-fg);
	}

	.mt-budget-dates {
		font-size: 12px;
		color: var(--mt-fg-muted);
	}

	.mt-budget-nums {
		display: flex;
		align-items: baseline;
		gap: 6px;
	}

	.mt-budget-used {
		font-size: 22px;
		font-weight: 700;
		color: var(--mt-fg);
	}

	.mt-budget-divider {
		color: var(--mt-fg-muted);
	}

	.mt-budget-limit {
		font-size: 15px;
		font-weight: 600;
		color: var(--mt-fg-muted);
	}

	.mt-budget-fiat {
		font-size: 13px;
		color: var(--mt-fg-subtle);
		margin-left: 4px;
	}

	.mt-progress-track {
		height: 8px;
		background: var(--mt-bg-inset);
		border-radius: 9999px;
		overflow: hidden;
	}

	.mt-progress-bar {
		height: 100%;
		background: linear-gradient(90deg, var(--mt-bolt) 0%, var(--mt-accent) 100%);
		border-radius: 9999px;
		transition: width 0.3s ease;
	}

	.mt-budget-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 12px;
		color: var(--mt-fg-muted);
	}

	/* Stats Grid */
	.mt-stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
	}

	/* Activity Card */
	.mt-activity-card {
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		border-radius: 10px;
		overflow: hidden;
		box-shadow: var(--mt-shadow-sm);
	}

	.mt-activity-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		border-bottom: 1px solid var(--mt-border);
		background: var(--mt-bg-subtle);
		flex-wrap: wrap;
		gap: 12px;
	}

	.mt-tabs {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.mt-tab {
		background: transparent;
		border: none;
		padding: 6px 12px;
		border-radius: 6px;
		font-size: 13px;
		font-weight: 500;
		color: var(--mt-fg-muted);
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 6px;
		transition: all 0.15s ease;
	}

	.mt-tab:hover {
		color: var(--mt-fg);
		background: var(--mt-surface-hover);
	}

	.mt-tab-active {
		color: var(--mt-fg);
		font-weight: 600;
		background: var(--mt-surface);
		box-shadow: var(--mt-shadow-sm);
	}

	.mt-tab-count {
		font-size: 11px;
		padding: 1px 6px;
		border-radius: 9999px;
		background: var(--mt-bg-inset);
		color: var(--mt-fg-muted);
	}

	.mt-search-box {
		min-width: 260px;
	}

	.mt-search-input {
		width: 100%;
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		border-radius: 6px;
		padding: 6px 12px;
		font-size: 13px;
		color: var(--mt-fg);
		outline: none;
	}

	.mt-search-input:focus {
		border-color: var(--mt-border-active);
		box-shadow: 0 0 0 2px rgba(9, 105, 218, 0.2);
	}

	/* Tip Details Modal Content */
	.mt-tip-details {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.mt-details-header-card {
		background: var(--mt-bg-subtle);
		border: 1px solid var(--mt-border-muted);
		border-radius: 8px;
		padding: 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.mt-details-amount {
		display: flex;
		align-items: baseline;
		gap: 6px;
	}

	.mt-sats-huge {
		font-size: 28px;
		font-weight: 800;
		color: var(--mt-fg);
	}

	.mt-sats-lbl {
		font-size: 14px;
		font-weight: 600;
		color: var(--mt-bolt);
	}

	.mt-fiat-pill {
		font-size: 12px;
		color: var(--mt-fg-muted);
		margin-left: 6px;
	}

	.mt-details-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
		font-size: 13px;
	}

	.mt-detail-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.mt-detail-item.full-width {
		grid-column: span 2;
	}

	.mt-detail-label {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--mt-fg-muted);
		letter-spacing: 0.03em;
	}

	.mt-user-link {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.mt-detail-avatar {
		width: 20px;
		height: 20px;
		border-radius: 9999px;
	}

	.mt-code-link {
		color: var(--mt-border-active);
		text-decoration: none;
		font-family: var(--mt-font-mono);
	}
	.mt-code-link:hover {
		text-decoration: underline;
	}

	.mt-detail-title {
		color: var(--mt-fg);
	}

	.mt-note-quote {
		margin: 0;
		font-style: italic;
		color: var(--mt-fg-muted);
		border-left: 2px solid var(--mt-bolt);
		padding-left: 10px;
	}

	.mt-hash-code {
		font-family: var(--mt-font-mono);
		font-size: 11px;
		background: var(--mt-bg-inset);
		padding: 6px 8px;
		border-radius: 4px;
		word-break: break-all;
	}

	/* Send Modal Form */
	.mt-send-form {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.mt-form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.mt-form-group label {
		font-size: 13px;
		font-weight: 500;
		color: var(--mt-fg);
	}

	.mt-text-input {
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		border-radius: 6px;
		padding: 8px 12px;
		font-size: 14px;
		color: var(--mt-fg);
		outline: none;
	}

	.mt-text-input:focus {
		border-color: var(--mt-border-active);
		box-shadow: 0 0 0 2px rgba(9, 105, 218, 0.2);
	}

	.mt-input-prefix-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.mt-prefix {
		position: absolute;
		left: 10px;
		color: var(--mt-fg-muted);
		font-weight: 500;
	}

	.mt-text-input.with-prefix {
		padding-left: 24px;
		width: 100%;
	}

	.mt-amount-presets {
		display: flex;
		gap: 6px;
		margin-top: 4px;
	}

	.mt-preset-chip {
		background: var(--mt-bg-subtle);
		border: 1px solid var(--mt-border);
		border-radius: 4px;
		padding: 3px 8px;
		font-size: 12px;
		color: var(--mt-fg);
		cursor: pointer;
	}

	.mt-preset-chip:hover {
		background: var(--mt-surface-hover);
	}

	.chip-active {
		background: var(--mt-bolt-subtle);
		border-color: var(--mt-bolt);
		font-weight: 600;
	}

	.mt-form-row {
		display: flex;
		gap: 12px;
	}

	.flex-1 {
		flex: 1;
	}
	.w-32 {
		width: 100px;
	}

	.mt-form-check {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		color: var(--mt-fg);
		cursor: pointer;
		margin-top: 4px;
	}

	.mt-success-alert {
		text-align: center;
		padding: 24px 16px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.mt-success-icon {
		font-size: 36px;
	}

	.mt-success-alert h3 {
		font-size: 18px;
		color: var(--mt-fg);
		margin: 0;
	}

	.mt-success-alert p {
		font-size: 14px;
		color: var(--mt-fg-muted);
		margin: 0;
	}

	@media (max-width: 960px) {
		.mt-stats-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media (max-width: 600px) {
		.mt-stats-grid {
			grid-template-columns: 1fr;
		}
		.mt-details-grid {
			grid-template-columns: 1fr;
		}
		.mt-detail-item.full-width {
			grid-column: span 1;
		}
	}
</style>
