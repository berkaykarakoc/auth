import redisClient from '../connections/redis.js';
import {convertToSeconds} from '../utils/duration.js';

async function addTokenToExclude(token, expiration) {
	const client = redisClient.getClient();
	await client.set(token, 'true', 'EX', convertToSeconds(expiration));
}

async function isTokenInExclude(token) {
	const client = redisClient.getClient();
	const isInExclude = await client.get(token);
	return isInExclude === 'true';
}

async function setVerificationCode(email, code, expiration) {
	const client = redisClient.getClient();
	const key = `verification:${email}`;
	await client.set(key, code, 'EX', convertToSeconds(expiration));
}

async function getVerificationCode(email) {
	const client = redisClient.getClient();
	const key = `verification:${email}`;
	return client.get(key);
}

async function deleteVerificationCode(email) {
	const client = redisClient.getClient();
	const key = `verification:${email}`;
	await client.del(key);
}

const redisService = {
	addTokenToExclude,
	isTokenInExclude,
	setVerificationCode,
	getVerificationCode,
	deleteVerificationCode,
};

export default redisService;
