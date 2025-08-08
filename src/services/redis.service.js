import redisClient from '../config/redis.js';
import {convertToSeconds} from '../utils/duration.js';

async function addTokenToExclude(token, expiration) {
	const client = redisClient.getClient();
	await client.set(token, 'true', 'EX', expiration);
}

async function isTokenInExclude(token) {
	const client = redisClient.getClient();
	const isInExclude = await client.get(token);
	return isInExclude === 'true';
}

async function setToken(userId, token, tokenType, expiration) {
	const client = redisClient.getClient();
	await client.set(`token:${userId}:${tokenType}`, token, 'EX', convertToSeconds(expiration));
}

async function getToken(userId, tokenType) {
	const client = redisClient.getClient();
	return client.get(`token:${userId}:${tokenType}`);
}

async function deleteToken(userId, tokenType) {
	const client = redisClient.getClient();
	await client.del(`token:${userId}:${tokenType}`);
}

async function getTokenExpiration(userId, tokenType) {
	const client = redisClient.getClient();
	return client.ttl(`token:${userId}:${tokenType}`);
}

const redisService = {
	addTokenToExclude,
	isTokenInExclude,
	setToken,
	getToken,
	deleteToken,
	getTokenExpiration,
};

export default redisService;
