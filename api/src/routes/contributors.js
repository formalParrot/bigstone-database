import { requireAuth } from '../utils/auth.js';

export async function handleContributors(request, env, corsHeaders) {
	const url = new URL(request.url);
	const path = url.pathname.replace(/\/$/, ''); // I have no idea how this works, i just found this

	/* POST */
	if (request.method === 'POST') {
		let user;
		try {
			user = await requireAuth(request, env.JWT_SECRET);
		} catch {
			return new Response('Unauthorized', { status: 401, headers: corsHeaders });
		}

		const body = await request.json();
		const { project_id, username } = body;

		if (!project_id || !username) {
			return new Response('Missing project_id or username', { status: 400, headers: corsHeaders });
		}

		// Check if the authenticated user is the owner of the project
		const project = await env.DB.prepare('SELECT owner_id FROM projects WHERE id = ?').bind(project_id).first();

		if (!project) {
			return new Response('Project not found', { status: 404, headers: corsHeaders });
		}

		if (project.owner_id !== user.id) {
			return new Response('Forbidden: Only project owner can add contributors', { status: 403, headers: corsHeaders });
		}

		// Add contributor safely
		const query = `
        INSERT INTO contributors (project_id, user_id)
        SELECT ?, u.id
        FROM users u
        WHERE u.username = ?
          AND NOT EXISTS (
              SELECT 1 FROM contributors c
              WHERE c.project_id = ? AND c.user_id = u.id
          )
    `;

		try {
			const result = await env.DB.prepare(query).bind(project_id, username, project_id).run();

			if (result.changes === 0) {
				return new Response('Contributor already exists or user not found', { status: 409, headers: corsHeaders });
			}

			return new Response(JSON.stringify({ success: true, message: 'Contributor added' }), { status: 200, headers: corsHeaders });
		} catch (err) {
			return new Response(`Database error: ${err.message}`, { status: 500, headers: corsHeaders });
		}
	}

	/* GET */
	if (request.method === 'GET' && path === '/contributors') {
		const result = await env.DB.prepare('SELECT * FROM contributors').all();

		return new Response(JSON.stringify(result.results), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
	}

	if (request.method === 'GET' && path.startsWith('/contributors/')) {
		const id = path.split('/').pop();

		const result = await env.DB.prepare('SELECT * FROM contributors WHERE user_id = ?').bind(id).all();

		return new Response(JSON.stringify(result.results), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
	}

	// DELETE /contributors/<project_id>/<user_id>
	if (request.method === 'DELETE' && path.startsWith('/contributors/')) {
		const user = await requireAuth(request, env.JWT_SECRET);

		const parts = path.split('/');
		const project_id = parts[2];
		const contributor_user_id = parts[3];

		// ownershpi check
		const project = await env.DB.prepare('SELECT owner_id FROM projects WHERE id = ?').bind(project_id).first();

		if (project.owner_id === user.id) {
			// removing contributor
			await env.DB.prepare('DELETE FROM contributors WHERE project_id = ? AND user_id = ?').bind(project_id, contributor_user_id).run();
		}

		return new Response('Done', { headers: corsHeaders });
	}
}
