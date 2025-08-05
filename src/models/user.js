import {DataTypes, Model} from 'sequelize';
import sequelize from '../connections/database.js';

class User extends Model {}

User.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		firstName: {
			type: DataTypes.STRING,
			allowNull: false,
			field: 'first_name',
		},
		lastName: {
			type: DataTypes.STRING,
			allowNull: false,
			field: 'last_name',
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true,
			},
		},
		password: {
			type: DataTypes.STRING,
			// Argon2 hashes are typically 95-97 chars, starting with $argon2...
			validate: {
				is: /^\$argon2(id|i|d)\$[a-zA-Z\d$=,.+/]+$/,
			},
			allowNull: false,
		},
		isVerified: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
			field: 'is_verified',
		},
	},
	{
		sequelize,
		tableName: 'users',
		schema: 'public',
	},
);

export default User;
