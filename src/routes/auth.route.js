import {Router as expressRouter} from 'express';
import authController from '../controllers/auth.controller.js';
import refreshMiddleware from '../middlewares/refresh.middleware.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = expressRouter();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-email-verification', authController.resendEmailVerificationToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.post('/logout', authMiddleware, refreshMiddleware, authController.logout);
router.post('/refresh-token', refreshMiddleware, authController.refreshToken);

export default router;
