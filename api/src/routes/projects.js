export async function handleProjects(request, env) {
	return 'its currently down bru';

	const url = new URL(request.url);

	if (request.method === 'POST' && url.pathname === '/projects') {
		const { name, desc } = await request.json();

		if (name.length > 50 || desc.length > 200) {
			return new Response('Text too long!', { status: 400 });
		}
		if (!name.trim() || !desc.trim()) {
			return new Response('Fields cannot be empty', { status: 400 });
		}

		const result = await env.DB.prepare('INSERT INTO projects (name, desc) VALUES (?, ?)').bind(name, desc).run();

		console.log(JSON.stringify(result));

		return new Response(
			JSON.stringify({
				id: result.meta.last_row_id,
			}),
			{
				headers: { 'Content-Type': 'application/json' },
			},
		);
	}

	if (request.method === 'GET' && url.pathname === '/projects') {
		const { results } = await env.DB.prepare('SELECT * FROM projects').all();

		return Response.json(results);
	}

	if (request.method === 'GET' && url.pathname.startsWith('/projects/')) {
		const id = url.pathname.split('/').pop(); // gets the last part of the URL as the ID

		// Use a parameterized query to avoid SQL injection
		const projectResult = await env.DB.prepare(
			`
        SELECT * FROM projects WHERE id = ?
    `,
		)
			.bind(id)
			.all();

		if (projectResult.results.length === 0) {
			return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404 });
		}

		const project = projectResult.results[0];
		return new Response(JSON.stringify(project), {
			headers: { 'Content-Type': 'application/json' },
		});
	}

	if (request.method === 'DELETE' && url.pathname.startsWith('/projects/')) {
		const id = url.pathname.split('/').pop();
		if (!id || isNaN(id)) {
			return new Response(JSON.stringify({ error: 'Invalid ID' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		await env.DB.prepare(`DELETE FROM projects WHERE id = ?`).bind(id).run();

		return new Response(JSON.stringify({ success: true, deleted: id }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	return new Response('Not found', { status: 404 });
}
