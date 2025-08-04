import ServerError from '../errors/server.error.js';
import userService from './user.service.js';

async function me({email}) {
	const user = await userService.getUserByEmail(email);
	if (!user) {
		throw new ServerError(404, 'User not found');
	}

	return {firstName: user.get('firstName'), lastName: user.get('lastName'), email: user.get('email')};
}

const meService = {
	me,
};

export default meService;
