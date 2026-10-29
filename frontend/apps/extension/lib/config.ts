// Build-time settings (WXT_* variables, see wxt.config.ts).
const origin = (value: string | undefined, fallback: string) => new URL(value || fallback).origin;

export const API_URL = origin(import.meta.env.WXT_API_URL, 'http://localhost:8080');
export const WEB_URL = origin(import.meta.env.WXT_WEB_URL, 'http://localhost:5173');

/** A match pattern for a web-app path. Match patterns cannot name a port, so it is dropped. */
export function webMatch(path: string): string {
	const { protocol, hostname } = new URL(WEB_URL);
	return `${protocol}//${hostname}${path}*`;
}
