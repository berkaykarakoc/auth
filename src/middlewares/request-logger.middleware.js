import logger from '../config/logger.js';

function requestLogger(request, response, next) {
	const start = Date.now();

	response.on('finish', () => {
		const duration = Date.now() - start;
		logger.info({
			correlationId: request.correlationId,
			method: request.method,
			url: request.url,
			status: response.statusCode,
			duration: `${duration}ms`,
			userAgent: request.get('User-Agent'),
		}, 'HTTP Request');
	});

	next();
}

export default requestLogger;
