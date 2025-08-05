import process from 'node:process';
import {generateCode} from '../utils/code.js';
import redisService from './redis.service.js';

async function createVerificationCode(email, verificationType, expiration) {
	const code = generateCode(Number.parseInt(process.env.VERIFICATION_CODE_LENGTH, 10));
	await redisService.setVerificationCode(email, code, verificationType, expiration);
	return code;
}

async function verifyCode(email, verificationType, code) {
	const storedCode = await redisService.getVerificationCode(email, verificationType);
	if (!storedCode || storedCode !== code) {
		return false;
	}

	await redisService.deleteVerificationCode(email, verificationType);
	return true;
}

const verificationService = {
	createVerificationCode,
	verifyCode,
};

export default verificationService;
