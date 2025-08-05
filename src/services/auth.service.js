import process from 'node:process';
import {hash, verify} from 'argon2';
import ServerError from '../errors/server.error.js';
import {VerificationType} from '../models/enum.js';
import userService from './user.service.js';
import jwtService from './jwt.service.js';
import redisService from './redis.service.js';
import emailService from './email.service.js';
import verificationService from './verification.service.js';

async function register({firstName, lastName, email, password}) {
	const user = await userService.getUserByEmail(email);
	if (user) {
		throw new ServerError(400, 'User already exists!');
	}

	const hashedPassword = await hash(password);
	const newUser = await userService.createUser(firstName, lastName, email, hashedPassword);

	await sendVerificationCode({
		email, firstName, lastName, title: VerificationType.REGISTER.title, verificationType: VerificationType.REGISTER.value,
	});

	return {firstName: newUser.get('firstName'), lastName: newUser.get('lastName'), email: newUser.get('email')};
}

async function login({email, password}) {
	const user = await userService.getUserByEmail(email);
	if (!user) {
		throw new ServerError(401, 'Invalid credentials!');
	}

	if (!user.get('isVerified')) {
		throw new ServerError(401, 'Email not verified! Please verify your email first.');
	}

	if (!await verify(user.get('password'), password)) {
		throw new ServerError(401, 'Invalid credentials!');
	}

	return jwtService.generateTokens(email, user.get('firstName'), user.get('lastName'));
}

async function logout(authorization, cookie) {
	const accessToken = authorization.split(' ')[1];
	const refreshToken = cookie.split('refreshToken=')[1];

	await redisService.addTokenToExclude(accessToken, process.env.ACCESS_TOKEN_EXPIRATION);
	await redisService.addTokenToExclude(refreshToken, process.env.REFRESH_TOKEN_EXPIRATION);
	return {message: 'Logged out successfully'};
}

async function refreshToken(cookie) {
	const refreshToken = cookie.split('refreshToken=')[1];
	if (!refreshToken) {
		throw new ServerError(400, 'No refresh token provided');
	}

	return {accessToken: await jwtService.refreshAccessToken(refreshToken)};
}

async function verifyEmail({email, code}) {
	const verified = await verificationService.verifyCode(email, VerificationType.REGISTER.value, code);
	if (!verified) {
		throw new ServerError(400, 'Invalid confirmation code');
	}

	await userService.verifyUser(email);
	return {message: 'Email verified successfully'};
}

async function sendVerificationCode({email, firstName, lastName, verificationType}) {
	let title = '';
	if (verificationType === VerificationType.REGISTER.value) {
		title = VerificationType.REGISTER.title;
		const user = await userService.getUserByEmail(email);
		if (user.get('isVerified')) {
			throw new ServerError(400, 'Email already verified');
		}
	} else if (verificationType === VerificationType.PASSWORD_RESET.value) {
		title = VerificationType.PASSWORD_RESET.title;
	}

	const verificationCode = await verificationService.createVerificationCode(email, verificationType, process.env.VERIFICATION_CODE_EXPIRATION);
	emailService.sendEmailWithTemplate(email, title, verificationType, {firstName, lastName, verificationCode});
}

async function passwordReset({email, firstName, lastName}) {
	const user = await userService.getUserByEmail(email);
	if (!user) {
		throw new ServerError(404, 'User not found');
	}

	if (!user.get('isVerified')) {
		throw new ServerError(400, 'Email should be verified first');
	}

	await sendVerificationCode({
		email, firstName, lastName, title: VerificationType.PASSWORD_RESET.title, verificationType: VerificationType.PASSWORD_RESET.value,
	});
	return {message: 'Password reset code sent successfully'};
}

async function verifyPasswordReset({email, password, code}) {
	const verified = await verificationService.verifyCode(email, VerificationType.PASSWORD_RESET.value, code);
	if (!verified) {
		throw new ServerError(400, 'Invalid confirmation code');
	}

	const hashedPassword = await hash(password);
	await userService.updateUserPassword(email, hashedPassword);

	return {message: 'Password reset successfully'};
}

const authService = {
	register,
	login,
	logout,
	refreshToken,
	verifyEmail,
	sendVerificationCode,
	passwordReset,
	verifyPasswordReset,
};

export default authService;
