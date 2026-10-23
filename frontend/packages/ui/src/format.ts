/** Amounts are always shown with thousands separators and the word "sats". */
export function formatSats(amount: number): string {
	return `${amount.toLocaleString('en-US')} sats`;
}
