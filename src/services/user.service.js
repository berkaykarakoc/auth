import User from '../models/user.js';
import ServerError from '../errors/server.error.js';

async function createUser(email, role, password) {
	const newUser = await User.create({
		email,
		role,
		password,
	});
	return newUser;
}

async function verifyUser(email) {
	const user = await User.findOne({where: {email}});
	if (!user) {
		throw new ServerError(404, 'User not found');
	}

	await user.update({isVerified: true});
	return user;
}

async function getUserByEmail(email) {
	const user = await User.findOne({where: {email}});
	return user;
}

async function getUserById(id) {
	const user = await User.findByPk(id);
	return user;
}

async function updateUserPassword(email, password) {
	const user = await User.findOne({where: {email}});
	if (!user) {
		throw new ServerError(404, 'User not found');
	}

	await user.update({password});
	return user;
}

const userService = {
	createUser,
	getUserByEmail,
	getUserById,
	verifyUser,
	updateUserPassword,
};

export default userService;
