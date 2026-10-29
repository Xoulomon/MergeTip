// Usage: cd tools && npm install && npm run nwc-probe
//
// Sends one harmless NIP-47 `get_info` request per encryption (NIP-44, then NIP-04) and reports
// which one the wallet answers. Reads the connection string from a hidden prompt; prints no
// secret and no wallet data beyond the methods it lists.
import { setDefaultResultOrder } from 'node:dns';
import { createInterface } from 'node:readline';
import { Writable } from 'node:stream';
import { finalizeEvent, getPublicKey } from 'nostr-tools/pure';
import * as nip04 from 'nostr-tools/nip04';
import * as nip44 from 'nostr-tools/nip44';

// Some networks hand out IPv6 (NAT64) addresses that don't route; Node's WebSocket doesn't fall
// back to IPv4 on its own.
setDefaultResultOrder('ipv4first');

function askHidden(question) {
	const muted = new Writable({ write: (_c, _e, cb) => cb() });
	const rl = createInterface({ input: process.stdin, output: muted, terminal: true });
	process.stdout.write(question);
	return new Promise((resolve) => rl.question('', (answer) => (rl.close(), process.stdout.write('\n'), resolve(answer.trim()))));
}

const uri = await askHidden('Paste the NWC connection string (hidden): ');
const parsed = new URL(uri.replace('nostr+walletconnect://', 'https://'));
const wallet = parsed.hostname;
const relay = parsed.searchParams.get('relay');
const secret = parsed.searchParams.get('secret');
if (!/^[0-9a-f]{64}$/.test(wallet) || !relay || !/^[0-9a-f]{64}$/.test(secret ?? '')) {
	console.log('That is not a valid nostr+walletconnect:// string.');
	process.exit(1);
}
const sk = Uint8Array.from(Buffer.from(secret, 'hex'));
const app = getPublicKey(sk);
console.log(`relay ${relay}`);

async function probe(cipher, tries = 3) {
	const result = await probeOnce(cipher);
	return result === 'relay connection failed' && tries > 1 ? probe(cipher, tries - 1) : result;
}

async function probeOnce(cipher) {
	const body = JSON.stringify({ method: 'get_info', params: {} });
	const content =
		cipher === 'nip44_v2'
			? nip44.encrypt(body, nip44.getConversationKey(sk, wallet))
			: nip04.encrypt(sk, wallet, body);
	const event = finalizeEvent(
		{ kind: 23194, created_at: Math.floor(Date.now() / 1000), content, tags: [['p', wallet], ['encryption', cipher]] },
		sk
	);
	return new Promise((resolve) => {
		const ws = new WebSocket(relay);
		const finish = (result) => (ws.close(), resolve(result));
		const timer = setTimeout(() => finish('no answer in 20 s'), 20_000);
		ws.onopen = () => {
			ws.send(JSON.stringify(['REQ', 'r', { kinds: [23195], authors: [wallet], '#e': [event.id] }]));
			ws.send(JSON.stringify(['EVENT', event]));
		};
		ws.onmessage = (m) => {
			const msg = JSON.parse(m.data);
			if (msg[0] === 'OK' && msg[2] === false) (clearTimeout(timer), finish(`relay rejected: ${msg[3]}`));
			if (msg[0] !== 'EVENT') return;
			clearTimeout(timer);
			try {
				const text = msg[2].content.includes('?iv=')
					? nip04.decrypt(sk, wallet, msg[2].content)
					: nip44.decrypt(msg[2].content, nip44.getConversationKey(sk, wallet));
				const reply = JSON.parse(text);
				finish(reply.error ? `error ${reply.error.code}: ${reply.error.message}` : `answered; methods: ${(reply.result?.methods ?? []).join(' ')}`);
			} catch (error) {
				finish(`answered, but could not decrypt (${error.message})`);
			}
		};
		ws.onerror = () => (clearTimeout(timer), finish('relay connection failed'));
	});
}

console.log(`app key ${app.slice(0, 8)}…`);
for (const cipher of ['nip44_v2', 'nip04']) console.log(`${cipher}: ${await probe(cipher)}`);
process.exit(0);
