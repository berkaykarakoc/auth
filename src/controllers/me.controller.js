import meService from '../services/me.service.js';
import logger from '../config/logger.js';

async function me(request, response, next) {
	try {
		const user = await meService.me(request.headers.authorization);
		return response.status(200).json(user);
	} catch (error) {
		logger.error('Me failed', error);
		next(error);
	}
}

const meController = {
	me,
};

export default meController;
