-- AlterTable
ALTER TABLE `User` ADD COLUMN `emailVerificationExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `emailVerificationTokenHash` VARCHAR(191) NULL,
    ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT true;
