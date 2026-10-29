// Keeps the recovery phrase in this browser only, encrypted with a PIN the user picks
// (PBKDF2-SHA-256 → AES-256-GCM via Web Crypto). The phrase never goes to MergeTip's API.

export const MIN_PIN_LENGTH = 6;
const ITERATIONS = 600_000; // OWASP 2023 guidance for PBKDF2-HMAC-SHA256
const encoder = new TextEncoder();

export interface SealedSeed {
	version: 1;
	salt: Uint8Array;
	iv: Uint8Array;
	ciphertext: ArrayBuffer;
	createdAt: string;
}

async function deriveKey(pin: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
	const material = await crypto.subtle.importKey('raw', encoder.encode(pin), 'PBKDF2', false, [
		'deriveKey'
	]);
	return crypto.subtle.deriveKey(
		{ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS },
		material,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
}

export async function seal(mnemonic: string, pin: string): Promise<SealedSeed> {
	if (pin.length < MIN_PIN_LENGTH) throw new Error(`PIN must be at least ${MIN_PIN_LENGTH} digits`);
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const key = await deriveKey(pin, salt);
	const ciphertext = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		key,
		encoder.encode(mnemonic)
	);
	return { version: 1, salt, iv, ciphertext, createdAt: new Date().toISOString() };
}

/** Decrypts the phrase; rejects when the PIN is wrong (AES-GCM authentication fails). */
export async function open(sealed: SealedSeed, pin: string): Promise<string> {
	const key = await deriveKey(pin, new Uint8Array(sealed.salt));
	const plain = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv: new Uint8Array(sealed.iv) },
		key,
		sealed.ciphertext
	);
	return new TextDecoder().decode(plain);
}

const DB = 'mergetip-wallet';
const STORE = 'vault';
const KEY = 'seed';

function database(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB, 1);
		request.onupgradeneeded = () => request.result.createObjectStore(STORE);
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error ?? new Error('IndexedDB is unavailable'));
	});
}

async function transact<T>(
	mode: IDBTransactionMode,
	act: (store: IDBObjectStore) => IDBRequest<T>
) {
	const db = await database();
	try {
		return await new Promise<T>((resolve, reject) => {
			const request = act(db.transaction(STORE, mode).objectStore(STORE));
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
		});
	} finally {
		db.close();
	}
}

export function storeSealed(sealed: SealedSeed): Promise<IDBValidKey> {
	return transact('readwrite', (store) => store.put(sealed, KEY));
}

export async function loadSealed(): Promise<SealedSeed | null> {
	const value = await transact<SealedSeed | undefined>('readonly', (store) => store.get(KEY));
	return value ?? null;
}
