import process from 'node:process';
import express, {json, urlencoded} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import {config} from 'dotenv';
import authRoutes from './routes/auth.route.js';
import meRoutes from './routes/me.route.js';
import errorMiddleware from './middlewares/error.middleware.js';

config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(helmet());
app.use(morgan('combined'));
app.use(json());
app.use(urlencoded({extended: true}));

app.use('/auth', authRoutes);
app.use('/me', meRoutes);
app.use(errorMiddleware);

app.listen(port, () => {
	console.info(`AUTH API listening on port ${port}`);
});
