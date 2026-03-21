import { requireAuth } from '../utils/auth.js';

export async function handleProjects(request, env, corsHeaders) {
	const url = new URL(request.url);
	const path = url.pathname.replace(/\/$/, ''); // I have no idea how this works, i just found this

	/* POST methods */
	if (request.method === 'POST' && path === '/projects') {
		const user = await requireAuth(request, env.JWT_SECRET);

		const { name, desc } = await request.json();

		const result = await env.DB.prepare('INSERT INTO projects (name, desc, owner_id) VALUES (?, ?, ?)').bind(name, desc, user.id).run();

		console.log(JSON.stringify(result));

		return new Response(JSON.stringify({ id: result.meta.last_row_id }), {
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	}

	/* GET methods */
	if (request.method === 'GET' && path === '/projects') {
		const result = await env.DB.prepare('SELECT * FROM projects').all();

		return new Response(JSON.stringify(result.results), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
	}

	if (request.method === 'GET' && path.startsWith('/projects/')) {
		const parts = path.split('/').filter(Boolean);
		// projects/<ID> or projects/<ID>/components

		const id = parts[1];

		// /projects/<ID>
		if (parts.length === 2) {
			const project = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();

			return new Response(JSON.stringify(project), {
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
			});
		}

		// /projects/<ID>/components
		if (parts.length === 3 && parts[2] === 'components') {
			const components = await env.DB.prepare('SELECT * FROM components WHERE project_id = ?').bind(id).all();

			return new Response(JSON.stringify(components.results), {
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
			});
		}
	}

	/* DELETE methods */
	if (request.method === 'DELETE') {
		const user = await requireAuth(request, env.JWT_SECRET);

		const id = path.split('/').pop();
		await env.DB.prepare('DELETE FROM projects WHERE id = ? AND owner_id = ?').bind(id, user.id).run();

		return new Response(
			JSON.stringify({ success: true, string: 'Deleted successfuly. i do not know which id was deleted, so just pls remember :D' }),
			{
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
			},
		);
	}
}
