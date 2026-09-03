import app from './app';
import { logger } from './config/logger';
import { prisma } from './config/prismaClient';

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`server radi na portu ${port}`);
});


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
  // ... ostatak nepromenjen
}