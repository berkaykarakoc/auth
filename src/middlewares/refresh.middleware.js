const ServerError = require('../errors/server.error');
const { verifyRefreshToken, TokenType } = require('../services/jwt.service');

//import redisService from "../services/redis.service.js";

function refreshMiddleware(req, res, next) {
  if (req.headers?.cookie?.includes('refreshToken')) {
    const token = req.headers.cookie.split('refreshToken=')[1];
    try {
      const decoded = verifyRefreshToken(token);
      if (
        decoded.type !== TokenType.REFRESH_TOKEN
      ) {
        next(new ServerError(401, "Invalid token type"));
      }
      // const value = await redisService.get(token);
      // if (value) {
      //   next(new ServerError(401, "Refresh token was already used"));
      // }
      req.email = decoded.sub;
      return next();
    } catch (err) {
      next(new ServerError(401, "Invalid jwt token"));
    }
  }
  next(new ServerError(400, "Refresh token is not present"));
};

module.exports = {
  refreshMiddleware
};