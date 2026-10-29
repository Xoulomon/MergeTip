export type Theme = 'light' | 'dark';

const KEY = 'mergetip-theme';

/** The active colour theme. `app.html` applies a saved choice before first paint. */
class ThemeState {
	current = $state<Theme>('light');

	/** Reads the theme that is showing: the saved choice, or the OS preference. */
	init(): void {
		const saved = document.documentElement.dataset.theme;
		this.current =
			saved === 'light' || saved === 'dark'
				? saved
				: matchMedia('(prefers-color-scheme: dark)').matches
					? 'dark'
					: 'light';
	}

	toggle(): void {
		this.current = this.current === 'dark' ? 'light' : 'dark';
		document.documentElement.dataset.theme = this.current;
		try {
			localStorage.setItem(KEY, this.current);
		} catch {
			// Storage can be blocked; the choice then lasts for this page only.
		}
	}
}

export const theme = new ThemeState();
