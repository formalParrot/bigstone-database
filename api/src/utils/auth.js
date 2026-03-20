import jwt from 'jsonwebtoken';

export function createToken(payload, secret) {
	return jwt.sign(payload, secret, {
		algorithm: 'HS256',
		expiresIn: '1h',
	});
}

export function verifyToken(token, secret) {
	return jwt.verify(token, secret, {
		algorithms: ['HS256'],
	});
}

export async function requireAuth(request, secret) {
	const auth = request.headers.get('Authorization');

	if (!auth || !auth.startsWith('Bearer ')) {
		throw new Error('No header');
	}

	const token = auth.slice(7);

	try {
		const decoded = jwt.verify(token, secret);
		/* console.log('DECODED:', decoded); */
		return decoded;
	} catch (err) {
		/* console.log('JWT ERROR:', err.message); */
		throw new Error('Unauthorized');
	}
}

/* export async function requireAuth(request, secret) {
	const auth = request.headers.get('Authorization');

	if (!auth || !auth.startsWith('Bearer ')) {
		throw new Error('Missing or invalid Authorization header');
	}

	const token = auth.slice(7);

	try {
		const decoded = verifyToken(token, secret);

		if (!decoded || !decoded.id) {
			throw new Error('Invalid token payload');
		}

		return decoded;
	} catch (err) {
		throw new Error('Unauthorized');
	}
} */
