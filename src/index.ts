import app from './app';
import { logger } from './config/logger';
import { prisma } from './config/prismaClient';

const port = process.env.PORT;

const server = app.listen(port, () => {
  logger.info(`server radi na portu ${port}`);
});

async function shutdown(signal: string) {
  logger.info(`${signal} primljen, gasim server...`);
  server.close(async () => {
    logger.info('HTTP server zatvoren.');
    await prisma.$disconnect();
    logger.info('Prisma konekcija zatvorena.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Prinudno gasenje - timeout istekao.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));