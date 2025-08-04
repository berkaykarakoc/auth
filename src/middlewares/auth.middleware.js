import process from 'node:process';
import ServerError from '../errors/server.error.js';
import jwtService from '../services/jwt.service.js';

async function authMiddleware(request, response, next) {
	if (request.headers.authorization) {
		const [bearerToken, token] = request.headers.authorization.split(' ');
		if (bearerToken === 'Bearer') {
			const decoded = await jwtService.verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
			try {
				if (
					decoded.type !== jwtService.TokenType.ACCESS_TOKEN
				) {
					return next(new ServerError(401, 'Invalid token type'));
				}

				request.email = decoded.sub;
				return next();
			} catch {
				return next(new ServerError(401, 'Invalid access token'));
			}
		}

		return next(new ServerError(401, 'Invalid bearer token'));
	}

	return next(new ServerError(400, 'Authorization header is not present'));
}

export default authMiddleware;
