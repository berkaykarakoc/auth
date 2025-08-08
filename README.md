# 🔐 Auth API

A production-ready authentication system built with Node.js, Express, and PostgreSQL.

## ✨ Features

- **🔐 JWT Authentication** with RS256 algorithm
- **📧 Email Verification** with secure tokens
- **🔒 Password Reset** functionality
- **🔄 Refresh Token** rotation
- **🛡️ Rate Limiting** with configurable limits
- **📝 Structured Logging** with Pino
- **📚 API Documentation** with Swagger
- **🏥 Health Checks** for monitoring
- **🔍 Request Correlation** for debugging
- **⚡ Performance Optimized** with Redis caching

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Cache**: Redis
- **Authentication**: JWT with Argon2 hashing
- **Validation**: Joi
- **Logging**: Pino
- **Documentation**: Swagger/OpenAPI 3.0
- **Rate Limiting**: express-rate-limit

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **Redis** (v6 or higher)
- **pnpm** (or npm)

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd auth

# Install dependencies
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Required Environment Variables

```env
# Database Configuration
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=auth

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USER=
REDIS_PASSWORD=

# JWT Keys (Generate your own)
PRIVATE_KEY=your_private_key_here
PUBLIC_KEY=your_public_key_here

# Token Expiration
ACCESS_TOKEN_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d
EMAIL_VERIFICATION_TOKEN_EXPIRATION=1h
PASSWORD_RESET_TOKEN_EXPIRATION=1h

# Token Lengths
EMAIL_VERIFICATION_TOKEN_LENGTH=6
PASSWORD_RESET_TOKEN_LENGTH=32

# Email Configuration
SMTP_SERVICE=gmail
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_MAIL=your_email@gmail.com

# API Configuration
PORT=3000
API_URL=http://localhost:3000
PASSWORD_RESET_URL=http://localhost:3000/reset-password

# Rate Limiting
GENERAL_RATE_LIMIT_WINDOW=15m
GENERAL_RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_WINDOW=15m
AUTH_RATE_LIMIT_MAX_REQUESTS=5
EMAIL_VERIFICATION_RATE_LIMIT_WINDOW=1h
EMAIL_VERIFICATION_RATE_LIMIT_MAX_REQUESTS=3
PASSWORD_RESET_RATE_LIMIT_WINDOW=1h
PASSWORD_RESET_RATE_LIMIT_MAX_REQUESTS=3
HEALTH_CHECK_RATE_LIMIT_WINDOW=1m
HEALTH_CHECK_RATE_LIMIT_MAX_REQUESTS=30

# Logging
LOG_LEVEL=info
NODE_ENV=development
```

### 4. Database Setup

```bash
# Run database migrations
pnpm db:migrate

# (Optional) Run seeders if available
pnpm db:seed
```

### 5. Start the Application

```bash
# Development mode
pnpm dev

# Production mode
pnpm start
```

## 🌐 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/auth/register` | Register new user |
| `POST` | `/v1/auth/login` | User login |
| `POST` | `/v1/auth/verify-email` | Verify email |
| `POST` | `/v1/auth/resend-email-verification` | Resend verification |
| `POST` | `/v1/auth/refresh-token` | Refresh access token |
| `POST` | `/v1/auth/forgot-password` | Request password reset |
| `POST` | `/v1/auth/reset-password` | Reset password |
| `POST` | `/v1/auth/logout` | User logout |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/me` | Get current user info |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api-docs` | Swagger documentation |

## 🔧 Quick Test

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test registration
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "confirmPassword": "Test123!@#",
    "role": "user"
  }'
```

## 📚 Documentation

- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## 📁 Project Structure

```
src/
├── config/           # Configuration files
│   ├── database.js   # Database connection
│   ├── redis.js      # Redis client
│   ├── logger.js     # Pino logger setup
│   └── swagger.js    # Swagger configuration
├── controllers/      # Request handlers
│   ├── auth.controller.js
│   └── me.controller.js
├── middlewares/      # Express middlewares
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   ├── refresh.middleware.js
│   ├── request-logger.middleware.js
│   ├── correlation.middleware.js
│   └── rate-limiter.middleware.js
├── models/           # Database models
│   ├── user.js
│   └── token-type.js
├── routes/           # Route definitions
│   ├── auth.route.js
│   └── me.route.js
├── services/         # Business logic
│   ├── auth.service.js
│   ├── user.service.js
│   ├── token.service.js
│   ├── email.service.js
│   └── redis.service.js
├── utils/            # Utility functions
│   ├── time.util.js
├── validation/       # Input validation
│   └── auth.validation.js
├── errors/           # Custom error classes
│   └── server.error.js
└── app.js           # Application entry point
```

## 🔒 Security Features

- **Password Hashing**: Argon2 (industry standard)
- **JWT Tokens**: RS256 asymmetric encryption
- **Token Blacklisting**: Redis-based token invalidation
- **Rate Limiting**: Configurable per endpoint
- **Input Validation**: Comprehensive Joi schemas
- **Security Headers**: Helmet middleware
- **CORS Protection**: Configurable origins
- **SQL Injection Prevention**: Sequelize ORM

## 📊 Monitoring & Observability

- **Structured Logging**: JSON format with Pino
- **Request Correlation**: Unique IDs for request tracing
- **Performance Monitoring**: Request duration tracking
- **Health Checks**: Database and Redis connectivity
- **Error Tracking**: Comprehensive error logging
- **Rate Limit Monitoring**: Request limit tracking

## 🚀 Production Deployment

### Environment Variables

Ensure all environment variables are properly set for production:

```env
NODE_ENV=production
LOG_LEVEL=warn
```

### Database

- Use production PostgreSQL instance
- Configure connection pooling
- Set up database backups

### Redis

- Use production Redis instance
- Configure persistence
- Set up Redis clustering if needed

### Security

- Generate strong JWT keys
- Use HTTPS in production
- Configure proper CORS origins
- Set up rate limiting for production traffic

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Create database if it doesn't exist
createdb auth
```

### Redis Connection Issues

```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Rate Limiting Issues

```bash
# Check rate limit headers in response
curl -I http://localhost:3000/v1/auth/login
```

## ✅ Verification

The API is running successfully when you see:

```
AUTH API v1 listening on port 3000
Database connected
Redis connected
```

## 📝 Available Scripts

```bash
# Development
pnpm dev              # Start with nodemon

# Production
pnpm start            # Start production server

# Database
pnpm db:migrate       # Run migrations
pnpm db:migrate:undo  # Undo last migration

# Code Quality
pnpm xo:fix          # Fix linting issues
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

**🎉 Your Auth API is now ready for development and production!**
