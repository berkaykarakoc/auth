import process from 'node:process';
import jwt from 'jsonwebtoken';
import ServerError from '../errors/server.error.js';

const TokenType = Object.freeze({
	ACCESS_TOKEN: 'ACCESS_TOKEN',
	REFRESH_TOKEN: 'REFRESH_TOKEN',
});

function generateTokens(email, firstName, lastName) {
	const accessToken = generateAccessToken(email, firstName, lastName);
	const refreshToken = generateRefreshToken(email, firstName, lastName);
	return {accessToken, refreshToken};
}

function generateAccessToken(email, firstName, lastName) {
	return jwt.sign(
		{
			firstName,
			lastName,
			email,
			type: TokenType.ACCESS_TOKEN,
		},
		process.env.ACCESS_TOKEN_SECRET,
		{
			subject: email,
			expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
		},
	);
}

function generateRefreshToken(email, firstName, lastName) {
	return jwt.sign(
		{
			firstName,
			lastName,
			email,
			type: TokenType.REFRESH_TOKEN,
		},
		process.env.REFRESH_TOKEN_SECRET,
		{
			subject: email,
			expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
		},
	);
}

function verifyAccessToken(token) {
	return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
		if (error) {
			throw new ServerError(401, 'Invalid access token');
		}

		return decoded;
	});
}

function verifyRefreshToken(token) {
	return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (error, decoded) => {
		if (error) {
			throw new ServerError(401, 'Invalid refresh token');
		}

		return decoded;
	});
}

function refreshAccessToken(token) {
	const decoded = verifyRefreshToken(token);
	return generateAccessToken(decoded.email, decoded.first_name, decoded.last_name);
}

const jwtService = {
	TokenType,
	generateTokens,
	generateAccessToken,
	generateRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
	refreshAccessToken,
};

export default jwtService;
