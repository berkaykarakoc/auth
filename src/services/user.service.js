const User = require('../models/user')

async function createUser(firstName, lastName, email, password) {
  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password
  })
  return newUser
}

async function getUserByEmail(email) {
  const user = await User.findOne({ where: { email } })
  return user
}

async function getUserById(id) {
  const user = await User.findByPk(id)
  return user
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById
}