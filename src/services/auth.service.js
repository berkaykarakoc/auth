import process from 'node:process';
import {hash, verify} from 'argon2';
import ServerError from '../errors/server.error.js';
import userService from './user.service.js';
import jwtService from './jwt.service.js';
import redisService from './redis.service.js';

async function register({firstName, lastName, email, password}) {
	const user = await userService.getUserByEmail(email);
	if (user) {
		throw new ServerError(400, 'User already exists!');
	}

	const hashedPassword = await hash(password);
	const newUser = await userService.createUser(firstName, lastName, email, hashedPassword);
	return {firstName: newUser.get('firstName'), lastName: newUser.get('lastName'), email: newUser.get('email')};
}

async function login({email, password}) {
	const user = await userService.getUserByEmail(email);
	if (!user || !await verify(user.get('password'), password)) {
		throw new ServerError(401, 'Invalid credentials!');
	}

	return jwtService.generateTokens(email, user.get('firstName'), user.get('lastName'));
}

async function logout(authorization, cookie) {
	const accessToken = authorization.split(' ')[1];
	const refreshToken = cookie.split('refreshToken=')[1];

	await redisService.addTokenToBlacklist(accessToken, process.env.ACCESS_TOKEN_EXPIRATION);
	await redisService.addTokenToBlacklist(refreshToken, process.env.REFRESH_TOKEN_EXPIRATION);
}

async function refreshToken(cookie) {
	const refreshToken = cookie.split('refreshToken=')[1];
	if (!refreshToken) {
		throw new ServerError(400, 'No refresh token provided');
	}

	return {accessToken: await jwtService.refreshAccessToken(refreshToken)};
}

const authService = {
	register,
	login,
	logout,
	refreshToken,
};

export default authService;
