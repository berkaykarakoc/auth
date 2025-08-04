import ms from 'ms';
import redisClient from '../config/redis.js';

async function addTokenToExclude(token, expiration) {
	const client = redisClient.getClient();
	await client.set(token, 'true', 'EX', ms(expiration));
}

async function isTokenInExclude(token) {
	const client = redisClient.getClient();
	const isInExclude = await client.get(token);
	return isInExclude === 'true';
}

const redisService = {
	addTokenToBlacklist: addTokenToExclude,
	isTokenInBlacklist: isTokenInExclude,
};

export default redisService;
