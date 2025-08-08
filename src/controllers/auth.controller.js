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
			request.logger.error({
				error: error.message,
				trace: error.stack,
				action: 'register',
			}, 'Registration failed');
			return response.status(400).json({message: error.message});
		}

		const {email, role, password} = request.body;
		await authService.register(email, role, password);
		request.logger.debug({
			action: 'register',
			role,
		}, 'Registration successful');

		return response.status(201).json({
			message: 'Registration successful. Email verification link has been sent to your email address',
		});
	} catch (error) {
		request.logger.error({
			error: error.message,
			trace: error.stack,
			action: 'register',
		}, 'Registration failed');
		next(error);
	}
}

async function verifyEmail(request, response, next) {
	try {
		const {error} = verifyEmailSchema.validate(request.body);
		if (error) {
			request.logger.error({
				error: error.message,
				trace: error.stack,
				action: 'verify-email',
			}, 'Email verification failed');
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
		request.logger.debug({
			action: 'verify-email',
		}, 'Email verification successful');

		return response.status(200).json({
			message: 'Email verified successfully',
			accessToken,
		});
	} catch (error) {
		request.logger.error({
			error: error.message,
			trace: error.stack,
			action: 'verify-email',
		}, 'Email verification failed');
		next(error);
	}
}

async function resendEmailVerificationToken(request, response, next) {
	try {
		const {error} = emailSchema.validate(request.body.email);
		if (error) {
			request.logger.error({
				error: error.message,
				trace: error.stack,
				action: 'resend-email-verification-token',
			}, 'Email verification token resend failed');
			return response.status(400).json({message: error.message});
		}

		await authService.resendEmailVerificationToken(request.body.email);
		request.logger.debug({
			action: 'resend-email-verification-token',
		}, 'Email verification token resend successful');

		return response.status(200).json({
			message: 'Email verification link has been sent to your email address',
		});
	} catch (error) {
		request.logger.error({
			error: error.message,
			trace: error.stack,
			action: 'resend-email-verification-token',
		}, 'Email verification token resend failed');
		next(error);
	}
}

async function login(request, response, next) {
	try {
		const {error} = loginSchema.validate(request.body);
		if (error) {
			request.logger.error({
				error: error.message,
				trace: error.stack,
				action: 'login',
			}, 'Login failed');
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
		request.logger.debug({
			action: 'login',
		}, 'Login successful');

		return response.status(200).json({accessToken});
	} catch (error) {
		request.logger.error({
			error: error.message,
			trace: error.stack,
			action: 'login',
		}, 'Login failed');
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
		request.logger.debug({
			action: 'refresh-token',
		}, 'Refresh token successful');

		return response.status(200).json({accessToken});
	} catch (error) {
		request.logger.error({
			error: error.message,
			trace: error.stack,
			action: 'refresh-token',
		}, 'Refresh token failed');
		next(error);
	}
}

async function forgotPassword(request, response, next) {
	try {
		const {email} = request.body;
		const {error} = emailSchema.validate(email);
		if (error) {
			request.logger.error({
				error: error.message,
				trace: error.stack,
				action: 'forgot-password',
			}, 'Forgot password failed');
			return response.status(400).json({message: error.message});
		}

		await authService.forgotPassword(email);
		request.logger.debug({
			action: 'forgot-password',
		}, 'Forgot password successful');

		return response.status(200).json({
			message: 'Password reset link has been sent to your email address',
		});
	} catch (error) {
		request.logger.error({
			error: error.message,
			trace: error.stack,
			action: 'forgot-password',
		}, 'Forgot password failed');
		next(error);
	}
}

async function resetPassword(request, response, next) {
	try {
		const {error} = resetPasswordSchema.validate(request.body);
		if (error) {
			request.logger.error({
				error: error.message,
				trace: error.stack,
				action: 'reset-password',
			}, 'Reset password failed');
			return response.status(400).json({message: error.message});
		}

		const {email, password, token} = request.body;
		await authService.resetPassword(email, password, token);
		request.logger.debug({
			action: 'reset-password',
		}, 'Reset password successful');

		return response.status(200).json({
			message: 'Password reset successfully',
		});
	} catch (error) {
		request.logger.error({
			error: error.message,
			trace: error.stack,
			action: 'reset-password',
		}, 'Reset password failed');
		next(error);
	}
}

async function logout(request, response, next) {
	try {
		await authService.logout(request.headers.authorization, request.headers.cookie);
		request.logger.debug({
			action: 'logout',
		}, 'Logout successful');

		return response.status(204).json({
			message: 'You have been successfully logged out',
		});
	} catch (error) {
		request.logger.error({
			error: error.message,
			trace: error.stack,
			action: 'logout',
		}, 'Logout failed');
		next(error);
	}
}

const authController = {
	register,
	verifyEmail,
	resendEmailVerificationToken,
	login,
	refreshToken,
	forgotPassword,
	resetPassword,
	logout,
};

export default authController;
