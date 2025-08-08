import process from 'node:process';
import swaggerJsDoc from 'swagger-jsdoc';

// Swagger setup
const swaggerOptions = {
	definition: {
		openapi: '3.0.4',
		info: {
			title: 'Auth API',
			version: '1.0.0',
			description: 'AUTH API documentation',
		},
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
				cookieAuth: {
					type: 'apiKey',
					in: 'cookie',
					name: 'token',
				},
			},
		},
		servers: [
			{
				url: process.env.API_URL,
			},
		],
	},
	apis: ['./src/routes/*.route.js', './src/app.js'],
};

export const swaggerDocs = swaggerJsDoc(swaggerOptions);
