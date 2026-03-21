import { requireAuth } from '../utils/auth.js';

export async function handleUsers(request, env, corsHeaders) {
	const url = new URL(request.url);
	const path = url.pathname.replace(/\/$/, ''); // I have no idea how this works, i just found this

	if (request.method === 'GET' && path === '/users/me') {
		const user = await requireAuth(request, env.JWT_SECRET);

		const result = await env.DB.prepare('SELECT id, username, created_at, cmpnt_creations FROM users WHERE id = ?').bind(user.id).first();

		if (!result) {
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
			});
		}

		return new Response(JSON.stringify(result), {
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	}

	if (request.method === 'GET' && path.startsWith('/users/') && path !== '/users/me') {
		const id = path.split('/').pop();

		const result = await env.DB.prepare('SELECT id, username, created_at, cmpnt_creations FROM users WHERE id = ?').bind(id).first();

		if (!result) {
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
			});
		}

		return new Response(JSON.stringify(result), {
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	}
}
