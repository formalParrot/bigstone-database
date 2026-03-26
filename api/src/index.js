import { handleProjects } from './routes/projects.js';
import { handleAuth } from './routes/auth.js';
import { handleUsers } from './routes/users.js';
import { handleComponents } from './routes/components.js';
import { handleContributors } from './routes/contributors.js';

export default {
	async fetch(request, env) {
		const allowedOrigins = [
			'https://formalparrot.github.io',
			'http://localhost:8787', // change up to your needs
			'http://127.0.0.1:8787',
		];

		const origin = request.headers.get('Origin');

		const corsHeaders = {
			'Access-Control-Allow-Origin': origin,
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		};

		// handle preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		if (origin && !allowedOrigins.includes(origin)) {
			return new Response('Forbidden', { status: 403 });
		}
		const url = new URL(request.url);

		if (url.pathname.startsWith('/projects')) {
			return handleProjects(request, env, corsHeaders);
		}

		if (url.pathname.startsWith(`/auth`)) {
			return handleAuth(request, env, corsHeaders);
		}

		if (url.pathname.startsWith(`/users`)) {
			return handleUsers(request, env, corsHeaders);
		}

		if (url.pathname.startsWith(`/components`)) {
			return handleComponents(request, env, corsHeaders);
		}

		if (url.pathname.startsWith('/contributors')) {
			return handleContributors(request, env, corsHeaders);
		}

		return new Response('Not found', { status: 404 });
	},
};
