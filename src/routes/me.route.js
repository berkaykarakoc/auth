const express = require('express');
const meController = require('../controllers/me.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', authMiddleware, meController.me);

module.exports = router;