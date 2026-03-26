// src/routes/auth.js

import { hashPassword, verifyPassword } from '../utils/hash.js';
import { createToken } from '../utils/auth.js';

export async function handleAuth(request, env, corsHeaders) {
	const url = new URL(request.url);
	const path = url.pathname;

	if (request.method === 'POST' && path === '/auth/register') {
		const { username, password, consent } = await request.json();

		if (!consent) {
			return res.status(400).json({ error: 'You must accept the privacy policy.' });
		}

		const hashed = await hashPassword(password);

		await env.DB.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').bind(username, hashed).run();

		return new Response('User created', { headers: corsHeaders });
	}

	if (request.method === 'POST' && path === '/auth/login') {
		const { username, password } = await request.json();

		const user = await env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();

		if (!user || !(await verifyPassword(password, user.password_hash))) {
			return new Response('Invalid credentials', { status: 401 });
		}

		const token = await createToken({ id: user.id }, env.JWT_SECRET);

		return new Response(JSON.stringify({ token }), {
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	}
}
