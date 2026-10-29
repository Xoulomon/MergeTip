// One origin for a tunnel: /v1/* and /healthz go to the API, everything else to the web app.
// The session cookie is SameSite=Lax, so the web app and the API must share a site.
//
//   node tools/tunnel-proxy.mjs   # listens on 127.0.0.1:8000
//   ngrok http 8000           # then point .env's PUBLIC_BASE_URL / API_PUBLIC_URL / PUBLIC_API_URL at it
import http from 'node:http';

const PORT = Number(process.env.PORT ?? 8000);
const API = { host: '127.0.0.1', port: 8080 };
const WEB = { host: '127.0.0.1', port: 5173 };

const toApi = (url) => url.startsWith('/v1/') || url === '/v1' || url.startsWith('/healthz');

http
	.createServer((req, res) => {
		const target = toApi(req.url ?? '/') ? API : WEB;
		const headers = {
			...req.headers,
			// Vite's preview server refuses unknown Host headers; the app reads its public origin
			// from .env, not from Host.
			host: `localhost:${target.port}`,
			'x-forwarded-host': req.headers.host ?? '',
			'x-forwarded-proto': 'https'
		};
		const upstream = http.request(
			{ ...target, path: req.url, method: req.method, headers },
			(answer) => {
				res.writeHead(answer.statusCode ?? 502, answer.headers);
				answer.pipe(res);
			}
		);
		upstream.on('error', (error) => {
			res.writeHead(502, { 'content-type': 'text/plain' });
			res.end(`upstream ${target.port} unavailable: ${error.message}`);
		});
		req.pipe(upstream);
	})
	.listen(PORT, '127.0.0.1', () => console.log(`proxy on http://127.0.0.1:${PORT}`));
