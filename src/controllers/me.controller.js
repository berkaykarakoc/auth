import meService from '../services/me.service.js';

async function me(request, response, next) {
	try {
		const user = await meService.me({email: request.email});
		return response.status(200).json(user);
	} catch (error) {
		next(error);
	}
}

const meController = {
	me,
};

export default meController;
