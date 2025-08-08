import process from 'node:process';
import {Sequelize} from 'sequelize';
import {config} from 'dotenv';

config();

const sequelize = new Sequelize(`postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

export default sequelize;
