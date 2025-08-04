/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
	await queryInterface.createTable('users', {
		id: {
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
		},
		firstName: {
			type: Sequelize.STRING,
			allowNull: false,
			field: 'first_name',
		},
		lastName: {
			type: Sequelize.STRING,
			allowNull: false,
			field: 'last_name',
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
