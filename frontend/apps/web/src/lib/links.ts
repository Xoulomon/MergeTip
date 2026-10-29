import { PUBLIC_GITHUB_APP_SLUG } from '$app/env/public';

export const INSTALL_APP_URL = `https://github.com/apps/${encodeURIComponent(PUBLIC_GITHUB_APP_SLUG)}/installations/new`;
export const REPO_URL = 'https://github.com/Xoulomon/MergeTip';

const EXTENSION_TAG = 'extension-v0.1.0';
export const EXTENSION_RELEASE_URL = `${REPO_URL}/releases/tag/${EXTENSION_TAG}`;
export const EXTENSION_DOWNLOADS = {
	chrome: `${REPO_URL}/releases/download/${EXTENSION_TAG}/mergetip-extension-0.1.0-chrome.zip`,
	firefox: `${REPO_URL}/releases/download/${EXTENSION_TAG}/mergetip-extension-0.1.0-firefox.zip`
};
