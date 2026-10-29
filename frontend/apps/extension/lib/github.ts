// Everything that depends on github.com's markup lives here, so a GitHub redesign means editing
// one file. Selectors fail closed: when nothing matches, no buttons appear and the page is
// untouched.

export interface Thread {
	repo: string;
	number: number;
	isPullRequest: boolean;
}

/** Author links: the classic PR timeline, and the React issue view's header and comments. */
export const AUTHOR_SELECTORS = [
	'a.author',
	'a[data-testid="issue-body-header-author"]',
	'[data-testid="comment-header-left-side-items"] a[data-testid="avatar-link"]'
] as const;

/** The page title, where the button for the thread's author goes. */
export const TITLE_SELECTORS = [
	'[class*="PageHeader-TitleArea"] h1',
	'[data-testid="issue-title"]',
	'h1.gh-header-title'
] as const;

/** Marks nodes we have handled, so repeated scans never add a second button. */
export const PROCESSED = 'data-mergetip';

/** `/owner/repo/pull/42/files` → `{ repo: 'owner/repo', number: 42, isPullRequest: true }`. */
export function parseThread(pathname: string): Thread | null {
	const match = /^\/([\w.-]+)\/([\w.-]+)\/(pull|issues)\/(\d+)(?:\/|$)/.exec(pathname);
	if (!match) return null;
	const [, owner, name, kind, number] = match;
	return { repo: `${owner}/${name}`, number: Number(number), isPullRequest: kind === 'pull' };
}

const LOGIN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

/** The GitHub login an author link points to, or `null` for apps, bots and anything else. */
export function loginFromLink(link: HTMLAnchorElement): string | null {
	let path: string;
	try {
		path = new URL(link.getAttribute('href') ?? '', 'https://github.com').pathname;
	} catch {
		return null;
	}
	// GitHub App bots link to `/apps/<name>`, which is not a single path segment.
	const login = path.replace(/^\/|\/$/g, '');
	return LOGIN.test(login) ? login : null;
}

/** Author links that still need a button, in document order. */
export function findAuthorLinks(root: ParentNode): HTMLAnchorElement[] {
	return [...root.querySelectorAll<HTMLAnchorElement>(AUTHOR_SELECTORS.join(','))].filter(
		(link) => link.textContent?.trim() && !link.hasAttribute(PROCESSED) && loginFromLink(link)
	);
}

/** The thread's author: the first author on the page is the opening post's. */
export function threadAuthor(root: ParentNode): string | null {
	const issueAuthor = root.querySelector<HTMLAnchorElement>(AUTHOR_SELECTORS[1]);
	const first = issueAuthor ?? root.querySelector<HTMLAnchorElement>(AUTHOR_SELECTORS.join(','));
	return first ? loginFromLink(first) : null;
}

export function findTitle(root: ParentNode): HTMLElement | null {
	for (const selector of TITLE_SELECTORS) {
		const title = root.querySelector<HTMLElement>(selector);
		if (title) return title;
	}
	return null;
}

/** The signed-in GitHub user, so we never offer to tip yourself. */
export function viewerLogin(doc: Document): string | null {
	return doc.querySelector<HTMLMetaElement>('meta[name="user-login"]')?.content || null;
}
