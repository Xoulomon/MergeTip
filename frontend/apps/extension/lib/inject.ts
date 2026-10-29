import { PROCESSED, findAuthorLinks, findTitle, loginFromLink, threadAuthor } from './github';

export type OpenTip = (receiver: string) => void;

function tipButton(receiver: string, label: string, onclick: OpenTip): HTMLButtonElement {
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = label;
	button.setAttribute(PROCESSED, 'button');
	button.setAttribute('aria-label', `Tip @${receiver} with MergeTip`);
	// GitHub's own Primer classes, so the button matches the page in both themes.
	button.className = 'btn btn-sm ml-2';
	button.addEventListener('click', (event) => {
		event.preventDefault();
		event.stopPropagation();
		onclick(receiver);
	});
	return button;
}

/**
 * Adds a ⚡ Tip button after every author on the page that does not have one yet, and one beside
 * the title for the thread's author. Safe to call repeatedly.
 */
export function injectButtons(root: Document, viewer: string | null, onclick: OpenTip): number {
	const self = viewer?.toLowerCase();
	let added = 0;

	const title = findTitle(root);
	const author = threadAuthor(root);
	if (title && author && !title.hasAttribute(PROCESSED)) {
		title.setAttribute(PROCESSED, 'title');
		if (author.toLowerCase() !== self) {
			title.append(tipButton(author, '⚡ Tip author', onclick));
			added++;
		}
	}

	for (const link of findAuthorLinks(root)) {
		link.setAttribute(PROCESSED, 'author');
		const login = loginFromLink(link);
		if (!login || login.toLowerCase() === self) continue;
		// Classic timeline links sit inside <strong>; put the button after that wrapper.
		const anchor = link.parentElement?.tagName === 'STRONG' ? link.parentElement : link;
		anchor.after(tipButton(login, '⚡ Tip', onclick));
		added++;
	}
	return added;
}
