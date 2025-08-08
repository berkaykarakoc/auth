import {Router as expressRouter} from 'express';
import meController from '../controllers/me.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = expressRouter();

/**
 * @swagger
 * tags:
 *   name: Me
 *   description: Endpoints for the me route
 */

/**
 * @swagger
 * /me:
 *   get:
 *     summary: Checks current authenticated user
 *     tags:
 *       - Me
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email of the authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   example: john.doe@xample.com
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 */
router.get('/', authMiddleware, meController.me);

export default router;
