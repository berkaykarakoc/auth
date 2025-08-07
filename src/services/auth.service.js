import process from 'node:process';
import {hash, verify} from 'argon2';
import ServerError from '../errors/server.error.js';
import {TokenType} from '../models/token-type.js';
import userService from './user.service.js';
import tokenService from './token.service.js';
import emailService from './email.service.js';

async function register(email, role, password) {
	const user = await userService.getUserByEmail(email);
	if (user) {
		throw new ServerError(409, 'A user with this email address already exists');
	}

	const hashedPassword = await hash(password);
	const newUser = await userService.createUser(email, role, hashedPassword);
	const emailVerificationToken = await tokenService.generateEmailVerificationToken(newUser.get('id'));
	emailService.sendEmailWithTemplate(
		newUser.get('email'),
		TokenType.EMAIL_VERIFICATION,
		{
			email: newUser.get('email'),
			emailVerificationToken,
		},
	);
}

async function resendEmailVerificationToken(email) {
	const user = await userService.getUserByEmail(email);
	if (!user) {
		throw new ServerError(401, 'Invalid credentials');
	}

	if (user.get('isVerified')) {
		throw new ServerError(400, 'Email already verified');
	}

	const emailVerificationToken = await tokenService.generateEmailVerificationToken(user.get('id'));
	emailService.sendEmailWithTemplate(
		user.get('email'),
		TokenType.EMAIL_VERIFICATION,
		{
			email: user.get('email'),
			emailVerificationToken,
		},
	);
}

async function verifyEmail(email, token) {
	const user = await userService.getUserByEmail(email);
	if (!user) {
		throw new ServerError(401, 'Invalid credentials');
	}

	const verified = await tokenService.verifyEmailVerificationToken(user.get('id'), token);
	if (!verified) {
		throw new ServerError(400, 'Invalid confirmation token');
	}

	const verifiedUser = await userService.verifyUser(email);

	return tokenService.generateJwtTokens(
		verifiedUser.get('id'),
		verifiedUser.get('email'),
	);
}

async function login(email, password) {
	const user = await userService.getUserByEmail(email);
	if (!user) {
		throw new ServerError(401, 'Invalid credentials');
	}

	if (!user.get('isVerified')) {
		throw new ServerError(401, 'Email not verified. Please verify your email first');
	}

	if (!await verify(user.get('password'), password)) {
		throw new ServerError(401, 'Invalid credentials');
	}

	return tokenService.generateJwtTokens(
		user.get('id'),
		user.get('email'),
	);
}

async function refreshToken(cookie) {
	const refreshTokenMatch = cookie.match(/refreshToken=([^;]+)/);
	const {sub, email} = tokenService.decodeJwtToken(refreshTokenMatch[1]);

	return tokenService.generateJwtTokens(sub, email);
}

async function forgotPassword(email) {
	const user = await userService.getUserByEmail(email);
	if (!user) {
		throw new ServerError(401, 'Invalid credentials');
	}

	if (!user.get('isVerified')) {
		throw new ServerError(400, 'Email should be verified first');
	}

	const passwordResetToken = await tokenService.generatePasswordResetToken(user.get('id'));
	emailService.sendEmailWithTemplate(
		user.get('email'),
		TokenType.PASSWORD_RESET,
		{
			email: user.get('email'),
			passwordResetUrl: process.env.PASSWORD_RESET_URL,
			passwordResetToken,
		},
	);
}

async function resetPassword(email, password, token) {
	const user = await userService.getUserByEmail(email);
	if (!user) {
		throw new ServerError(401, 'Invalid credentials');
	}

	const verified = await tokenService.verifyPasswordResetToken(user.get('id'), token);
	if (!verified) {
		throw new ServerError(401, 'Invalid confirmation code');
	}

	const hashedPassword = await hash(password);
	await userService.updateUserPassword(email, hashedPassword);

	return {message: 'Password reset successfully'};
}

async function logout(authorization, cookie) {
	const accessToken = authorization.split(' ')[1];

	const refreshTokenMatch = cookie.match(/refreshToken=([^;]+)/);
	const refreshToken = refreshTokenMatch[1];

	await tokenService.invalidateTokens(accessToken, refreshToken);
}

const authService = {
	register,
	resendEmailVerificationToken,
	verifyEmail,
	login,
	refreshToken,
	forgotPassword,
	resetPassword,
	logout,
};

export default authService;
