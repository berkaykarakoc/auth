const jwt = require('jsonwebtoken')
const ServerError = require('../errors/server.error')

const TokenType = Object.freeze({
    ACCESS_TOKEN: 'ACCESS_TOKEN',
    REFRESH_TOKEN: 'REFRESH_TOKEN'
});

function generateTokens(email, firstName, lastName) {
    const accessToken = generateAccessToken(email, firstName, lastName)
    const refreshToken = generateRefreshToken(email, firstName, lastName)
    return { accessToken, refreshToken };
}

function generateAccessToken(email, firstName, lastName) {
    return jwt.sign(
        {
            first_name: firstName,
            last_name: lastName,
            email: email,
            type: TokenType.ACCESS_TOKEN,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            subject: email,
            expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
        }
    )
}

function generateRefreshToken(email, firstName, lastName) {
    return jwt.sign(
        {
            first_name: firstName,
            last_name: lastName,
            email: email,
            type: TokenType.REFRESH_TOKEN,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            subject: email,
            expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
        }
    )
}

function verifyAccessToken(token) {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            throw new ServerError(401, 'Invalid access token')
        }
        return decoded
    })
}

function verifyRefreshToken(token) {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            throw new ServerError(401, 'Invalid refresh token')
        }
        return decoded
    })
}

function refreshAccessToken(token) {
    const decoded = verifyRefreshToken(token)
    return generateAccessToken(decoded.email, decoded.first_name, decoded.last_name)
}

module.exports = {
    TokenType,
    generateTokens,
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    refreshAccessToken
}