import process from 'node:process';
import {generateCode} from '../utils/code.js';
import redisService from './redis.service.js';

async function createVerificationCode(email, expiration) {
	const code = generateCode(process.env.VERIFICATION_CODE_LENGTH);
	await redisService.setVerificationCode(email, code, expiration);
	return code;
}

async function verifyCode(email, code) {
	const storedCode = await redisService.getVerificationCode(email);
	if (!storedCode || storedCode !== code) {
		return false;
	}

	await redisService.deleteVerificationCode(email);
	return true;
}

const verificationService = {
	createVerificationCode,
	verifyCode,
};

export default verificationService;
