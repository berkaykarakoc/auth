import User from '../models/user.js';

async function createUser(firstName, lastName, email, password) {
	const newUser = await User.create({
		firstName,
		lastName,
		email,
		password,
	});
	return newUser;
}

async function getUserByEmail(email) {
	const user = await User.findOne({where: {email}});
	return user;
}

async function getUserById(id) {
	const user = await User.findByPk(id);
	return user;
}

async function verifyUser(email) {
	const user = await User.findOne({where: {email}});
	if (!user) {
		throw new Error('User not found');
	}

	await user.update({isVerified: true});
	return user;
}

async function updateUserPassword(email, password) {
	const user = await User.findOne({where: {email}});
	if (!user) {
		throw new Error('User not found');
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
