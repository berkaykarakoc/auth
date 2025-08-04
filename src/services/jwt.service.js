import process from 'node:process';
import jwt from 'jsonwebtoken';
import ServerError from '../errors/server.error.js';
import redisService from './redis.service.js';

const TokenType = Object.freeze({
	ACCESS_TOKEN: 'ACCESS_TOKEN',
	REFRESH_TOKEN: 'REFRESH_TOKEN',
});

function generateTokens(email, firstName, lastName) {
	const accessToken = generateToken({
		email,
		firstName,
		lastName,
		type: TokenType.ACCESS_TOKEN,
		secret: process.env.ACCESS_TOKEN_SECRET,
		xpiration: process.env.ACCESS_TOKEN_EXPIRATION,
	});
	const refreshToken = generateToken({
		email,
		firstName,
		lastName, type: TokenType.REFRESH_TOKEN,
		secret: process.env.REFRESH_TOKEN_SECRET,
		expiration: process.env.REFRESH_TOKEN_EXPIRATION,
	});
	return {accessToken, refreshToken};
}

function generateToken({email, firstName, lastName, type, secret, expiration}) {
	return jwt.sign(
		{
			firstName,
			lastName,
			email,
			type,
		},
		secret,
		{
			subject: email,
			expiresIn: expiration,
		},
	);
}

async function verifyToken(token, secret) {
	const decoded = jwt.verify(token, secret, (error, decoded) => {
		if (error) {
			throw new ServerError(401, 'Invalid token');
		}

		return decoded;
	});

	const isBlacklisted = await redisService.isTokenInBlacklist(token);
	if (isBlacklisted) {
		throw new ServerError(401, 'Token is in blacklist');
	}

	return decoded;
}

async function refreshAccessToken(token) {
	const decoded = await verifyToken(token, process.env.REFRESH_TOKEN_SECRET);
	return generateToken({
		email: decoded.email,
		firstName: decoded.first_name,
		lastName: decoded.last_name,
		type: TokenType.ACCESS_TOKEN,
		secret: process.env.ACCESS_TOKEN_SECRET,
		expiration: process.env.ACCESS_TOKEN_EXPIRATION,
	});
}

const jwtService = {
	TokenType,
	generateTokens,
	verifyToken,
	refreshAccessToken,
};

export default jwtService;
