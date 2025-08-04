const ServerError = require('../errors/server.error');
const { verifyAccessToken, TokenType } = require('../services/jwt.service');

function authMiddleware(req, res, next) {
  if (req.headers.authorization) {
    const [bearerToken, token] = req.headers.authorization.split(" ");
    if (bearerToken === "Bearer") {
      try {
        const decoded = verifyAccessToken(token);
        if (
          decoded.type !== TokenType.ACCESS_TOKEN
        ) {
          next(new ServerError(401, "Invalid token type"));
        }
        req.email = decoded.sub;
        return next();
      } catch (err) {
        next(new ServerError(401, "Invalid access token"));
      }
    }
    next(new ServerError(401, "Invalid bearer token"));
  }
  next(new ServerError(400, "Authorization header is not present"));
};

module.exports = {
  authMiddleware
};