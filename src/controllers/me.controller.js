const meService = require('../services/me.service')

async function me(req, res, next) {
    try {
        const user = await meService.me({ email: req.email })
        return res.status(200).json(user)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    me
}