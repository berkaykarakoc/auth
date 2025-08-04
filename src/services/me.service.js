const { getUserByEmail } = require('./user.service')

async function me({ email }) {
    const user = await getUserByEmail(email)
    if (!user) {
        throw new ServerError(404, 'User not found')
    }
    return { firstName: user.get('firstName'), lastName: user.get('lastName'), email: user.get('email') }
}

module.exports = {
    me
}