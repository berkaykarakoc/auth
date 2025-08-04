const argon2 = require('argon2')
const { getUserByEmail, createUser } = require('./user.service')
const { generateTokens, refreshAccessToken } = require('./jwt.service')
const ServerError = require('../errors/server.error')

async function register({ firstName, lastName, email, password }) {
    const user = await getUserByEmail(email)
    if (user) {
        throw new ServerError(400, 'User already exists!')
    }
    const hashedPassword = await argon2.hash(password)
    const newUser = await createUser(firstName, lastName, email, hashedPassword)
    return { firstName: newUser.get('firstName'), lastName: newUser.get('lastName'), email: newUser.get('email') }
}

async function login({ email, password }) {
    const user = await getUserByEmail(email)
    if (!user || !await argon2.verify(user.get('password'), password)) {
        throw new ServerError(401, 'Invalid credentials!')
    }
    return generateTokens(email, user.get('firstName'), user.get('lastName'));
}

function refreshToken(cookie) {
    const refreshToken = cookie.split('refreshToken=')[1]
    if (!refreshToken) {
        throw new ServerError(400, 'No refresh token provided')
    }
    return { accessToken: refreshAccessToken(refreshToken) }
}

module.exports = {
    register,
    login,
    refreshToken
}