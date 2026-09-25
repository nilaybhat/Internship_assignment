const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

app.disable('x-powered-by');

app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((o) => o.trim()),
  })
);
app.use(express.json({ limit: '10kb' }));

/** Friendly landing response so hitting the API root in a browser isn't a raw 404. */
app.get('/', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    message: 'Task Tracker API is running.',
    docs: '/api/health',
    frontend: 'http://localhost:5173',
  });
});

/** Liveness/readiness probe for deployments and monitoring. */
app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok', uptime: process.uptime() });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;