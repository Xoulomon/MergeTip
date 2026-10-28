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
		userName = 'Xoulomon',
		lightningAddress = 'xoulomon@getalby.com',
		nostrPubkey = 'npub1xoulomon89a74cf8290e219b48c',
		theme = 'dark',
		ontoggletheme
	}: {
		currentPath?: string;
		relayConnected?: boolean;
		walletConnected?: boolean;
		walletBalanceSats?: number;
		userHandle?: string;
		userName?: string;
		lightningAddress?: string;
		nostrPubkey?: string;
		theme?: 'dark' | 'light';
		ontoggletheme?: () => void;
	} = $props();

	let profileMenuOpen = $state(false);
	let copiedField = $state<string | null>(null);

	function toggleProfileMenu(e: MouseEvent) {
		e.stopPropagation();
		profileMenuOpen = !profileMenuOpen;
	}

	function closeMenu() {
		profileMenuOpen = false;
	}

	function copyField(val: string, field: string, e?: MouseEvent) {
		e?.stopPropagation();
		navigator.clipboard?.writeText(val);
		copiedField = field;
		setTimeout(() => {
			if (copiedField === field) copiedField = null;
		}, 2000);
	}

	const navItems = [
		{ label: 'Overview', href: '/' },
		{ label: 'Dashboard', href: '/dashboard' },
		{ label: 'Profile', href: '/profile' },
		{ label: 'Settings', href: '/settings' },
		{ label: 'Claim Demo', href: '/claim/demo-tip-1' },
		{ label: 'Confirm Demo', href: '/confirm/demo-tip-high-value' }
	];
</script>

<svelte:window
	onclick={closeMenu}
	onkeydown={(e) => {
		if (e.key === 'Escape') closeMenu();
	}}
/>

<header class="mt-navbar">
	<div class="mt-navbar-container">
		<!-- Brand & Logo -->
		<div class="mt-navbar-left">
			<a href="/" class="mt-brand" aria-label="MergeTip Home">
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

			<!-- GitHub User Profile Pill & Dropdown -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="mt-profile-wrapper" onclick={(e) => e.stopPropagation()} onkeydown={() => {}}>
				<button
					class="mt-user-pill-btn {profileMenuOpen ? 'mt-user-pill-active' : ''}"
					onclick={toggleProfileMenu}
					aria-haspopup="true"
					aria-expanded={profileMenuOpen}
					aria-label="User profile and protocol menu for @{userHandle}"
				>
					<div class="mt-avatar-container">
						<img
							src="https://avatars.githubusercontent.com/u/75281652?v=4"
							alt="@{userHandle}"
							class="mt-user-avatar"
							onerror={(e) => {
								const el = e.currentTarget as HTMLImageElement;
								el.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%239198a1"><circle cx="12" cy="12" r="10"/></svg>';
							}}
						/>
						<span class="mt-avatar-dot" title="Active Sponsor"></span>
					</div>
					<div class="mt-user-meta">
						<span class="mt-user-name">@{userHandle}</span>
					</div>
					<svg
						class="mt-chevron {profileMenuOpen ? 'mt-chevron-up' : ''}"
						width="12"
						height="12"
						viewBox="0 0 16 16"
						fill="currentColor"
					>
						<path d="M12.78 6.22a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.22 7.28a.75.75 0 0 1 1.06-1.06L8 9.94l3.72-3.72a.75.75 0 0 1 1.06 0Z"></path>
					</svg>
				</button>

				{#if profileMenuOpen}
					<div class="mt-profile-dropdown" role="menu" aria-label="Profile navigation menu">
						<!-- Dropdown Header -->
						<div class="mt-drop-header">
							<div class="mt-drop-user-row">
								<div class="mt-drop-avatar-wrap">
									<img
										src="https://avatars.githubusercontent.com/u/75281652?v=4"
										alt="@{userHandle}"
										class="mt-drop-avatar"
									/>
								</div>
								<div class="mt-drop-user-info">
									<div class="mt-drop-name-row">
										<span class="mt-drop-name">{userName}</span>
										<span class="mt-drop-role-pill">Core Sponsor</span>
									</div>
									<a
										href="https://github.com/{userHandle}"
										target="_blank"
										rel="noreferrer"
										class="mt-drop-handle"
									>
										@{userHandle}
										<svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
											<path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.75.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V4.56L9.28 9.28a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l4.69-4.72h-1.69a.75.75 0 0 1-.75-.75Z"></path>
										</svg>
									</a>
								</div>
							</div>

							<!-- Lightning Address & Nostr Pubkey quick copy -->
							<div class="mt-protocol-pills">
								<!-- Lightning Address -->
								<div class="mt-proto-pill">
									<span class="mt-proto-tag">LN</span>
									<span class="mt-proto-text" title={lightningAddress}>{lightningAddress}</span>
									<button
										class="mt-proto-copy"
										onclick={(e) => copyField(lightningAddress, 'ln', e)}
										title="Copy Lightning Address"
									>
										{copiedField === 'ln' ? 'Copied' : 'Copy'}
									</button>
								</div>

								<!-- Nostr npub -->
								<div class="mt-proto-pill">
									<span class="mt-proto-tag">NPUB</span>
									<span class="mt-proto-text" title={nostrPubkey}>{nostrPubkey.slice(0, 10)}…{nostrPubkey.slice(-4)}</span>
									<button
										class="mt-proto-copy"
										onclick={(e) => copyField(nostrPubkey, 'nostr', e)}
										title="Copy Nostr Pubkey"
									>
										{copiedField === 'nostr' ? 'Copied' : 'Copy'}
									</button>
								</div>
							</div>
						</div>

						<!-- Wallet & Stats Snapshot -->
						<div class="mt-drop-stats">
							<div class="mt-drop-stat">
								<span class="mt-drop-stat-label">Wallet Balance</span>
								<span class="mt-drop-stat-val">{walletBalanceSats.toLocaleString('en-US')} <small>sats</small></span>
							</div>
							<div class="mt-drop-stat">
								<span class="mt-drop-stat-label">Total Disbursed</span>
								<span class="mt-drop-stat-val">185,000 <small>sats</small></span>
							</div>
						</div>

						<!-- Menu Navigation Items -->
						<div class="mt-drop-menu">
							<a href="/profile" class="mt-drop-item" onclick={closeMenu} role="menuitem">
								<div class="mt-item-text">
									<span class="mt-item-title">Public Contributor Profile</span>
									<span class="mt-item-desc">View verified badges, stats and tips</span>
								</div>
							</a>

							<a href="/dashboard" class="mt-drop-item" onclick={closeMenu} role="menuitem">
								<div class="mt-item-text">
									<span class="mt-item-title">Sponsor Dashboard</span>
									<span class="mt-item-desc">Spending caps and live tip stream</span>
								</div>
							</a>

							<a href="/settings" class="mt-drop-item" onclick={closeMenu} role="menuitem">
								<div class="mt-item-text">
									<span class="mt-item-title">Protocol & Wallet Settings</span>
									<span class="mt-item-desc">NWC keys, GitHub apps and fiat rails</span>
								</div>
							</a>

							<a
								href="https://github.com/{userHandle}"
								target="_blank"
								rel="noreferrer"
								class="mt-drop-item"
								role="menuitem"
							>
								<div class="mt-item-text">
									<span class="mt-item-title">GitHub Profile</span>
									<span class="mt-item-desc">github.com/{userHandle}</span>
								</div>
							</a>
						</div>

						<!-- Dropdown Footer -->
						<div class="mt-drop-footer">
							<div class="mt-drop-status-row">
								<span class="mt-status-dot mt-status-online"></span>
								<span class="mt-drop-status-text">NWC Handshake Verified</span>
							</div>
							<a href="/settings" class="mt-drop-switch-link" onclick={closeMenu}>
								Manage Keys
							</a>
						</div>
					</div>
				{/if}
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

	.mt-profile-wrapper {
		position: relative;
	}

	.mt-user-pill-btn {
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
		cursor: pointer;
		transition: all 0.15s ease;
		user-select: none;
	}

	.mt-user-pill-btn:hover,
	.mt-user-pill-active {
		background: var(--mt-btn-hover);
		border-color: var(--mt-fg-subtle);
		box-shadow: 0 0 0 1px var(--mt-border-glow);
	}

	.mt-avatar-container {
		position: relative;
		width: 26px;
		height: 26px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.mt-user-avatar {
		width: 26px;
		height: 26px;
		border-radius: 9999px;
		object-fit: cover;
		border: 1.5px solid var(--mt-bolt);
	}

	.mt-avatar-dot {
		position: absolute;
		bottom: -1px;
		right: -1px;
		width: 8px;
		height: 8px;
		border-radius: 9999px;
		background: var(--mt-success);
		border: 1.5px solid var(--mt-surface);
	}

	.mt-user-meta {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.mt-user-name {
		font-weight: 600;
		font-size: 13px;
		color: var(--mt-fg);
	}

	.mt-user-badge {
		font-size: 11px;
		color: var(--mt-bolt);
		filter: drop-shadow(0 0 4px var(--mt-bolt-glow));
	}

	.mt-chevron {
		color: var(--mt-fg-subtle);
		transition: transform 0.18s ease;
	}

	.mt-chevron-up {
		transform: rotate(180deg);
	}

	/* Dropdown Flyout */
	.mt-profile-dropdown {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		width: 320px;
		background: var(--mt-surface);
		border: 1px solid var(--mt-border-glow);
		border-radius: 12px;
		box-shadow: 0 12px 32px var(--mt-shadow), 0 0 0 1px var(--mt-border);
		z-index: 100;
		overflow: hidden;
		animation: dropFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes dropFadeIn {
		from {
			opacity: 0;
			transform: translateY(-6px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.mt-drop-header {
		padding: 16px;
		background: var(--mt-surface-subtle);
		border-bottom: 1px solid var(--mt-border);
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.mt-drop-user-row {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.mt-drop-avatar-wrap {
		position: relative;
		width: 44px;
		height: 44px;
		flex-shrink: 0;
	}

	.mt-drop-avatar {
		width: 44px;
		height: 44px;
		border-radius: 9999px;
		object-fit: cover;
		border: 2px solid var(--mt-bolt);
		box-shadow: 0 0 10px var(--mt-bolt-glow);
	}

	.mt-drop-bolt {
		position: absolute;
		bottom: -2px;
		right: -2px;
		background: var(--mt-surface);
		border: 1.5px solid var(--mt-bolt);
		color: var(--mt-bolt);
		font-size: 10px;
		border-radius: 9999px;
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.mt-drop-user-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.mt-drop-name-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.mt-drop-name {
		font-weight: 700;
		font-size: 15px;
		color: var(--mt-fg);
	}

	.mt-drop-role-pill {
		font-size: 10px;
		font-weight: 600;
		padding: 1px 6px;
		border-radius: 9999px;
		background: var(--mt-bolt-subtle);
		color: var(--mt-bolt);
		border: 1px solid var(--mt-bolt);
		letter-spacing: 0.02em;
	}

	.mt-drop-handle {
		font-size: 12px;
		color: var(--mt-fg-muted);
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		transition: color 0.15s ease;
	}

	.mt-drop-handle:hover {
		color: var(--mt-link);
		text-decoration: underline;
	}

	.mt-protocol-pills {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.mt-proto-pill {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 8px;
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		border-radius: 6px;
		font-size: 12px;
	}

	.mt-proto-tag {
		font-size: 10px;
		font-weight: 700;
		font-family: var(--mt-font-mono);
		padding: 1px 5px;
		border-radius: 4px;
		background: var(--mt-surface-subtle);
		border: 1px solid var(--mt-border);
		color: var(--mt-fg-muted);
		letter-spacing: 0.04em;
	}

	.mt-proto-text {
		font-family: var(--mt-font-mono);
		font-size: 11px;
		color: var(--mt-fg-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		flex: 1;
	}

	.mt-proto-copy {
		background: var(--mt-btn-bg);
		border: 1px solid var(--mt-border);
		border-radius: 4px;
		padding: 2px 6px;
		font-size: 10px;
		font-weight: 600;
		color: var(--mt-fg-muted);
		cursor: pointer;
		transition: all 0.15s ease;
		flex-shrink: 0;
	}

	.mt-proto-copy:hover {
		background: var(--mt-btn-hover);
		color: var(--mt-fg);
		border-color: var(--mt-fg-subtle);
	}

	.mt-drop-stats {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
		padding: 10px 16px;
		background: var(--mt-surface);
		border-bottom: 1px solid var(--mt-border);
	}

	.mt-drop-stat {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.mt-drop-stat-label {
		font-size: 11px;
		color: var(--mt-fg-subtle);
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.mt-drop-stat-val {
		font-size: 13px;
		font-weight: 700;
		color: var(--mt-fg);
	}

	.mt-drop-stat-val small {
		font-size: 10px;
		font-weight: 500;
		color: var(--mt-fg-muted);
	}

	.mt-drop-menu {
		padding: 6px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.mt-drop-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 10px;
		border-radius: 8px;
		text-decoration: none;
		color: var(--mt-fg);
		transition: all 0.15s ease;
	}

	.mt-drop-item:hover {
		background: var(--mt-surface-hover);
	}

	.mt-item-icon {
		font-size: 15px;
		flex-shrink: 0;
		width: 20px;
		text-align: center;
	}

	.mt-item-text {
		display: flex;
		flex-direction: column;
		gap: 1px;
		flex: 1;
		min-width: 0;
	}

	.mt-item-title {
		font-size: 13px;
		font-weight: 600;
		color: var(--mt-fg);
	}

	.mt-item-desc {
		font-size: 11px;
		color: var(--mt-fg-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.mt-item-arrow {
		font-size: 12px;
		color: var(--mt-fg-subtle);
		transition: transform 0.15s ease;
	}

	.mt-drop-item:hover .mt-item-arrow {
		transform: translateX(2px);
		color: var(--mt-fg);
	}

	.mt-drop-footer {
		padding: 10px 16px;
		background: var(--mt-surface-subtle);
		border-top: 1px solid var(--mt-border);
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 11px;
	}

	.mt-drop-status-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.mt-drop-status-text {
		color: var(--mt-fg-muted);
		font-weight: 500;
	}

	.mt-drop-switch-link {
		color: var(--mt-link);
		text-decoration: none;
		font-weight: 600;
	}

	.mt-drop-switch-link:hover {
		text-decoration: underline;
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
