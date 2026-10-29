export type ToastTone = 'success' | 'danger' | 'info';

export interface Toast {
	id: number;
	tone: ToastTone;
	message: string;
}

const DISMISS_AFTER_MS = 5_000;

class Toasts {
	items = $state<Toast[]>([]);
	#next = 1;

	show(message: string, tone: ToastTone = 'info'): number {
		const id = this.#next++;
		this.items.push({ id, tone, message });
		setTimeout(() => this.dismiss(id), DISMISS_AFTER_MS);
		return id;
	}

	success(message: string): number {
		return this.show(message, 'success');
	}

	error(message: string): number {
		return this.show(message, 'danger');
	}

	info(message: string): number {
		return this.show(message, 'info');
	}

	dismiss(id: number): void {
		this.items = this.items.filter((toast) => toast.id !== id);
	}
}

/** App-wide toast queue; render it once with `<Toaster />`. */
export const toasts = new Toasts();
