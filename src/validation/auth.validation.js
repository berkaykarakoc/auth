import process from 'node:process';
import Joi from 'joi';

export const emailSchema = Joi.string()
	.email()
	.required()
	.messages({
		'string.email': 'Invalid email address',
		'string.empty': 'Email is required',
	});

const roleSchema = Joi.string()
	.valid('user')
	.required()
	.messages({
		'any.only': 'Invalid role',
		'string.valid': 'Invalid role',
		'string.empty': 'Role is required',
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

const emailVerificationTokenSchema = Joi.string()
	.length(Number.parseInt(process.env.EMAIL_VERIFICATION_TOKEN_LENGTH, 10))
	.required()
	.messages({
		'string.length': `Email verification token must be exactly ${process.env.EMAIL_VERIFICATION_TOKEN_LENGTH} characters long.`,
	});

const passwordResetTokenSchema = Joi.string()
	.length(Number.parseInt(process.env.PASSWORD_RESET_TOKEN_LENGTH, 10))
	.required()
	.messages({
		'string.length': `Password reset token must be exactly ${process.env.PASSWORD_RESET_TOKEN_LENGTH} characters long.`,
	});

export const registerSchema = Joi.object({
	email: emailSchema,
	role: roleSchema,
	password: passwordSchema,
	repeatPassword: repeatPasswordSchema,
});

export const verifyEmailSchema = Joi.object({
	email: emailSchema,
	token: emailVerificationTokenSchema,
});

export const loginSchema = Joi.object({
	email: emailSchema,
	password: passwordSchema,
});

export const resetPasswordSchema = Joi.object({
	email: emailSchema,
	password: passwordSchema,
	repeatPassword: repeatPasswordSchema,
	token: passwordResetTokenSchema,
});
