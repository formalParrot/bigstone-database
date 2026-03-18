// src/utils/auth.js
import jwt from 'jsonwebtoken';

export function createToken(payload, secret) {
	// default 1 hour expiration
	return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: '1h' });
}

export function verifyToken(token, secret) {
	try {
		return jwt.verify(token, secret, { algorithms: ['HS256'] });
	} catch (err) {
		throw new Error(err.message);
	}
}

// middleware-style helper
export async function requireAuth(request, secret) {
	const auth = request.headers.get('Authorization');
	if (!auth) throw new Error('Unauthorized');

	const token = auth.split(' ')[1];
	return verifyToken(token, secret);
}
