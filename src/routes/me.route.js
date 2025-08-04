import {Router as expressRouter} from 'express';
import meController from '../controllers/me.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = expressRouter();

router.get('/', authMiddleware, meController.me);

export default router;
