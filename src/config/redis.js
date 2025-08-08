// RedisClient.js
import process from 'node:process';
import Redis from 'ioredis';
import logger from './logger.js';

class RedisClient {
	constructor() {
		if (!RedisClient.instance) {
			this.client = new Redis({
				host: process.env.REDIS_HOST,
				port: process.env.REDIS_PORT,
				username: process.env.REDIS_USER,
				password: process.env.REDIS_PASSWORD,
			});

			this.client.on('connect', () => {
				logger.info('Connected to Redis');
			});

			this.client.on('error', error => {
				logger.error('Redis error', error);
			});

			RedisClient.instance = this;
		}
	}

	getClient() {
		return this.client;
	}
}

const instance = new RedisClient();
Object.freeze(instance);

export default instance;
