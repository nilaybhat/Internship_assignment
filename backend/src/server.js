const app = require('./app');
const prisma = require('./database/prisma');
const env = require('./config/env');
const logger = require('./config/logger');

async function main() {
  await prisma.$connect();
  logger.info(`Connected to database (${env.NODE_ENV})`);

  const server = app.listen(env.PORT, () => {
    logger.info(`Task Tracker API listening on http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received, shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Server closed, connections released');
      process.exit(0);
    });
    // Safety net: force-exit if connections do not drain within 10s.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch(async (err) => {
  logger.error('Failed to start server:', err);
  await prisma.$disconnect();
  process.exit(1);
});