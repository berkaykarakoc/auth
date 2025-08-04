import ServerError from '../errors/server.error.js';
import jwtService from '../services/jwt.service.js';

// Import redisService from "../services/redis.service.js";

function refreshMiddleware(request, response, next) {
	if (request.headers?.cookie?.includes('refreshToken')) {
		const token = request.headers.cookie.split('refreshToken=')[1];
		try {
			const decoded = jwtService.verifyRefreshToken(token);
			if (
				decoded.type !== jwtService.TokenType.REFRESH_TOKEN
			) {
				return next(new ServerError(401, 'Invalid token type'));
			}

			// Const value = await redisService.get(token);
			// if (value) {
			//   return next(new ServerError(401, "Refresh token was already used"));
			// }
			request.email = decoded.sub;
			return next();
		} catch {
			return next(new ServerError(401, 'Invalid jwt token'));
		}
	}

	return next(new ServerError(400, 'Refresh token is not present'));
}

export default refreshMiddleware;
