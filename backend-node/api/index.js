// Serverless adapter entry for Vercel
// Wraps the existing Express app into a serverless handler

const serverless = require('serverless-http');
const app = require('../app');

module.exports = (req, res) => {
  // Ensure trust proxy and JSON limits are appropriate for serverless
  app.set('trust proxy', 1);
  const handler = serverless(app);
  return handler(req, res);
};