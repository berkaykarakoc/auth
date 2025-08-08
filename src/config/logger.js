import process from 'node:process';
import pino from 'pino';

const logger = pino({
	level: process.env.LOG_LEVEL || 'info',
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
			translateTime: 'SYS:standard',
			ignore: 'pid,hostname',
		},
	},
	base: {
		env: process.env.NODE_ENV,
		pid: process.pid,
	},
});

export default logger;
