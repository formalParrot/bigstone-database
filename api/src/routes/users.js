import { requireAuth } from '../utils/auth.js';

export async function handleUsers(request, env, corsHeaders) {
	const url = new URL(request.url);
	const path = url.pathname.replace(/\/$/, ''); // I have no idea how this works, i just found this

	if (request.method === 'GET' && path.endsWith('/me/export')) {
		const user = await requireAuth(request, env.JWT_SECRET);

		// ensure user.id is a primitive (string or number)
		const id = user.id;
		if (typeof id !== 'string' && typeof id !== 'number') {
			return new Response(JSON.stringify({ error: 'Invalid user id' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
			});
		}

		const userData = await env.DB.prepare('SELECT username, password_hash, cmpnt_creations, created_at FROM users WHERE id = ?')
			.bind(id)
			.first();

		const projects = await env.DB.prepare('SELECT * FROM projects WHERE owner_id = ?').bind(id).all();

		const components = await env.DB.prepare('SELECT * FROM components WHERE owner_id = ?').bind(id).all();

		const contributors = await env.DB.prepare('SELECT * FROM contributors WHERE user_id = ?').bind(id).all();

		const exportData = {
			user: userData,
			projects,
			components,
			contributors,
		};

		return new Response(JSON.stringify(exportData), {
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	}

	if (request.method === 'GET' && path.endsWith('/me')) {
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

	if (request.method === 'GET' && path.endsWith('/users')) {
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

	if (request.method === 'DELETE' && path === '/users/me') {
		const user = await requireAuth(request, env.JWT_SECRET); // verify JWT

		await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(user.id).run();
	}
}
