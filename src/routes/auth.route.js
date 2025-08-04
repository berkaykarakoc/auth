const express = require('express');
const authController = require('../controllers/auth.controller');
const { refreshMiddleware } = require('../middlewares/refresh.middleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', refreshMiddleware, authController.refreshToken);

module.exports = router;