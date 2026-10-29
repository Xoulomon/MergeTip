import { storage } from 'wxt/utils/storage';

export interface StoredToken {
	token: string;
	expires_at: string;
	login: string;
}

// Session storage is memory-only and hidden from content scripts. Older browsers without it fall
// back to local storage; the expiry check below applies either way.
const sessionItem = storage.defineItem<StoredToken | null>('session:auth', { fallback: null });
const localItem = storage.defineItem<StoredToken | null>('local:auth', { fallback: null });

async function area() {
	try {
		await sessionItem.getValue();
		return sessionItem;
	} catch {
		return localItem;
	}
}

export async function readToken(now = Date.now()): Promise<StoredToken | null> {
	const item = await area();
	const stored = await item.getValue();
	if (stored && Date.parse(stored.expires_at) <= now) {
		await item.removeValue();
		return null;
	}
	return stored;
}

export async function saveToken(token: StoredToken): Promise<void> {
	await (await area()).setValue(token);
}

export async function clearToken(): Promise<void> {
	await Promise.all([sessionItem.removeValue(), localItem.removeValue().catch(() => {})]);
}
