import {randomUUID} from 'node:crypto';
import logger from '../config/logger.js';

function correlationMiddleware(request, response, next) {
	const correlationId = request.headers['x-correlation-id'] || randomUUID();

	request.correlationId = correlationId;
	response.setHeader('x-correlation-id', correlationId);

	// Add correlation ID to logger context
	request.logger = logger.child({correlationId});

	next();
}

export default correlationMiddleware;
