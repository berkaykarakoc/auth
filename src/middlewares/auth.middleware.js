import ServerError from '../errors/server.error.js';
import tokenService from '../services/token.service.js';
import {TokenType} from '../models/token-type.js';

async function authMiddleware(request, response, next) {
	if (!request.headers.authorization || !request.headers.authorization.startsWith('Bearer ')) {
		return next(new ServerError(400, 'Invalid authorization header'));
	}

	const token = request.headers.authorization.split(' ')[1];

	try {
		const decoded = await tokenService.verifyJwtToken(token);

		if (decoded.type !== TokenType.ACCESS_TOKEN) {
			return next(new ServerError(401, 'Invalid token type'));
		}

		request.email = decoded.sub;
		return next();
	} catch {
		return next(new ServerError(401, 'Invalid access token'));
	}
}

export default authMiddleware;
