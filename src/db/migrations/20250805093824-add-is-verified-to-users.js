/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
	await queryInterface.addColumn('users', 'is_verified', {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	});
}

export async function down(queryInterface) {
	await queryInterface.removeColumn('users', 'is_verified');
}
