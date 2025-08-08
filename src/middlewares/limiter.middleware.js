import process from 'node:process';
import rateLimit from 'express-rate-limit';
import {convertToMilliseconds} from '../utils/time.util.js';

// General API rate limiter
export const generalLimiter = rateLimit({
	windowMs: convertToMilliseconds(process.env.GENERAL_RATE_LIMIT_WINDOW),
	max: Number.parseInt(process.env.GENERAL_RATE_LIMIT_MAX_REQUESTS, 10),
	message: {
		error: 'Too many requests from this IP, please try again later',
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler(request, response) {
		request.logger.error({
			action: 'general',
		}, 'Too many requests from this IP, please try again later');

		response.status(429).json({
			error: 'Too many requests from this IP, please try again later',
		});
	},
});

// Strict limiter for authentication endpoints
export const authLimiter = rateLimit({
	windowMs: convertToMilliseconds(process.env.AUTH_RATE_LIMIT_WINDOW),
	max: Number.parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS, 10),
	message: {
		error: 'Too many authentication attempts, please try again later',
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler(request, response) {
		request.logger.error({
			action: 'authentication',
		}, 'Too many authentication attempts, please try again later');

		response.status(429).json({
			error: 'Too many authentication attempts, please try again later',
		});
	},
});

// Email verification limiter
export const emailVerificationLimiter = rateLimit({
	windowMs: convertToMilliseconds(process.env.EMAIL_VERIFICATION_RATE_LIMIT_WINDOW),
	max: Number.parseInt(process.env.EMAIL_VERIFICATION_RATE_LIMIT_MAX_REQUESTS, 10),
	message: {
		error: 'Too many email verification attempts, please try again later',
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler(request, response) {
		request.logger.error({
			action: 'email-verification',
		}, 'Too many email verification attempts, please try again later');

		response.status(429).json({
			error: 'Too many email verification attempts, please try again later',
		});
	},
});

// Password reset limiter
export const passwordResetLimiter = rateLimit({
	windowMs: convertToMilliseconds(process.env.PASSWORD_RESET_RATE_LIMIT_WINDOW),
	max: Number.parseInt(process.env.PASSWORD_RESET_RATE_LIMIT_MAX_REQUESTS, 10),
	message: {
		error: 'Too many password reset attempts, please try again later',
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler(request, response) {
		request.logger.error({
			action: 'password-reset',
		}, 'Too many password reset attempts, please try again later');

		response.status(429).json({
			error: 'Too many password reset attempts, please try again later',
		});
	},
});

// Health check limiter (very permissive)
export const healthCheckLimiter = rateLimit({
	windowMs: convertToMilliseconds(process.env.HEALTH_CHECK_RATE_LIMIT_WINDOW),
	max: Number.parseInt(process.env.HEALTH_CHECK_RATE_LIMIT_MAX_REQUESTS, 10),
	message: {
		error: 'Too many health check requests, please try again later',
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler(request, response) {
		request.logger.error({
			action: 'health-check',
		}, 'Too many health check requests, please try again later');

		response.status(429).json({
			error: 'Too many health check requests, please try again later',
		});
	},
});

// Default limiter
export default generalLimiter;
