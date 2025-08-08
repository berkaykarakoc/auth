import process from 'node:process';
import path from 'node:path';
import pug from 'pug';
import transporter from '../config/email.js';
import {TokenType} from '../models/token-type.js';

const EMAIL_SUBJECTS = {
	[TokenType.EMAIL_VERIFICATION]: process.env.EMAIL_VERIFICATION_SUBJECT || 'Email Verification',
	[TokenType.PASSWORD_RESET]: process.env.PASSWORD_RESET_SUBJECT || 'Password Reset',
};

async function sendEmailWithTemplate(to, templateName, emailData) {
	const pugTemplatePath = path.join(process.cwd(), 'src', 'templates', `${templateName}.pug`);
	const compiledFunction = pug.compileFile(pugTemplatePath);
	const emailHTML = compiledFunction(emailData);
	const subject = EMAIL_SUBJECTS[templateName] || 'Notification';
	const mailOptions = {
		from: process.env.SMTP_MAIL,
		to,
		subject,
		html: emailHTML,
	};
	const info = await transporter.sendMail(mailOptions);
	console.info('Email sent:', info.response);
}

const mailingService = {
	sendEmailWithTemplate,
};

export default mailingService;
