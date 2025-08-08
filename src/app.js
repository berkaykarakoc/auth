import process from 'node:process';
import express, {json, urlencoded} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import {config} from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.route.js';
import meRoutes from './routes/me.route.js';
import errorMiddleware from './middlewares/error.middleware.js';
import {swaggerDocs} from './config/swagger.js';
import sequelize from './config/database.js';
import redisClient from './config/redis.js';
import logger from './config/logger.js';
import correlationMiddleware from './middlewares/correlation.middleware.js';
import requestLogger from './middlewares/request-logger.middleware.js';

config();

const app = express();
const port = process.env.PORT || 3000;

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Add middlewares early in the chain
app.use(correlationMiddleware);
app.use(requestLogger);

app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(helmet());
app.use(json());
app.use(urlencoded({extended: true}));

app.use('/auth', authRoutes);
app.use('/me', meRoutes);
app.use(errorMiddleware);

// Health check endpoint
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check health of the API
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [OK]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       enum: [connected]
 *                     redis:
 *                       type: string
 *                       enum: [connected]
 *       503:
 *         description: API is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [ERROR]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 error:
 *                   type: string
 */
app.get('/health', async (request, response) => {
	try {
		// Check database connection
		await sequelize.authenticate();
		logger.info('Database connected');

		// Check Redis connection
		const client = redisClient.getClient();
		await client.ping();
		logger.info('Redis connected');

		response.status(200).json({
			status: 'OK',
			timestamp: new Date().toISOString(),
			services: {
				database: 'connected',
				redis: 'connected',
			},
		});
		logger.info('Health check successful');
	} catch (error) {
		request.logger.error({
			error: error.message,
			action: 'health-check',
		}, 'Health check failed');
		response.status(503).json({
			status: 'ERROR',
			timestamp: new Date().toISOString(),
			error: error.message,
		});
	}
});

app.listen(port, () => {
	logger.info(`AUTH API listening on port ${port}`);
});
