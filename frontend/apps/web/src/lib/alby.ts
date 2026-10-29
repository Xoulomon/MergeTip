// Alby Hub's `/apps/new` deep link (github.com/getAlby/hub, "apps/new deeplink"). Without a
// `pubkey`, the hub creates the connection and shows its connection string, which the user then
// pastes here: MergeTip never generates or sees wallet keys.

export const BUDGET_RENEWALS = ['daily', 'weekly', 'monthly', 'yearly', 'never'] as const;
export type BudgetRenewal = (typeof BUDGET_RENEWALS)[number];

export interface AlbyConnectOptions {
	hubUrl: string;
	budgetSats: number;
	renewal: BudgetRenewal;
}

export function albyConnectUrl({ hubUrl, budgetSats, renewal }: AlbyConnectOptions): string {
	const url = new URL('/apps/new', hubUrl);
	url.searchParams.set('name', 'MergeTip');
	// Paying invoices is the only permission MergeTip needs (PRD: limited to pay_invoice).
	url.searchParams.set('request_methods', 'pay_invoice');
	url.searchParams.set('max_amount', String(budgetSats * 1000)); // millisats
	url.searchParams.set('budget_renewal', renewal);
	return url.toString();
}
