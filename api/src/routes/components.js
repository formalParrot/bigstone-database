import { requireAuth } from '../utils/auth.js';

export async function handleComponents(request, env, corsHeaders) {
	const url = new URL(request.url);
	const path = url.pathname.replace(/\/$/, '');

	// POST
	if (request.method === 'POST' && path === '/components') {
		let user;
		try {
			user = await requireAuth(request, env.JWT_SECRET);
		} /* 401 unauthorized */ catch {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
			});
		}

		let body;
		try {
			body = await request.json();
		} /* 400 invalid json */ catch {
			return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
			});
		}

		const { project_id, name, desc } = body;
		if (!project_id || !name) {
			return new Response(JSON.stringify({ error: 'Missing required fields' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
			});
		}

		try {
			// project ownership
			console.log(`project_id: ${project_id}, user_id: ${user.id}`);
			const project = await env.DB.prepare('SELECT id FROM projects WHERE id = ?').bind(project_id).first();

			console.log(project);

			if (!project) {
				return new Response(JSON.stringify({ error: 'Project not found or not yours' }), {
					status: 403,
					headers: { 'Content-Type': 'application/json', ...corsHeaders },
				});
			}

			// Insert new component
			const result = await env.DB.prepare('INSERT INTO components (project_id, name, "desc") VALUES (?, ?, ?)')
				.bind(project_id, name, desc || null)
				.run();

			return new Response(JSON.stringify({ id: result.meta.last_row_id }), {
				status: 201,
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
			});
		} catch (err) {
			return new Response(JSON.stringify({ error: 'Database error', detail: err.message }), {
				status: 500,
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
			});
		}
	}

	// unsupported routes
	return new Response('Not found', { status: 404, headers: corsHeaders });
}
