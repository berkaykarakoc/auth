import crypto from 'node:crypto';

export function generateCode(length) {
	return crypto.randomInt(10 ** (length - 1), (10 ** length) - 1).toString();
}
