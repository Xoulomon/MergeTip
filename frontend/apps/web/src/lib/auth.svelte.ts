export interface UserSession {
	isAuthenticated: boolean;
	userHandle: string | null;
	userName: string | null;
	avatarUrl: string | null;
	lightningAddress: string;
	nostrPubkey: string;
	walletBalanceSats: number;
	connectedAt: string | null;
}

export const DEFAULT_USER: UserSession = {
	isAuthenticated: true,
	userHandle: 'xoulomon',
	userName: 'Xoulomon',
	avatarUrl: 'https://avatars.githubusercontent.com/u/75281652?v=4',
	lightningAddress: 'xoulomon@getalby.com',
	nostrPubkey: 'npub1xoulomon89a74cf8290e219b48c',
	walletBalanceSats: 385000,
	connectedAt: '2024-03-15T10:00:00Z'
};

class AuthStore {
	session = $state<UserSession>({ ...DEFAULT_USER });
	isLoginModalOpen = $state(false);

	init() {
		if (typeof window === 'undefined') return;
		try {
			const stored = localStorage.getItem('mergetip_user_session');
			if (stored) {
				const parsed = JSON.parse(stored);
				this.session = parsed;
			}
		} catch (e) {
			console.error('Failed to load user session', e);
		}
	}

	login(handle: string, name?: string, avatar?: string) {
		const cleanHandle = handle.replace(/^@/, '').trim();
		if (!cleanHandle) return;

		const finalName = name && name.trim() ? name.trim() : cleanHandle;
		const finalAvatar = avatar || `https://github.com/${cleanHandle}.png`;

		this.session = {
			isAuthenticated: true,
			userHandle: cleanHandle,
			userName: finalName,
			avatarUrl: finalAvatar,
			lightningAddress: `${cleanHandle.toLowerCase()}@getalby.com`,
			nostrPubkey: `npub1${cleanHandle.toLowerCase()}89a74cf8290e219b`,
			walletBalanceSats: 250000,
			connectedAt: new Date().toISOString()
		};

		if (typeof window !== 'undefined') {
			localStorage.setItem('mergetip_user_session', JSON.stringify(this.session));
		}
		this.isLoginModalOpen = false;
	}

	logout() {
		this.session = {
			isAuthenticated: false,
			userHandle: null,
			userName: null,
			avatarUrl: null,
			lightningAddress: '',
			nostrPubkey: '',
			walletBalanceSats: 0,
			connectedAt: null
		};

		if (typeof window !== 'undefined') {
			localStorage.setItem('mergetip_user_session', JSON.stringify(this.session));
		}
	}

	openLoginModal() {
		this.isLoginModalOpen = true;
	}

	closeLoginModal() {
		this.isLoginModalOpen = false;
	}
}

export const auth = new AuthStore();
