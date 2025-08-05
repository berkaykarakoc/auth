import process from 'node:process';
import authService from '../services/auth.service.js';
import {convertToSeconds} from '../utils/duration.js';
import {
	registerSchema,
	loginSchema,
	verifyEmailSchema,
	resendVerificationCodeSchema,
	passwordResetSchema,
	verifyPasswordResetSchema,
} from '../validation/auth.validation.js';

async function register(request, response, next) {
	try {
		const {error} = registerSchema.validate(request.body);
		if (error) {
			return response.status(400).json({message: error.message});
		}

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
		const {error} = loginSchema.validate(request.body);
		if (error) {
			return response.status(400).json({message: error.message});
		}

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
		const {error} = verifyEmailSchema.validate(request.body);
		if (error) {
			return response.status(400).json({message: error.message});
		}

		await authService.verifyEmail(request.body);
		return response.status(200).json({message: 'Email verified successfully!'});
	} catch (error) {
		next(error);
	}
}

async function resendVerificationCode(request, response, next) {
	try {
		const {error} = resendVerificationCodeSchema.validate(request.body);
		if (error) {
			return response.status(400).json({message: error.message});
		}

		await authService.sendVerificationCode(request.body);
		return response.status(200).json({message: 'Verification code resent successfully!'});
	} catch (error) {
		next(error);
	}
}

async function passwordReset(request, response, next) {
	try {
		const {error} = passwordResetSchema.validate(request.body);
		if (error) {
			return response.status(400).json({message: error.message});
		}

		await authService.passwordReset(request.body);
		return response.status(200).json({message: 'Password reset code sent successfully!'});
	} catch (error) {
		next(error);
	}
}

async function verifyPasswordReset(request, response, next) {
	try {
		const {error} = verifyPasswordResetSchema.validate(request.body);
		if (error) {
			return response.status(400).json({message: error.message});
		}

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
