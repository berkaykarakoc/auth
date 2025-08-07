import process from 'node:process';
import authService from '../services/auth.service.js';
import {convertToSeconds} from '../utils/duration.js';
import {
	registerSchema,
	loginSchema,
	verifyEmailSchema,
	resetPasswordSchema,
	emailSchema,
} from '../validation/auth.validation.js';

async function register(request, response, next) {
	try {
		const {error} = registerSchema.validate(request.body);
		if (error) {
			return response.status(400).json({message: error.message});
		}

		const {email, role, password} = request.body;
		await authService.register(email, role, password);

		return response.status(201).json({
			message: 'Registration successful. Email verification link has been sent to your email address.',
		});
	} catch (error) {
		next(error);
	}
}

async function resendEmailVerificationToken(request, response, next) {
	try {
		const {error} = emailSchema.validate(request.body.email);
		if (error) {
			return response.status(400).json({message: error.message});
		}

		await authService.resendEmailVerificationToken(request.body.email);
		return response.status(200).json({
			message: 'Email verification link has been sent to your email address.',
		});
	} catch (error) {
		next(error);
	}
}

async function verifyEmail(request, response, next) {
	try {
		const {error} = verifyEmailSchema.validate(request.body);
		if (error) {
			return response.status(400).json({message: error.message});
		}

		const {email, token} = request.body;
		const {accessToken, refreshToken} = await authService.verifyEmail(email, token);
		response.cookie('token', refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: convertToSeconds(process.env.REFRESH_TOKEN_EXPIRATION),
		});

		return response.status(200).json({
			message: 'Email verified successfully.',
			accessToken,
		});
	} catch (error) {
		next(error);
	}
}

async function login(request, response, next) {
	try {
		const {error} = loginSchema.validate(request.body);
		if (error) {
			return response.status(400).json({message: error.message});
		}

		const {email, password} = request.body;
		const {accessToken, refreshToken} = await authService.login(email, password);
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

async function refreshToken(request, response, next) {
	try {
		const {accessToken, refreshToken} = await authService.refreshToken(request.headers.cookie);
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

async function forgotPassword(request, response, next) {
	try {
		const {error} = emailSchema.validate(request.body.email);
		if (error) {
			return response.status(400).json({message: error.message});
		}

		await authService.forgotPassword(request.body.email);
		return response.status(200).json({
			message: 'Password reset link has been sent to your email address.',
		});
	} catch (error) {
		next(error);
	}
}

async function resetPassword(request, response, next) {
	try {
		const {error} = resetPasswordSchema.validate(request.body);
		if (error) {
			return response.status(400).json({message: error.message});
		}

		const {email, password, token} = request.body;
		await authService.resetPassword(email, password, token);
		return response.status(200).json({
			message: 'Password reset successfully.',
		});
	} catch (error) {
		next(error);
	}
}

async function logout(request, response, next) {
	try {
		await authService.logout(request.headers.authorization, request.headers.cookie);
		return response.status(204).json({
			message: 'You have been successfully logged out.',
		});
	} catch (error) {
		next(error);
	}
}

const authController = {
	register,
	resendEmailVerificationToken,
	verifyEmail,
	login,
	refreshToken,
	forgotPassword,
	resetPassword,
	logout,
};

export default authController;
