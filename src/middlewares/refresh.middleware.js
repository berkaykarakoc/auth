import process from 'node:process';
import ServerError from '../errors/server.error.js';
import jwtService from '../services/jwt.service.js';
import {TokenType} from '../models/enum.js';

const PUBLIC_KEY = process.env.PUBLIC_KEY.replace(/\\n/g, '\n');

async function refreshMiddleware(request, response, next) {
	if (request.headers?.cookie?.includes('refreshToken')) {
		const token = request.headers.cookie.split('refreshToken=')[1];
		const decoded = await jwtService.verifyToken(token, PUBLIC_KEY);
		try {
			if (
				decoded.type !== TokenType.REFRESH_TOKEN
			) {
				return next(new ServerError(401, 'Invalid token type'));
			}

			request.email = decoded.sub;
			return next();
		} catch {
			return next(new ServerError(401, 'Invalid jwt token'));
		}
	}

	return next(new ServerError(400, 'Refresh token is not present'));
}

export default refreshMiddleware;
