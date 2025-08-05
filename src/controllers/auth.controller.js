import process from 'node:process';
import authService from '../services/auth.service.js';
import {convertToSeconds} from '../utils/duration.js';

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
			maxAge: convertToSeconds(process.env.REFRESH_TOKEN_EXPIRATION),
		});

		return response.status(200).json({accessToken});
	} catch (error) {
		next(error);
	}
}

async function logout(request, response, next) {
	try {
		await authService.logout(request.headers.authorization, request.headers.cookie);
		return response.status(200).json({message: 'Logged out successfully!'});
	} catch (error) {
		next(error);
	}
}

async function refreshToken(request, response, next) {
	try {
		const {accessToken} = await authService.refreshToken(request.headers.cookie);
		return response.status(200).json({accessToken});
	} catch (error) {
		next(error);
	}
}

async function verifyEmail(request, response, next) {
	try {
		await authService.verifyEmail(request.body);
		return response.status(200).json({message: 'Email verified successfully!'});
	} catch (error) {
		next(error);
	}
}

async function resendVerificationCode(request, response, next) {
	try {
		await authService.sendVerificationCode(request.body);
		return response.status(200).json({message: 'Verification code resent successfully!'});
	} catch (error) {
		next(error);
	}
}

async function passwordReset(request, response, next) {
	try {
		await authService.passwordReset(request.body);
		return response.status(200).json({message: 'Password reset code sent successfully!'});
	} catch (error) {
		next(error);
	}
}

async function verifyPasswordReset(request, response, next) {
	try {
		await authService.verifyPasswordReset(request.body);
		return response.status(200).json({message: 'Password reset successfully!'});
	} catch (error) {
		next(error);
	}
}

const authController = {
	register,
	login,
	logout,
	refreshToken,
	verifyEmail,
	resendVerificationCode,
	passwordReset,
	verifyPasswordReset,
};

export default authController;
