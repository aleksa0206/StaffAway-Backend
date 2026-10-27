import { env } from './config/env';
import app from './app';
import { logger } from './config/logger';
import { prisma } from './config/prismaClient';
import * as rateLimitRepository from './repositories/rateLimitRepository';
import * as refreshTokenRepository from './repositories/refreshTokenRepository';

const port = env.PORT;

const server = app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});

async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await prisma.$disconnect();
    logger.info('Prisma connection closed.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown: timeout exceeded.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// The process is in an unknown state after these: log why, exit, and let Docker restart it.
function crash(kind: string, err: unknown) {
  logger.fatal({ err }, kind);
  process.exit(1);
}
process.on('unhandledRejection', (err) => crash('Unhandled promise rejection', err));
process.on('uncaughtException', (err) => crash('Uncaught exception', err));

// Expired rows are never read again; without this both tables only grow.
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
setInterval(() => {
  Promise.all([rateLimitRepository.cleanupExpired(), refreshTokenRepository.deleteExpired()]).catch(
    (err) => logger.error({ err }, 'Cleanup of expired rows failed')
  );
}, CLEANUP_INTERVAL_MS).unref();
