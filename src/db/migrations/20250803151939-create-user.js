/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
	await queryInterface.createTable('users', {
		id: {
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
		},
		email: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true,
		},
		password: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		role: {
			// eslint-disable-next-line new-cap
			type: Sequelize.ENUM(['admin', 'user']),
			allowNull: false,
			defaultValue: 'user',
		},
		isVerified: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
			field: 'is_verified',
		},
		createdAt: {
			allowNull: false,
			type: Sequelize.DATE,
		},
		updatedAt: {
			allowNull: false,
			type: Sequelize.DATE,
		},
	});
}

export async function down(queryInterface) {
	await queryInterface.dropTable('users');
}
