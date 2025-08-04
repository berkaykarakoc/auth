import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import process from 'node:process';
import Sequelize from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// Import config using dynamic import
const configModule = await import(path.join(__dirname, '../config/config.cjs'));
const config = configModule.default[env];

const db = {};

const sequelize = config.use_env_variable ? new Sequelize(process.env[config.use_env_variable], config) : new Sequelize(config.database, config.username, config.password, config);

for (const file of fs
	.readdirSync(__dirname)
	.filter(file => (
		file.indexOf('.') !== 0
		&& file !== basename
		&& file.slice(-3) === '.js'
		&& !file.includes('.test.js')
	))) {
	const modelModule = import(path.join(__dirname, file));
	const model = modelModule.default(sequelize, Sequelize.DataTypes);
	db[model.name] = model;
}

for (const modelName of Object.keys(db)) {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
