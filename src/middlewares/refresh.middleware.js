import ServerError from '../errors/server.error.js';
import tokenService from '../services/token.service.js';
import {TokenType} from '../models/token-type.js';

async function refreshMiddleware(request, response, next) {
	if (!request.headers?.cookie) {
		return next(new ServerError(401, 'Refresh token is not present'));
	}

	const refreshTokenMatch = request.headers.cookie.match(/refreshToken=([^;]+)/);
	if (!refreshTokenMatch) {
		return next(new ServerError(401, 'Invalid refresh token format'));
	}

	const token = refreshTokenMatch[1];

	try {
		const decoded = await tokenService.verifyJwtToken(token);

		if (decoded.type !== TokenType.REFRESH_TOKEN) {
			return next(new ServerError(401, 'Invalid token type'));
		}

		request.email = decoded.sub;
		return next();
	} catch {
		return next(new ServerError(401, 'Invalid refresh token'));
	}
}

export default refreshMiddleware;
