<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';
	import Badge from './Badge.svelte';

	let {
		currentPath = '/',
		relayConnected = true,
		walletConnected = true,
		walletBalanceSats = 385000,
		userHandle = 'xoulomon',
		theme = 'dark',
		ontoggletheme
	}: {
		currentPath?: string;
		relayConnected?: boolean;
		walletConnected?: boolean;
		walletBalanceSats?: number;
		userHandle?: string;
		theme?: 'dark' | 'light';
		ontoggletheme?: () => void;
	} = $props();

	const navItems = [
		{ label: 'Overview', href: '/' },
		{ label: 'Dashboard', href: '/dashboard' },
		{ label: 'Settings', href: '/settings' },
		{ label: 'Claim Demo', href: '/claim/demo-tip-1' },
		{ label: 'Confirm Demo', href: '/confirm/demo-tip-high-value' }
	];
</script>

<header class="mt-navbar">
	<div class="mt-navbar-container">
		<!-- Brand & Logo -->
		<div class="mt-navbar-left">
			<a href="/" class="mt-brand" aria-label="MergeTip Home">
				<span class="mt-brand-icon">⚡</span>
				<span class="mt-brand-name">MergeTip</span>
				<span class="mt-brand-badge">NWC</span>
			</a>

			<!-- Navigation Links -->
			<nav class="mt-nav-links" aria-label="Main navigation">
				{#each navItems as item (item.href)}
					<a
						href={item.href}
						class="mt-nav-link {currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href)) ? 'mt-nav-link-active' : ''}"
					>
						{item.label}
					</a>
				{/each}
			</nav>
		</div>

		<!-- Right Tools -->
		<div class="mt-navbar-right">
			<!-- Relay Status Pill -->
			<div class="mt-status-pill" title="Nostr relay connection status">
				<span class="mt-status-dot {relayConnected ? 'mt-status-online' : 'mt-status-offline'}"></span>
				<span class="mt-status-text">{relayConnected ? 'Relay Active' : 'Relay Disconnected'}</span>
			</div>

			<!-- Wallet Balance Pill -->
			{#if walletConnected}
				<a href="/settings" class="mt-wallet-pill" title="Nostr Wallet Connect (NWC) connected balance">
					<span class="mt-wallet-icon">⚡</span>
					<span class="mt-wallet-amt">{walletBalanceSats.toLocaleString('en-US')}</span>
					<span class="mt-wallet-unit">sats</span>
				</a>
			{/if}

			<!-- Theme Toggle Button -->
			<button
				class="mt-theme-toggle"
				onclick={ontoggletheme}
				title="Toggle light/dark theme"
				aria-label="Toggle theme"
			>
				{#if theme === 'dark'}
					<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="5"></circle>
						<line x1="12" y1="1" x2="12" y2="3"></line>
						<line x1="12" y1="21" x2="12" y2="23"></line>
						<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
						<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
						<line x1="1" y1="12" x2="3" y2="12"></line>
						<line x1="21" y1="12" x2="23" y2="12"></line>
						<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
						<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
					</svg>
				{:else}
					<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
					</svg>
				{/if}
			</button>

			<!-- GitHub User Profile Pill -->
			<div class="mt-user-pill">
				<img
					src="https://avatars.githubusercontent.com/u/75281652?v=4"
					alt="@{userHandle}"
					class="mt-user-avatar"
					onerror={(e) => {
						// fallback placeholder
						const el = e.currentTarget as HTMLImageElement;
						el.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%239198a1"><circle cx="12" cy="12" r="10"/></svg>';
					}}
				/>
				<span class="mt-user-name">@{userHandle}</span>
			</div>
		</div>
	</div>
</header>

<style>
	.mt-navbar {
		background: var(--mt-surface);
		border-bottom: 1px solid var(--mt-border);
		position: sticky;
		top: 0;
		z-index: 40;
		backdrop-filter: blur(8px);
	}

	.mt-navbar-container {
		max-width: 1240px;
		margin: 0 auto;
		padding: 0 16px;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}

	.mt-navbar-left {
		display: flex;
		align-items: center;
		gap: 24px;
	}

	.mt-brand {
		display: flex;
		align-items: center;
		gap: 6px;
		text-decoration: none;
		color: var(--mt-fg);
		font-weight: 700;
		font-size: 17px;
		letter-spacing: -0.01em;
	}

	.mt-brand-icon {
		font-size: 18px;
		color: var(--mt-bolt);
		filter: drop-shadow(0 0 4px var(--mt-bolt-glow));
	}

	.mt-brand-badge {
		font-size: 10px;
		font-weight: 600;
		padding: 1px 5px;
		border-radius: 4px;
		background: var(--mt-bolt-subtle);
		color: var(--mt-bolt);
		border: 1px solid var(--mt-bolt);
		letter-spacing: 0.04em;
	}

	.mt-nav-links {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.mt-nav-link {
		color: var(--mt-fg-muted);
		text-decoration: none;
		font-size: 14px;
		font-weight: 500;
		padding: 6px 12px;
		border-radius: 6px;
		transition: all 0.15s ease;
	}

	.mt-nav-link:hover {
		color: var(--mt-fg);
		background: var(--mt-surface-hover);
	}

	.mt-nav-link-active {
		color: var(--mt-fg);
		font-weight: 600;
		background: var(--mt-surface-hover);
	}

	.mt-navbar-right {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.mt-status-pill {
		display: flex;
		align-items: center;
		gap: 6px;
		background: var(--mt-bg-subtle);
		border: 1px solid var(--mt-border-muted);
		border-radius: 9999px;
		padding: 4px 10px;
		font-size: 12px;
		color: var(--mt-fg-muted);
	}

	.mt-status-dot {
		width: 7px;
		height: 7px;
		border-radius: 9999px;
	}

	.mt-status-online {
		background: var(--mt-success);
		box-shadow: 0 0 6px var(--mt-success);
	}

	.mt-status-offline {
		background: var(--mt-danger);
	}

	.mt-wallet-pill {
		display: flex;
		align-items: center;
		gap: 5px;
		background: var(--mt-bolt-subtle);
		border: 1px solid var(--mt-bolt);
		border-radius: 9999px;
		padding: 4px 12px;
		text-decoration: none;
		color: var(--mt-fg);
		font-size: 13px;
		font-weight: 600;
		transition: transform 0.15s ease, box-shadow 0.15s ease;
	}

	.mt-wallet-pill:hover {
		transform: translateY(-1px);
		box-shadow: 0 2px 8px var(--mt-bolt-glow);
	}

	.mt-wallet-icon {
		color: var(--mt-bolt);
	}

	.mt-wallet-unit {
		font-size: 11px;
		color: var(--mt-fg-muted);
		font-weight: 500;
	}

	.mt-theme-toggle {
		background: var(--mt-btn-bg);
		border: 1px solid var(--mt-border);
		color: var(--mt-fg-muted);
		width: 32px;
		height: 32px;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.mt-theme-toggle:hover {
		color: var(--mt-fg);
		background: var(--mt-btn-hover);
		border-color: var(--mt-fg-subtle);
	}

	.mt-user-pill {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 3px 10px 3px 4px;
		border-radius: 9999px;
		background: var(--mt-btn-bg);
		border: 1px solid var(--mt-border);
		font-size: 13px;
		font-weight: 500;
		color: var(--mt-fg);
	}

	.mt-user-avatar {
		width: 24px;
		height: 24px;
		border-radius: 9999px;
		object-fit: cover;
	}

	@media (max-width: 860px) {
		.mt-nav-links {
			display: none;
		}
		.mt-status-pill {
			display: none;
		}
	}
</style>
