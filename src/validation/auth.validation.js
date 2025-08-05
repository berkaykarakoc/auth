import process from 'node:process';
import Joi from 'joi';
import {VerificationType} from '../models/enum.js';

const emailSchema = Joi.string()
	.email()
	.required()
	.messages({
		'string.email': 'Invalid email address',
		'string.empty': 'Email is required',
	});

const passwordSchema = Joi.string()
	.min(8)
	.max(32)
	.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/)
	.required()
	.messages({
		'string.min': 'Password must be at least 8 characters long',
		'string.max': 'Password must be less than 32 characters long',
		'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
		'string.empty': 'Password is required',
	});

const repeatPasswordSchema = Joi.string()
	.valid(Joi.ref('password'))
	.required()
	.messages({
		'any.only': 'Passwords must match',
		'string.empty': 'Please confirm your password',
	});

const nameSchema = Joi.string()
	.alphanum()
	.min(2)
	.max(30)
	.required()
	.messages({
		'string.letters': 'Name must contain only letters',
		'string.min': 'Name must be at least 2 characters long',
		'string.max': 'Name must be less than 30 characters long',
		'string.empty': 'Name is required',
	});

const verificationCodeSchema = Joi.string()
	.length(Number.parseInt(process.env.VERIFICATION_CODE_LENGTH, 10))
	.required()
	.messages({
		'string.length': 'Verification code must be exactly 6 characters long',
	});

const verificationTypeSchema = Joi.string()
	.valid(...Object.values(VerificationType).map((type) => type.value))
	.required()
	.messages({
		'string.valid': 'Invalid verification type',
	});

export const registerSchema = Joi.object({
	firstName: nameSchema,

	lastName: nameSchema,

	email: emailSchema,

	password: passwordSchema,

	repeatPassword: repeatPasswordSchema,
});

export const loginSchema = Joi.object({
	email: emailSchema,

	password: passwordSchema,
});

export const verifyEmailSchema = Joi.object({
	email: emailSchema,

	code: verificationCodeSchema,
});

export const resendVerificationCodeSchema = Joi.object({
	email: emailSchema,

	firstName: nameSchema,

	lastName: nameSchema,

	verificationType: verificationTypeSchema,
});

export const passwordResetSchema = Joi.object({
	email: emailSchema,

	firstName: nameSchema,

	lastName: nameSchema,
});

export const verifyPasswordResetSchema = Joi.object({
	email: emailSchema,

	password: passwordSchema,

	repeatPassword: repeatPasswordSchema,

	code: verificationCodeSchema,
});
