import process from 'node:process';
import {hash, verify} from 'argon2';
import ServerError from '../errors/server.error.js';
import {TemplateName} from '../models/enum.js';
import userService from './user.service.js';
import jwtService from './jwt.service.js';
import redisService from './redis.service.js';
import emailService from './email.service.js';
import verificationService from './verification.service.js';

async function sendVerificationCode(email, templateName, emailData) {
	const {firstName, lastName} = emailData;
	const verificationCode = await verificationService.createVerificationCode(email, process.env.VERIFICATION_CODE_EXPIRATION);
	emailService.sendEmailWithTemplate(email, 'Hesap Doğrulama - Kayıt Onayı', templateName, {firstName, lastName, verificationCode});
}

async function register({firstName, lastName, email, password}) {
	const user = await userService.getUserByEmail(email);
	if (user) {
		throw new ServerError(400, 'User already exists!');
	}

	const hashedPassword = await hash(password);
	const newUser = await userService.createUser(firstName, lastName, email, hashedPassword);

	await sendVerificationCode(email, TemplateName.REGISTER, {firstName, lastName});

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
}

async function refreshToken(cookie) {
	const refreshToken = cookie.split('refreshToken=')[1];
	if (!refreshToken) {
		throw new ServerError(400, 'No refresh token provided');
	}

	return {accessToken: await jwtService.refreshAccessToken(refreshToken)};
}

async function verifyEmail(email, confirmationCode) {
	const verified = await verificationService.verifyCode(email, confirmationCode);
	if (!verified) {
		throw new ServerError(400, 'Invalid confirmation code');
	}

	await userService.verifyUser(email);
	return {message: 'Email verified successfully'};
}

const authService = {
	register,
	login,
	logout,
	refreshToken,
	verifyEmail,
	sendVerificationCode,
};

export default authService;
