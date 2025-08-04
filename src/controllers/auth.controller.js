const authService = require('../services/auth.service')
const ms = require('ms')

async function register(req, res, next) {
    try {
        const { firstName, lastName, email } = await authService.register(req.body)
        return res.status(201).json({ firstName, lastName, email, message: 'User registered successfully!' })
    } catch (error) {
        next(error)
    }
}

async function login(req, res, next) {
    try {
        const { accessToken, refreshToken } = await authService.login(req.body)
        res.cookie('token', refreshToken, { 
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: ms(process.env.REFRESH_TOKEN_EXPIRATION)
        });

        return res.status(200).json({ accessToken })
    } catch (error) {
        next(error)
    }
}

function refreshToken(req, res, next) {
    try {
        const { accessToken } = authService.refreshToken(req.headers.cookie)
        return res.status(200).json({ accessToken })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    register,
    login,
    refreshToken
}