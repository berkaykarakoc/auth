import process from 'node:process';
import ServerError from '../errors/server.error.js';
import jwtService from '../services/jwt.service.js';
import {TokenType} from '../models/enum.js';

const PUBLIC_KEY = process.env.PUBLIC_KEY.replace(/\\n/g, '\n');

async function authMiddleware(request, response, next) {
	if (request.headers.authorization) {
		const [bearerToken, token] = request.headers.authorization.split(' ');
		if (bearerToken === 'Bearer') {
			const decoded = await jwtService.verifyToken(token, PUBLIC_KEY);
			try {
				if (
					decoded.type !== TokenType.ACCESS_TOKEN
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
