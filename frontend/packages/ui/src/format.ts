/** Formatter helpers for sats, fiat estimates, relative time, and keys */

/** Format an amount in sats with thousands separators */
export function formatSats(amount: number): string {
	return `${amount.toLocaleString('en-US')} sats`;
}

/** Approximate USD conversion for sat amounts (1 BTC = $68,000 baseline) */
export function formatFiatUSD(sats: number, btcPriceUsd = 68_000): string {
	const usd = (sats / 100_000_000) * btcPriceUsd;
	if (usd < 0.01) {
		return '<$0.01';
	}
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(usd);
}

/** Approximate local fiat conversion for Bitnob African corridors */
export function formatBitnobFiat(
	sats: number,
	currency: 'NGN' | 'GHS' | 'KES',
	btcPriceUsd = 68_000
): string {
	const usd = (sats / 100_000_000) * btcPriceUsd;
	// Approximate exchange rates
	const rates: Record<'NGN' | 'GHS' | 'KES', { rate: number; symbol: string }> = {
		NGN: { rate: 1650, symbol: '₦' },
		GHS: { rate: 16.2, symbol: 'GH₵' },
		KES: { rate: 130, symbol: 'KSh' }
	};
	const { rate, symbol } = rates[currency];
	const val = usd * rate;
	return `${symbol}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Truncate a hex key or address for display: 0x1234...5678 */
export function truncateKey(key: string, head = 6, tail = 4): string {
	if (!key || key.length <= head + tail) return key;
	return `${key.slice(0, head)}…${key.slice(-tail)}`;
}

/** Format relative time (e.g. "5m ago", "2d ago") */
export function formatRelativeTime(date: Date | string | number): string {
	const now = Date.now();
	const then = new Date(date).getTime();
	const diffSec = Math.floor((now - then) / 1000);

	if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
	const diffMin = Math.floor(diffSec / 60);
	if (diffMin < 60) return `${diffMin}m ago`;
	const diffHour = Math.floor(diffMin / 60);
	if (diffHour < 24) return `${diffHour}h ago`;
	const diffDay = Math.floor(diffHour / 24);
	if (diffDay < 30) return `${diffDay}d ago`;
	return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
