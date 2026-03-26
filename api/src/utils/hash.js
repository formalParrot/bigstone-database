// src/utils/hash.js
import { hash, compare } from 'bcryptjs';

export async function hashPassword(password) {
	return await hash(password, 10);
}

export async function verifyPassword(password, hashValue) {
	return await compare(password, hashValue);
}
