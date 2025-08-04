import {Router as expressRouter} from 'express';
import authController from '../controllers/auth.controller.js';
import refreshMiddleware from '../middlewares/refresh.middleware.js';

const router = expressRouter();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', refreshMiddleware, authController.refreshToken);

export default router;
