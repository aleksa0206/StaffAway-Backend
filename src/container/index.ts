import * as fileStorageService from '../services/fileStorageService';
import * as emailService from '../services/emailService';
import { logger } from '../config/logger';
import { prisma } from '../config/prismaClient';

export interface Container {
  fileStorage: typeof fileStorageService;
  email: typeof emailService;
  logger: typeof logger;
  prisma: typeof prisma;
}

let container: Container = {
  fileStorage: fileStorageService,
  email: emailService,
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
  container = { fileStorage: fileStorageService, email: emailService, logger, prisma };
}
