const logger = require('../utils/logger');

function apiNotFound(req, res) {
  logger.warn('API route not found', {
    method: req.method,
    path: req.originalUrl
  });

  return res.status(404).json({ error: 'API route not found.' });
}

module.exports = apiNotFound;
