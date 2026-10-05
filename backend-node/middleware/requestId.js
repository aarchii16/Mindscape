const crypto = require('crypto');

/**
 * Attach a correlation ID to each request and expose it via req.id
 * Also reads incoming X-Request-ID if provided.
 */
module.exports = function requestId(req, res, next) {
  const headerId = req.headers['x-request-id'];
  const id = typeof headerId === 'string' && headerId.trim() ? headerId.trim() : crypto.randomUUID();
  req.id = id;
  res.setHeader('X-Request-ID', id);
  next();
};