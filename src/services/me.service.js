import ServerError from '../errors/server.error.js';
import userService from './user.service.js';
import tokenService from './token.service.js';

async function me(headers) {
	const decoded = tokenService.decodeJwtToken(headers.split(' ')[1]);
	const userId = decoded.sub;
	const user = await userService.getUserById(userId);
	if (!user) {
		throw new ServerError(401, 'Unauthorized');
	}

	return {email: user.get('email')};
}

const meService = {
	me,
};

export default meService;
