<script lang="ts">
	import { Button, Badge, Card, formatSats, formatFiatUSD } from '@mergetip/ui';

	// Interactive playground state
	let commandInput = $state('/tip @reviewer 2100 for the thorough review');
	let parsedData = $derived(parseTipCommand(commandInput));

	function parseTipCommand(text: string) {
		const trimmed = text.trim();
		const match = trimmed.match(
			/^\/tip\s+@([a-zA-Z0-9_\-]+)\s+(\d+(?:\.\d+)?)(k|sats)?(?:\s+(on-merge))?(?:\s+(?:for\s+)?(.+))?$/i
		);

		if (!match) {
			// Fallback tolerant parser for demo
			const receiverMatch = trimmed.match(/@([a-zA-Z0-9_\-]+)/);
			const numMatch = trimmed.match(/(\d+(?:\.\d+)?)(k)?/i);
			const onMerge = /on-merge/i.test(trimmed);
			const forMatch = trimmed.match(/(?:for\s+)(.+)$/i);

			let sats = 2100;
			if (numMatch && numMatch[1]) {
				const num = parseFloat(numMatch[1]);
				sats = numMatch[2] ? Math.round(num * 1000) : Math.round(num);
			}

			return {
				valid: Boolean(receiverMatch),
				receiver: (receiverMatch && receiverMatch[1]) ? receiverMatch[1] : 'contributor',
				amount_sats: sats,
				on_merge: onMerge,
				note: (forMatch && forMatch[1]) ? forMatch[1] : 'thank you for your contribution'
			};
		}

		let num = parseFloat(match[2] ?? '0');
		if (match[3]?.toLowerCase() === 'k') {
			num *= 1000;
		}

		return {
			valid: true,
			receiver: match[1] ?? 'contributor',
			amount_sats: Math.round(num),
			on_merge: Boolean(match[4]),
			note: match[5] ?? 'great work on this PR'
		};
	}

	const presets = [
		{ label: 'Code Review (2.1k sats)', cmd: '/tip @reviewer 2100 for the thorough review' },
		{ label: 'Feature PR (5k on-merge)', cmd: '/tip @newdev 5k on-merge for rust refactor' },
		{ label: 'Bug Triage (10k sats)', cmd: '/tip @debugger 10k for root cause repro' },
		{ label: 'Docs Update (500 sats)', cmd: '/tip @writer 500 for updating tutorials' }
	];
</script>

<div class="mt-landing">
	<!-- Hero Section -->
	<section class="mt-hero">
		<div class="mt-hero-container">
			<div class="mt-eyebrow">
				<span>Open-Source Bitcoin Rewards Protocol</span>
				<span class="mt-eyebrow-pill">Non-Custodial</span>
			</div>

			<h1 class="mt-hero-title">
				Tip open-source contributors in <span class="mt-highlight">sats</span>, straight from GitHub.
			</h1>

			<p class="mt-hero-desc">
				Reward code reviews, merged pull requests, bug triage and documentation instantly. Senders pay from their own wallet over <strong>Nostr Wallet Connect (NWC)</strong>; receivers get paid to their <strong>Lightning address</strong>.
			</p>

			<div class="mt-hero-actions">
				<Button variant="primary" size="lg" onclick={() => (window.location.href = '/settings')}>
					Install GitHub App
				</Button>
				<Button variant="default" size="lg" onclick={() => (window.location.href = '/dashboard')}>
					Explore Dashboard
				</Button>
				<Button variant="outline" size="lg" onclick={() => (window.location.href = '/claim/demo-tip-1')}>
					Claim Demo Tip
				</Button>
			</div>

			<div class="mt-hero-trust">
				<div class="mt-trust-item">
					<span>Non-Custodial (NIP-47)</span>
				</div>
				<div class="mt-trust-item">
					<span>Sub-cent Lightning Fees</span>
				</div>
				<div class="mt-trust-item">
					<span>Global + Local Fiat Rails</span>
				</div>
				<div class="mt-trust-item">
					<span>Pure GitHub App Workflow</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Interactive Playground Section -->
	<section class="mt-playground-section">
		<div class="mt-section-header">
			<Badge variant="bolt">Interactive Demo</Badge>
			<h2>Try the <code>/tip</code> command in action</h2>
			<p>Type any `/tip` syntax below or pick a preset to see the live parser, breakdown and bot reply.</p>
		</div>

		<div class="mt-playground-container">
			<!-- Preset Buttons -->
			<div class="mt-presets-bar">
				<span class="mt-presets-label">Examples:</span>
				{#each presets as p (p.cmd)}
					<button
						class="mt-preset-btn {commandInput === p.cmd ? 'mt-preset-active' : ''}"
						onclick={() => (commandInput = p.cmd)}
					>
						{p.label}
					</button>
				{/each}
			</div>

			<div class="mt-playground-grid">
				<!-- Input Column -->
				<div class="mt-editor-card">
					<div class="mt-editor-header">
						<span class="mt-editor-dot mt-dot-red"></span>
						<span class="mt-editor-dot mt-dot-yellow"></span>
						<span class="mt-editor-dot mt-dot-green"></span>
						<span class="mt-editor-title">GitHub PR Comment Box</span>
					</div>

					<div class="mt-editor-body">
						<textarea
							class="mt-command-textarea"
							bind:value={commandInput}
							rows="3"
							placeholder="/tip @username 2100 [on-merge] [for note]"
							spellcheck="false"
						></textarea>

						<div class="mt-parser-breakdown">
							<div class="mt-breakdown-row">
								<span class="mt-breakdown-key">Recipient:</span>
								<span class="mt-breakdown-val font-mono">@{parsedData.receiver}</span>
							</div>
							<div class="mt-breakdown-row">
								<span class="mt-breakdown-key">Amount:</span>
								<span class="mt-breakdown-val mt-amount-val">
									<strong>{parsedData.amount_sats.toLocaleString('en-US')} sats</strong>
									<span class="mt-subtext">≈ {formatFiatUSD(parsedData.amount_sats)}</span>
								</span>
							</div>
							<div class="mt-breakdown-row">
								<span class="mt-breakdown-key">Settlement:</span>
								<span class="mt-breakdown-val">
									{#if parsedData.on_merge}
										<Badge variant="held" size="sm">Held until PR merges</Badge>
									{:else}
										<Badge variant="paid" size="sm">Instant payment</Badge>
									{/if}
								</span>
							</div>
							{#if parsedData.note}
								<div class="mt-breakdown-row">
									<span class="mt-breakdown-key">Note:</span>
									<span class="mt-breakdown-val italic">"{parsedData.note}"</span>
								</div>
							{/if}
						</div>
					</div>
				</div>

				<!-- Bot Output Preview Column -->
				<div class="mt-bot-preview">
					<div class="mt-bot-header">
						<div class="mt-bot-avatar">MT</div>
						<div class="mt-bot-meta">
							<span class="mt-bot-name">mergetip-bot</span>
							<span class="mt-bot-badge">bot</span>
							<span class="mt-bot-time">just now</span>
						</div>
					</div>

					<div class="mt-bot-content">
						<p class="mt-bot-lead">
							<strong>@{parsedData.receiver}</strong> was tipped <strong>{parsedData.amount_sats.toLocaleString('en-US')} sats</strong> ({formatFiatUSD(parsedData.amount_sats)})
						</p>

						{#if parsedData.on_merge}
							<div class="mt-bot-alert mt-alert-held">
								<span>Pledged on-merge: Sats will automatically transfer when this pull request is merged.</span>
							</div>
						{:else}
							<div class="mt-bot-alert mt-alert-paid">
								<span>Settled over Lightning via Nostr Wallet Connect. Preimage: <code>0x4f8a...92b1</code></span>
							</div>
						{/if}

						<div class="mt-bot-footer">
							<a href="/claim/demo-tip-1" class="mt-bot-link">Claim with custom Lightning address</a>
							<span class="mt-bot-divider">•</span>
							<a href="/dashboard" class="mt-bot-link">View in MergeTip</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Architecture & Pillars Grid -->
	<section class="mt-pillars-section">
		<div class="mt-section-header">
			<Badge variant="accent">Key Architecture</Badge>
			<h2>Built for trust, speed and global sovereignty</h2>
			<p>Every layer of MergeTip is designed around open protocols with zero custodial liability.</p>
		</div>

		<div class="mt-pillars-grid">
			<div class="mt-pillar-card">
				<h3>Nostr Wallet Connect</h3>
				<p>
					Payments are initiated directly from your existing wallet (Alby, Mutiny, Umbrel, raspiblitz) via NIP-47 with envelope encryption (NIP-44) and budget caps.
				</p>
				<div class="mt-pillar-tags">
					<span>NIP-47</span>
					<span>NIP-44</span>
					<span>Non-Custodial</span>
				</div>
			</div>

			<div class="mt-pillar-card">
				<h3>Lightning Address Protocol</h3>
				<p>
					Receivers get paid directly to their Lightning address (e.g. <code>alice@getalby.com</code>) via LNURL-pay with sub-second finality and zero manual invoicing.
				</p>
				<div class="mt-pillar-tags">
					<span>LNURL-pay</span>
					<span>Zero-Setup</span>
					<span>Sub-Second</span>
				</div>
			</div>

			<div class="mt-pillar-card">
				<h3>Pledges & Breez Spark SDK</h3>
				<p>
					If a contributor hasn't set up a Lightning address yet, tips are held as cryptographic pledges. They can claim anytime via an instant in-browser WebAssembly wallet.
				</p>
				<div class="mt-pillar-tags">
					<span>Breez Spark SDK</span>
					<span>WASM Wallet</span>
					<span>Auto-Expiry</span>
				</div>
			</div>

			<div class="mt-pillar-card">
				<h3>Local African Fiat Rails</h3>
				<p>
					Through the Bitnob Payouts API integration, contributors in Nigeria, Ghana and Kenya can automatically convert sats into local bank or mobile money deposits.
				</p>
				<div class="mt-pillar-tags">
					<span>NGN (₦)</span>
					<span>GHS (GH₵)</span>
					<span>KES (KSh)</span>
				</div>
			</div>
		</div>
	</section>

	<!-- How it Works Walkthrough -->
	<section class="mt-steps-section">
		<div class="mt-section-header">
			<Badge variant="neutral">Workflow</Badge>
			<h2>How MergeTip works in 3 steps</h2>
		</div>

		<div class="mt-steps-grid">
			<div class="mt-step-item">
				<div class="mt-step-num">1</div>
				<h4>Install & Connect</h4>
				<p>Install the MergeTip GitHub App onto your organization and link your NWC wallet URI with your preferred budget caps.</p>
			</div>

			<div class="mt-step-arrow">→</div>

			<div class="mt-step-item">
				<div class="mt-step-num">2</div>
				<h4>Comment <code>/tip</code></h4>
				<p>Leave a <code>/tip @contributor 2100 on-merge</code> comment on any review or pull request. Pure grammar parser checks work verification.</p>
			</div>

			<div class="mt-step-arrow">→</div>

			<div class="mt-step-item">
				<div class="mt-step-num">3</div>
				<h4>Instant Settlement</h4>
				<p>The worker executes the payment over NWC and posts a verified receipt with preimage proof straight into the GitHub thread.</p>
			</div>
		</div>
	</section>

	<!-- Live Community Metrics -->
	<section class="mt-metrics-section">
		<div class="mt-metrics-grid">
			<div class="mt-metric-box">
				<div class="mt-metric-val">428,000+</div>
				<div class="mt-metric-lbl">Sats Rewarded</div>
			</div>
			<div class="mt-metric-box">
				<div class="mt-metric-val">1,240+</div>
				<div class="mt-metric-lbl">PRs Verified</div>
			</div>
			<div class="mt-metric-box">
				<div class="mt-metric-val">&lt; 1 sat</div>
				<div class="mt-metric-lbl">Average Fee</div>
			</div>
			<div class="mt-metric-box">
				<div class="mt-metric-val">100%</div>
				<div class="mt-metric-lbl">Non-Custodial</div>
			</div>
		</div>
	</section>

	<!-- Call to Action Banner -->
	<section class="mt-cta-section">
		<div class="mt-cta-card">
			<div class="mt-cta-content">
				<h2>Start tipping open-source contributors today</h2>
				<p>Boost code review velocity, attract top maintainers, and fuel open-source development with satoshi micro-rewards.</p>
				<div class="mt-cta-buttons">
					<Button variant="bolt" size="lg" onclick={() => (window.location.href = '/settings')}>
						Connect Wallet (NWC)
					</Button>
					<Button variant="outline" size="lg" onclick={() => (window.location.href = '/dashboard')}>
						Go to Dashboard
					</Button>
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	.mt-landing {
		display: flex;
		flex-direction: column;
		gap: 64px;
		padding-bottom: 32px;
	}

	/* Hero */
	.mt-hero {
		padding: 72px 16px 48px 16px;
		text-align: center;
		background: radial-gradient(circle at 50% 10%, var(--mt-bolt-glow) 0%, transparent 60%);
	}

	.mt-hero-container {
		max-width: 860px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
	}

	.mt-eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		border-radius: 9999px;
		padding: 4px 14px 4px 10px;
		font-size: 13px;
		font-weight: 500;
		color: var(--mt-fg);
		box-shadow: var(--mt-shadow-sm);
	}

	.mt-eyebrow-bolt {
		color: var(--mt-bolt);
		font-size: 15px;
	}

	.mt-eyebrow-pill {
		font-size: 11px;
		font-weight: 600;
		background: var(--mt-accent-subtle);
		color: var(--mt-accent);
		padding: 1px 6px;
		border-radius: 4px;
	}

	.mt-hero-title {
		font-size: 48px;
		font-weight: 800;
		line-height: 1.15;
		letter-spacing: -0.03em;
		color: var(--mt-fg);
		margin: 0;
	}

	.mt-highlight {
		color: var(--mt-bolt);
		text-shadow: 0 0 20px var(--mt-bolt-glow);
	}

	.mt-hero-desc {
		font-size: 18px;
		color: var(--mt-fg-muted);
		line-height: 1.6;
		max-width: 680px;
		margin: 0;
	}

	.mt-hero-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 12px;
		margin-top: 8px;
	}

	.mt-hero-trust {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 24px;
		margin-top: 24px;
		padding-top: 24px;
		border-top: 1px solid var(--mt-border-muted);
		font-size: 13px;
		color: var(--mt-fg-muted);
	}

	.mt-trust-item {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	/* Playground */
	.mt-playground-section,
	.mt-pillars-section,
	.mt-steps-section {
		max-width: 1140px;
		margin: 0 auto;
		padding: 0 16px;
		width: 100%;
	}

	.mt-section-header {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		margin-bottom: 32px;
	}

	.mt-section-header h2 {
		font-size: 28px;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--mt-fg);
		margin: 0;
	}

	.mt-section-header p {
		color: var(--mt-fg-muted);
		font-size: 15px;
		max-width: 580px;
		margin: 0;
	}

	.mt-playground-container {
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		border-radius: 12px;
		padding: 24px;
		box-shadow: var(--mt-shadow-md);
	}

	.mt-presets-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		margin-bottom: 20px;
		padding-bottom: 16px;
		border-bottom: 1px solid var(--mt-border-muted);
	}

	.mt-presets-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--mt-fg-muted);
	}

	.mt-preset-btn {
		background: var(--mt-bg-subtle);
		border: 1px solid var(--mt-border);
		border-radius: 6px;
		padding: 4px 10px;
		font-size: 12px;
		color: var(--mt-fg);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.mt-preset-btn:hover {
		background: var(--mt-surface-hover);
		border-color: var(--mt-fg-subtle);
	}

	.mt-preset-active {
		background: var(--mt-bolt-subtle);
		border-color: var(--mt-bolt);
		color: var(--mt-fg);
		font-weight: 600;
	}

	.mt-playground-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
	}

	.mt-editor-card {
		background: var(--mt-bg-inset);
		border: 1px solid var(--mt-border);
		border-radius: 8px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.mt-editor-header {
		background: var(--mt-bg-subtle);
		border-bottom: 1px solid var(--mt-border-muted);
		padding: 10px 14px;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.mt-editor-dot {
		width: 10px;
		height: 10px;
		border-radius: 9999px;
	}
	.mt-dot-red {
		background: #ff5f56;
	}
	.mt-dot-yellow {
		background: #ffbd2e;
	}
	.mt-dot-green {
		background: #27c93f;
	}

	.mt-editor-title {
		font-size: 12px;
		font-weight: 500;
		color: var(--mt-fg-muted);
		margin-left: 6px;
	}

	.mt-editor-body {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.mt-command-textarea {
		width: 100%;
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		border-radius: 6px;
		padding: 12px;
		font-family: var(--mt-font-mono);
		font-size: 14px;
		color: var(--mt-fg);
		resize: none;
		outline: none;
		transition: border-color 0.15s ease;
	}

	.mt-command-textarea:focus {
		border-color: var(--mt-border-active);
		box-shadow: 0 0 0 2px rgba(9, 105, 218, 0.2);
	}

	.mt-parser-breakdown {
		display: flex;
		flex-direction: column;
		gap: 8px;
		background: var(--mt-surface);
		border: 1px solid var(--mt-border-muted);
		border-radius: 6px;
		padding: 12px 14px;
		font-size: 13px;
	}

	.mt-breakdown-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.mt-breakdown-key {
		color: var(--mt-fg-muted);
		font-weight: 500;
	}

	.mt-amount-val {
		display: flex;
		align-items: baseline;
		gap: 6px;
	}

	.mt-subtext {
		font-size: 12px;
		color: var(--mt-fg-muted);
	}

	/* Bot Preview */
	.mt-bot-preview {
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		border-radius: 8px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.mt-bot-header {
		padding: 12px 16px;
		background: var(--mt-bg-subtle);
		border-bottom: 1px solid var(--mt-border-muted);
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.mt-bot-avatar {
		width: 24px;
		height: 24px;
		border-radius: 9999px;
		background: var(--mt-bolt);
		color: #000;
		font-weight: 700;
		font-size: 13px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.mt-bot-meta {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.mt-bot-name {
		font-size: 13px;
		font-weight: 600;
		color: var(--mt-fg);
	}

	.mt-bot-badge {
		font-size: 11px;
		padding: 1px 5px;
		border-radius: 4px;
		background: var(--mt-surface-hover);
		color: var(--mt-fg-muted);
		border: 1px solid var(--mt-border-muted);
	}

	.mt-bot-time {
		font-size: 12px;
		color: var(--mt-fg-muted);
	}

	.mt-bot-content {
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		font-size: 14px;
	}

	.mt-bot-lead {
		margin: 0;
		line-height: 1.5;
	}

	.mt-bot-alert {
		padding: 10px 14px;
		border-radius: 6px;
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 13px;
	}

	.mt-alert-paid {
		background: var(--mt-success-bg);
		color: var(--mt-success);
		border: 1px solid var(--mt-success-border);
	}

	.mt-alert-held {
		background: var(--mt-purple-bg);
		color: var(--mt-purple);
		border: 1px solid var(--mt-purple-border);
	}

	.mt-bot-footer {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		padding-top: 8px;
		border-top: 1px solid var(--mt-border-muted);
	}

	.mt-bot-link {
		color: var(--mt-border-active);
		text-decoration: none;
	}
	.mt-bot-link:hover {
		text-decoration: underline;
	}

	.mt-bot-divider {
		color: var(--mt-fg-subtle);
	}

	/* Pillars Grid */
	.mt-pillars-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20px;
	}

	.mt-pillar-card {
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		border-radius: 10px;
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		box-shadow: var(--mt-shadow-sm);
		transition: all 0.2s ease;
	}

	.mt-pillar-card:hover {
		transform: translateY(-2px);
		border-color: var(--mt-fg-subtle);
		box-shadow: var(--mt-shadow-md);
	}

	.mt-pillar-icon {
		width: 42px;
		height: 42px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		background: var(--mt-bg-subtle);
		border: 1px solid var(--mt-border-muted);
	}

	.mt-pillar-card h3 {
		font-size: 16px;
		font-weight: 600;
		color: var(--mt-fg);
		margin: 0;
	}

	.mt-pillar-card p {
		font-size: 13px;
		color: var(--mt-fg-muted);
		line-height: 1.55;
		margin: 0;
		flex: 1;
	}

	.mt-pillar-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 8px;
	}

	.mt-pillar-tags span {
		font-size: 11px;
		background: var(--mt-bg-subtle);
		color: var(--mt-fg-muted);
		padding: 2px 6px;
		border-radius: 4px;
		border: 1px solid var(--mt-border-muted);
	}

	/* Steps */
	.mt-steps-grid {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		border-radius: 12px;
		padding: 32px 24px;
	}

	.mt-step-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.mt-step-num {
		width: 32px;
		height: 32px;
		border-radius: 9999px;
		background: var(--mt-bolt-subtle);
		color: var(--mt-bolt);
		border: 1px solid var(--mt-bolt);
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.mt-step-item h4 {
		font-size: 15px;
		font-weight: 600;
		color: var(--mt-fg);
		margin: 0;
	}

	.mt-step-item p {
		font-size: 13px;
		color: var(--mt-fg-muted);
		line-height: 1.5;
		margin: 0;
	}

	.mt-step-arrow {
		font-size: 20px;
		color: var(--mt-border);
		padding: 0 8px;
	}

	/* Metrics */
	.mt-metrics-section {
		max-width: 1140px;
		margin: 0 auto;
		padding: 0 16px;
		width: 100%;
	}

	.mt-metrics-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
		background: var(--mt-bg-subtle);
		border: 1px solid var(--mt-border);
		border-radius: 12px;
		padding: 28px;
	}

	.mt-metric-box {
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.mt-metric-val {
		font-size: 32px;
		font-weight: 800;
		color: var(--mt-fg);
		letter-spacing: -0.02em;
	}

	.mt-metric-lbl {
		font-size: 13px;
		color: var(--mt-fg-muted);
		font-weight: 500;
	}

	/* CTA */
	.mt-cta-section {
		max-width: 1140px;
		margin: 0 auto;
		padding: 0 16px;
		width: 100%;
	}

	.mt-cta-card {
		background: linear-gradient(135deg, var(--mt-surface-raised) 0%, var(--mt-surface) 100%);
		border: 1px solid var(--mt-border);
		border-radius: 16px;
		padding: 48px 32px;
		text-align: center;
		box-shadow: var(--mt-shadow-md);
		position: relative;
		overflow: hidden;
	}

	.mt-cta-content {
		max-width: 600px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.mt-cta-content h2 {
		font-size: 30px;
		font-weight: 700;
		color: var(--mt-fg);
		margin: 0;
	}

	.mt-cta-content p {
		font-size: 16px;
		color: var(--mt-fg-muted);
		line-height: 1.5;
		margin: 0;
	}

	.mt-cta-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 12px;
	}

	@media (max-width: 900px) {
		.mt-hero-title {
			font-size: 36px;
		}
		.mt-playground-grid {
			grid-template-columns: 1fr;
		}
		.mt-pillars-grid {
			grid-template-columns: 1fr 1fr;
		}
		.mt-steps-grid {
			flex-direction: column;
		}
		.mt-step-arrow {
			transform: rotate(90deg);
		}
		.mt-metrics-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media (max-width: 600px) {
		.mt-pillars-grid {
			grid-template-columns: 1fr;
		}
		.mt-metrics-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
