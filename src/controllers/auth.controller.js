import process from 'node:process';
import ms from 'ms';
import authService from '../services/auth.service.js';

async function register(request, response, next) {
	try {
		const {firstName, lastName, email} = await authService.register(request.body);
		return response.status(201).json({
			firstName, lastName, email, message: 'User registered successfully!',
		});
	} catch (error) {
		next(error);
	}
}

async function login(request, response, next) {
	try {
		const {accessToken, refreshToken} = await authService.login(request.body);
		response.cookie('token', refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: ms(process.env.REFRESH_TOKEN_EXPIRATION),
		});

		return response.status(200).json({accessToken});
	} catch (error) {
		next(error);
	}
}

function refreshToken(request, response, next) {
	try {
		const {accessToken} = authService.refreshToken(request.headers.cookie);
		return response.status(200).json({accessToken});
	} catch (error) {
		next(error);
	}
}

const authController = {
	register,
	login,
	refreshToken,
};

export default authController;
