import { beforeEach, describe, expect, it, vi } from 'vitest';
import { findAuthorLinks, parseThread, threadAuthor, viewerLogin } from './github';
import { injectButtons } from './inject';

// Trimmed copies of github.com's markup (October 2026): the classic pull request timeline and
// the React issue view. Update these with the selectors in github.ts when GitHub changes.
const PULL_REQUEST = `
	<meta name="user-login" content="maintainer">
	<div class="prc-PageHeader-TitleArea-2n2J0"><h1 class="prc-Heading-Heading-MtWFE">feat: add parser</h1></div>
	<div class="fgColor-muted summaryContainer__6Iz">
		<a class="text-bold prc-Link-Link-9ZwDx" data-hovercard-type="user" href="/maintainer">maintainer</a> merged 4 commits
	</div>
	<div class="timeline-comment-header"><h3 class="f5"><strong><a class="author Link--primary" data-hovercard-type="user" href="/contributor">contributor</a></strong> commented</h3></div>
	<div class="TimelineItem-body"><a class="author Link--primary" href="/reviewer">reviewer</a> reviewed</div>
	<div class="TimelineItem-body"><a class="author Link--primary" href="/apps/changeset-bot">changeset-bot</a> commented</div>
	<div class="TimelineItem-body"><a class="author Link--primary" href="/maintainer">maintainer</a> commented</div>
`;

const ISSUE = `
	<meta name="user-login" content="maintainer">
	<h1 data-testid="issue-title">Crash on start</h1>
	<div class="titleSection"><a data-testid="issue-body-header-author" data-hovercard-type="user" href="https://github.com/reporter">reporter</a></div>
	<div data-testid="comment-header-left-side-items">
		<a data-testid="avatar-link" href="/helper"><img alt="" src="a.png"></a>
		<div><a data-testid="avatar-link" data-hovercard-type="user" href="/helper">helper</a></div>
	</div>
`;

describe('parseThread', () => {
	it.each([
		[
			'/sveltejs/svelte/pull/16000',
			{ repo: 'sveltejs/svelte', number: 16000, isPullRequest: true }
		],
		['/o/r.js/pull/7/files', { repo: 'o/r.js', number: 7, isPullRequest: true }],
		['/o/r/issues/42', { repo: 'o/r', number: 42, isPullRequest: false }]
	])('%s', (path, thread) => expect(parseThread(path)).toEqual(thread));

	it.each(['/o/r', '/o/r/pulls', '/o/r/issues/new', '/settings/profile'])('ignores %s', (path) =>
		expect(parseThread(path)).toBeNull()
	);
});

describe('on a pull request', () => {
	beforeEach(() => (document.body.innerHTML = PULL_REQUEST));

	it('finds the PR author from the opening post, not the merger', () => {
		expect(threadAuthor(document)).toBe('contributor');
		expect(viewerLogin(document)).toBe('maintainer');
	});

	it('adds one button per person, skipping apps and the viewer, and never twice', () => {
		const open = vi.fn();
		expect(injectButtons(document, 'maintainer', open)).toBe(3); // title + contributor + reviewer
		expect(injectButtons(document, 'maintainer', open)).toBe(0);

		const labels = [...document.querySelectorAll('button')].map((b) =>
			b.getAttribute('aria-label')
		);
		expect(labels).toEqual([
			'Tip @contributor with MergeTip',
			'Tip @contributor with MergeTip',
			'Tip @reviewer with MergeTip'
		]);
		expect(document.querySelector('h1 button')?.textContent).toBe('⚡ Tip author');
	});

	it('opens the tip panel for the clicked person', () => {
		const open = vi.fn();
		injectButtons(document, 'maintainer', open);
		document
			.querySelector<HTMLButtonElement>('[aria-label="Tip @reviewer with MergeTip"]')
			?.click();
		expect(open).toHaveBeenCalledWith('reviewer');
	});

	it('picks up comments that appear later', () => {
		const open = vi.fn();
		injectButtons(document, 'maintainer', open);
		document.body.insertAdjacentHTML(
			'beforeend',
			'<div class="TimelineItem-body"><a class="author" href="/latecomer">latecomer</a></div>'
		);
		expect(injectButtons(document, 'maintainer', open)).toBe(1);
	});
});

describe('on an issue', () => {
	beforeEach(() => (document.body.innerHTML = ISSUE));

	it('finds the issue author and commenters, ignoring avatar-only links', () => {
		expect(threadAuthor(document)).toBe('reporter');
		expect(findAuthorLinks(document).map((a) => a.textContent)).toEqual(['reporter', 'helper']);
	});

	it('adds buttons for the author, the title and each commenter', () => {
		expect(injectButtons(document, 'maintainer', vi.fn())).toBe(3);
	});
});

describe('when GitHub changes its markup', () => {
	it('adds nothing rather than breaking the page', () => {
		document.body.innerHTML = '<main><h2>Something new</h2><a href="/someone">someone</a></main>';
		expect(injectButtons(document, null, vi.fn())).toBe(0);
		expect(document.querySelectorAll('button')).toHaveLength(0);
	});
});
