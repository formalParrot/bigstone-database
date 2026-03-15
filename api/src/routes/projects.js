export async function handleProjects(request, env) {
	const url = new URL(request.url);
	const path = url.pathname.replace(/\/$/, ''); // I have no idea how this works, i just found this

	/* POST methods */
	if (request.method === 'POST' && path === '/projects') {
		const { name, desc } = await request.json();

		const result = await env.DB.prepare('INSERT INTO projects (name, desc) VALUES (?, ?)').bind(name, desc).run();

		console.log(JSON.stringify(result));

		return new Response(JSON.stringify(result.results), { headers: { 'Content-Type': 'application/json' } });
	}

	/* GET methods */
	if (request.method === 'GET' && path === '/projects') {
		const result = await env.DB.prepare('SELECT * FROM projects').all();

		return new Response(JSON.stringify(result.results), { headers: { 'Content-Type': 'application/json' } });
	}

	if (request.method === 'GET' && path.startsWith('/projects/')) {
		const id = url.pathname.split('/').pop();

		const result = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();

		return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
	}
}
