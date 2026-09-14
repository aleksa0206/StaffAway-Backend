import * as fileStorageService from '../services/fileStorageService';
import { logger } from '../config/logger';
import { prisma } from '../config/prismaClient';

export interface Container {
  fileStorage: typeof fileStorageService;
  logger: typeof logger;
  prisma: typeof prisma;
}

let container: Container = {
  fileStorage: fileStorageService,
  logger,
  prisma,
};

export function getContainer(): Container {
  return container;
}

export function setContainer(overrides: Partial<Container>): void {
  container = { ...container, ...overrides };
}

export function resetContainer(): void {
  container = { fileStorage: fileStorageService, logger, prisma };
}
