<script lang="ts">
	const currentYear = new Date().getFullYear();
</script>

<footer class="mt-footer">
	<div class="mt-footer-container">
		<div class="mt-footer-top">
			<div class="mt-footer-brand">
				<div class="mt-footer-logo">
					<span class="mt-brand-name">MergeTip</span>
				</div>
				<p class="mt-footer-tagline">
					Non-custodial, open-source tipping protocol for GitHub contributors powered by Nostr Wallet Connect (NIP-47), Lightning Address (LNURL) and Breez Spark SDK.
				</p>
				<div class="mt-protocols">
					<span class="mt-protocol-pill" title="Nostr Wallet Connect standard">NIP-47 (NWC)</span>
					<span class="mt-protocol-pill" title="Lightning Address / LNURL-pay">LNURL-pay</span>
					<span class="mt-protocol-pill" title="Breez Spark SDK Web Wallet">Breez Spark</span>
					<span class="mt-protocol-pill" title="Bitnob African Payouts (NG, GH, KE)">Bitnob Rails</span>
				</div>
			</div>

			<div class="mt-footer-links-grid">
				<div class="mt-footer-col">
					<h4>Application</h4>
					<a href="/dashboard">Dashboard</a>
					<a href="/settings">Settings & NWC</a>
					<a href="/claim/demo-tip-1">Claim Portal</a>
					<a href="/confirm/demo-tip-high-value">Confirm Tip</a>
				</div>

				<div class="mt-footer-col">
					<h4>Developers</h4>
					<a href="https://github.com/xoulomon/mergetip" target="_blank" rel="noreferrer">GitHub Repository</a>
					<a href="http://localhost:8080/healthz" target="_blank" rel="noreferrer">API Health (/healthz)</a>
					<a href="http://localhost:8025" target="_blank" rel="noreferrer">Mailpit Local UI (:8025)</a>
					<a href="/settings#openapi">OpenAPI Contract</a>
				</div>

				<div class="mt-footer-col">
					<h4>Protocols</h4>
					<a href="https://github.com/nostr-protocol/nips/blob/master/47.md" target="_blank" rel="noreferrer">NIP-47 Specification</a>
					<a href="https://github.com/lnurl/luds" target="_blank" rel="noreferrer">LNURL Specifications</a>
					<a href="https://breez.technology/sdk/" target="_blank" rel="noreferrer">Breez SDK Docs</a>
					<a href="https://bitnob.com/" target="_blank" rel="noreferrer">Bitnob Payouts</a>
				</div>
			</div>
		</div>

		<div class="mt-footer-bottom">
			<div class="mt-footer-copy">
				© {currentYear} MergeTip contributors. Released under the <a href="https://github.com/xoulomon/mergetip/blob/main/LICENSE" target="_blank" rel="noreferrer">MIT License</a>.
			</div>
			<div class="mt-footer-meta">
				<span>Designed for open-source builders</span>
				<span class="mt-footer-bullet">•</span>
				<span>100% Non-Custodial</span>
			</div>
		</div>
	</div>
</footer>

<style>
	.mt-footer {
		background: var(--mt-bg-subtle);
		border-top: 1px solid var(--mt-border);
		margin-top: 64px;
		color: var(--mt-fg-muted);
		font-size: 13px;
	}

	.mt-footer-container {
		max-width: 1240px;
		margin: 0 auto;
		padding: 48px 16px 32px 16px;
	}

	.mt-footer-top {
		display: grid;
		grid-template-columns: 1.5fr 2fr;
		gap: 48px;
		padding-bottom: 40px;
		border-bottom: 1px solid var(--mt-border-muted);
	}

	.mt-footer-brand {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.mt-footer-logo {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 17px;
		font-weight: 700;
		color: var(--mt-fg);
	}

	.mt-brand-icon {
		color: var(--mt-bolt);
	}

	.mt-footer-tagline {
		color: var(--mt-fg-muted);
		line-height: 1.6;
		margin: 0;
		max-width: 420px;
	}

	.mt-protocols {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 4px;
	}

	.mt-protocol-pill {
		font-size: 11px;
		font-weight: 500;
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		border-radius: 4px;
		padding: 2px 7px;
		color: var(--mt-fg-subtle);
	}

	.mt-footer-links-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 24px;
	}

	.mt-footer-col {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.mt-footer-col h4 {
		font-size: 12px;
		font-weight: 600;
		color: var(--mt-fg);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 4px 0;
	}

	.mt-footer-col a {
		color: var(--mt-fg-muted);
		text-decoration: none;
		transition: color 0.15s ease;
	}

	.mt-footer-col a:hover {
		color: var(--mt-fg);
		text-decoration: underline;
	}

	.mt-footer-bottom {
		padding-top: 24px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 12px;
		color: var(--mt-fg-subtle);
		flex-wrap: wrap;
		gap: 12px;
	}

	.mt-footer-copy a {
		color: var(--mt-fg-muted);
		text-decoration: underline;
	}

	.mt-footer-meta {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.mt-footer-bullet {
		color: var(--mt-border);
	}

	@media (max-width: 768px) {
		.mt-footer-top {
			grid-template-columns: 1fr;
			gap: 32px;
		}
		.mt-footer-links-grid {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
