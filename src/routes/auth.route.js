import {Router as expressRouter} from 'express';
import authController from '../controllers/auth.controller.js';
import refreshMiddleware from '../middlewares/refresh.middleware.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = expressRouter();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification-code', authController.resendVerificationCode);
router.post('/password-reset', authController.passwordReset);
router.post('/verify-password-reset', authController.verifyPasswordReset);

router.post('/logout', authMiddleware, refreshMiddleware, authController.logout);
router.post('/refresh-token', refreshMiddleware, authController.refreshToken);

export default router;
