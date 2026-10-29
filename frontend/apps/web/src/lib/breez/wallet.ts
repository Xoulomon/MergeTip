// The in-browser Breez SDK (Spark) wallet. The SDK and its WASM are imported only when someone
// creates a wallet, so they never weigh on other pages.
import { PUBLIC_BREEZ_API_KEY, PUBLIC_BREEZ_NETWORK } from '$app/env/public';

export const walletAvailable = PUBLIC_BREEZ_API_KEY !== '';

/** Lightning address usernames: lowercase letters and digits, like the Breez server expects. */
export function usernameCandidates(login: string): string[] {
	const base =
		login
			.toLowerCase()
			.replace(/[^a-z0-9]/g, '')
			.slice(0, 24) || 'mergetip';
	const suffix = (): string => String(crypto.getRandomValues(new Uint16Array(1))[0] ?? 0);
	return [base, `${base}${suffix()}`, `${base}${suffix()}`];
}

/**
 * Starts the wallet from `mnemonic` and registers a Lightning address for it, trying the
 * candidates in order until one is free. Resolves with the new address.
 */
export async function createLightningAddress(
	mnemonic: string,
	candidates: readonly string[]
): Promise<string> {
	const { default: init, connect, defaultConfig } = await import('@breeztech/breez-sdk-spark/web');
	await init();
	const config = defaultConfig(PUBLIC_BREEZ_NETWORK);
	config.apiKey = PUBLIC_BREEZ_API_KEY;
	const sdk = await connect({
		config,
		seed: { type: 'mnemonic', mnemonic },
		storageDir: 'mergetip-wallet'
	});
	try {
		const existing = await sdk.getLightningAddress();
		if (existing) return existing.lightningAddress;
		for (const username of candidates) {
			if (await sdk.checkLightningAddressAvailable({ username })) {
				const info = await sdk.registerLightningAddress({
					username,
					description: 'Tips from MergeTip'
				});
				return info.lightningAddress;
			}
		}
		throw new Error('No Lightning address username is free');
	} finally {
		await sdk.disconnect();
	}
}
