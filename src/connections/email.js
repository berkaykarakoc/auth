import process from 'node:process';
import {createTransport} from 'nodemailer';
import {config} from 'dotenv';

config();

const transporter = createTransport({
	service: process.env.SMTP_SERVICE,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

export default transporter;
