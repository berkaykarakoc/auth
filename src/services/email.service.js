import process from 'node:process';
import path from 'node:path';
import pug from 'pug';
import transporter from '../connections/email.js';

async function sendEmailWithTemplate(to, subject, templateName, emailData) {
	const pugTemplatePath = path.join(process.cwd(), 'src', 'templates', `${templateName}.pug`);
	const compiledFunction = pug.compileFile(pugTemplatePath);
	const emailHTML = compiledFunction(emailData);
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
