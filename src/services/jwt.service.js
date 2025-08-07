import process from 'node:process';
import jwt from 'jsonwebtoken';
import ServerError from '../errors/server.error.js';
import {TokenType} from '../models/enum.js';
import redisService from './redis.service.js';

const PRIVATE_KEY = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');
const PUBLIC_KEY = process.env.PUBLIC_KEY.replace(/\\n/g, '\n');

function generateTokens(email, firstName, lastName) {
	const accessToken = generateToken({
		email,
		firstName,
		lastName,
		type: TokenType.ACCESS_TOKEN,
		expiration: process.env.ACCESS_TOKEN_EXPIRATION,
	});
	const refreshToken = generateToken({
		email,
		firstName,
		lastName, 
		type: TokenType.REFRESH_TOKEN,
		expiration: process.env.REFRESH_TOKEN_EXPIRATION,
	});
	return {accessToken, refreshToken};
}

function generateToken({email, firstName, lastName, type, expiration}) {
	return jwt.sign(
		{
			firstName,
			lastName,
			email,
			type,
		},
		PRIVATE_KEY,
		{
			subject: email,
			expiresIn: expiration,
			algorithm: 'RS256'
		},
	);
}

async function verifyToken(token) {
	const decoded = jwt.verify(token, PUBLIC_KEY, (error, decoded) => {
		if (error) {
			throw new ServerError(401, 'Invalid token');
		}

		return decoded;
	});

	const isBlacklisted = await redisService.isTokenInExclude(token);
	if (isBlacklisted) {
		throw new ServerError(401, 'Token is in blacklist');
	}

	return decoded;
}

async function refreshAccessToken(token) {
	const decoded = await verifyToken(token);
	return generateToken({
		email: decoded.email,
		firstName: decoded.first_name,
		lastName: decoded.last_name,
		type: TokenType.ACCESS_TOKEN,
		expiration: process.env.ACCESS_TOKEN_EXPIRATION,
	});
}

const jwtService = {
	generateTokens,
	verifyToken,
	refreshAccessToken,
};

export default jwtService;
