const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();

  logger.info('Request started', {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip
  });

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    logger.info('Request completed', {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Number(durationMs.toFixed(2))
    });
  });

  next();
}

module.exports = requestLogger;
