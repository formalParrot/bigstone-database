// src/utils/auth.js

//this is vibe-coded, only this bit, as i have no current good understanding of JWT
export async function createToken(payload, secret) {
	const exp = Math.floor(Date.now() / 1000) + 60 * 60;
	const bodyPayload = { ...payload, exp };

	const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
	const body = btoa(JSON.stringify(bodyPayload));

	const signature = await crypto.subtle.sign(
		{ name: 'HMAC', hash: 'SHA-256' },
		await getKey(secret),
		new TextEncoder().encode(`${header}.${body}`),
	);

	const sig = btoa(String.fromCharCode(...new Uint8Array(signature)));

	return `${header}.${body}.${sig}`;
}

export async function verifyToken(token, secret) {
	const [header, body, sig] = token.split('.');

	const validSig = await crypto.subtle.sign(
		{ name: 'HMAC', hash: 'SHA-256' },
		await getKey(secret),
		new TextEncoder().encode(`${header}.${body}`),
	);

	const expected = btoa(String.fromCharCode(...new Uint8Array(validSig)));
	if (sig !== expected) throw new Error('Invalid token');

	const payload = JSON.parse(atob(body));

	// Check expiration
	const now = Math.floor(Date.now() / 1000);
	if (payload.exp && now > payload.exp) throw new Error('Token expired');

	return payload;
}

async function getKey(secret) {
	return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}

// middleware-style helper
export async function requireAuth(request, secret) {
	const auth = request.headers.get('Authorization');
	if (!auth) throw new Error('Unauthorized');

	const token = auth.split(' ')[1];
	return await verifyToken(token, secret);
}
