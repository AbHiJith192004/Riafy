const logger = require('../utils/logger');

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  logger.error('Unhandled server error', {
    method: req.method,
    path: req.originalUrl,
    message: error.message,
    stack: error.stack
  });

  return res.status(500).json({
    error: 'Internal server error.'
  });
}

module.exports = errorHandler;
