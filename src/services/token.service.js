import process from 'node:process';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import ServerError from '../errors/server.error.js';
import {TokenType} from '../models/token-type.js';
import {convertToSeconds} from '../utils/duration.js';
import redisService from './redis.service.js';

const PRIVATE_KEY = process.env.PRIVATE_KEY.replaceAll(String.raw`\n`, '\n');
const PUBLIC_KEY = process.env.PUBLIC_KEY.replaceAll(String.raw`\n`, '\n');

const TOKEN_GENERATION = {
	NUMERIC: {
		BASE: 10,
		MIN_MULTIPLIER: 1,
	},
	HEX: {
		ENCODING: 'hex',
	},
};

// Jwt tokens
async function generateJwtTokens(userId, email) {
	const accessToken = await generateJwtToken(
		userId,
		email,
		TokenType.ACCESS_TOKEN,
		process.env.ACCESS_TOKEN_EXPIRATION,
	);
	const refreshToken = await generateJwtToken(
		userId,
		email,
		TokenType.REFRESH_TOKEN,
		process.env.REFRESH_TOKEN_EXPIRATION,
	);
	return {accessToken, refreshToken};
}

async function verifyJwtToken(token) {
	try {
		const decoded = jwt.verify(token, PUBLIC_KEY);

		const isBlacklisted = await redisService.isTokenInExclude(token);
		if (isBlacklisted) {
			throw new ServerError(401, 'Token is in blacklist.');
		}

		return decoded;
	} catch {
		throw new ServerError(401, 'Invalid token.');
	}
}

function decodeJwtToken(token) {
	return jwt.decode(token);
}

// Email verification
async function generateEmailVerificationToken(userId) {
	const ttl = await redisService.getTokenExpiration(userId, TokenType.EMAIL_VERIFICATION);
	const remaining = calculateRemainingTime(
		ttl,
		process.env.EMAIL_VERIFICATION_TOKEN_RESEND_INTERVAL,
		process.env.EMAIL_VERIFICATION_TOKEN_EXPIRATION,
	);
	if (remaining > 0) {
		throw new ServerError(400, `Email verification token has not expired yet. Try after ${remaining} seconds`);
	}

	const tokenLength = Number.parseInt(process.env.EMAIL_VERIFICATION_TOKEN_LENGTH, 10);
	const newToken = generateNumericToken(tokenLength);

	await redisService.setToken(userId, newToken, TokenType.EMAIL_VERIFICATION, process.env.EMAIL_VERIFICATION_TOKEN_EXPIRATION);
	return newToken;
}

async function verifyEmailVerificationToken(userId, token) {
	const storedToken = await redisService.getToken(userId, TokenType.EMAIL_VERIFICATION);
	if (!storedToken || storedToken !== token) {
		return false;
	}

	await redisService.deleteToken(userId, TokenType.EMAIL_VERIFICATION);
	return true;
}

// Password reset
async function generatePasswordResetToken(userId) {
	const ttl = await redisService.getTokenExpiration(userId, TokenType.PASSWORD_RESET);
	const remaining = calculateRemainingTime(
		ttl,
		process.env.PASSWORD_RESET_TOKEN_RESEND_INTERVAL,
		process.env.PASSWORD_RESET_TOKEN_EXPIRATION,
	);
	if (remaining > 0) {
		throw new ServerError(400, `Password reset token has not expired yet. Try after ${remaining} seconds`);
	}

	const tokenLength = Number.parseInt(process.env.PASSWORD_RESET_TOKEN_LENGTH, 10);
	const token = generateHexToken(tokenLength);

	await redisService.setToken(userId, token, TokenType.PASSWORD_RESET, process.env.PASSWORD_RESET_TOKEN_EXPIRATION);
	return token;
}

async function verifyPasswordResetToken(userId, token) {
	const storedToken = await redisService.getToken(userId, TokenType.PASSWORD_RESET);
	if (!storedToken || storedToken !== token) {
		return false;
	}

	await redisService.deleteToken(userId, TokenType.PASSWORD_RESET);
	return true;
}

async function invalidateTokens(accessToken, refreshToken) {
	const {sub} = decodeJwtToken(accessToken);
	await redisService.deleteToken(sub, TokenType.ACCESS_TOKEN);
	await redisService.deleteToken(sub, TokenType.REFRESH_TOKEN);
	await redisService.addTokenToExclude(accessToken, convertToSeconds(process.env.ACCESS_TOKEN_EXPIRATION));
	await redisService.addTokenToExclude(refreshToken, convertToSeconds(process.env.REFRESH_TOKEN_EXPIRATION));
}

// Private functions
async function generateJwtToken(userId, email, tokenType, expiration) {
	const token = jwt.sign(
		{
			email,
			type: tokenType,
		},
		PRIVATE_KEY,
		{
			subject: userId,
			expiresIn: expiration,
			algorithm: 'RS256',
		},
	);

	// Invalidate previous token
	await invalidateToken(userId, tokenType);

	await redisService.setToken(userId, token, tokenType, expiration);
	return token;
}

async function invalidateToken(userId, tokenType) {
	const token = await redisService.getToken(userId, tokenType);
	if (token) {
		const decoded = jwt.decode(token);
		const expiration = decoded.exp - Math.floor(Date.now() / 1000);

		await redisService.addTokenToExclude(token, expiration);
		await redisService.deleteToken(userId, tokenType);
	}
}

function generateNumericToken(length) {
	if (length <= 0) {
		throw new ServerError(500, 'Invalid token length.');
	}

	const minValue = TOKEN_GENERATION.NUMERIC.BASE ** (length - TOKEN_GENERATION.NUMERIC.MIN_MULTIPLIER);
	const maxValue = (TOKEN_GENERATION.NUMERIC.BASE ** length) - TOKEN_GENERATION.NUMERIC.MIN_MULTIPLIER;
	return crypto.randomInt(minValue, maxValue).toString();
}

function generateHexToken(length) {
	if (length <= 0) {
		throw new ServerError(500, 'Invalid token length.');
	}

	return crypto.randomBytes(length).toString(TOKEN_GENERATION.HEX.ENCODING);
}

function calculateRemainingTime(ttl, interval, expiration) {
	return convertToSeconds(interval) - (convertToSeconds(expiration) - ttl);
}

const tokenService = {
	generateJwtTokens,
	verifyJwtToken,
	decodeJwtToken,
	generateEmailVerificationToken,
	verifyEmailVerificationToken,
	generatePasswordResetToken,
	verifyPasswordResetToken,
	invalidateTokens,
};

export default tokenService;
