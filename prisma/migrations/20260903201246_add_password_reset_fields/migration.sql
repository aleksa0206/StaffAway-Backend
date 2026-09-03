-- AlterTable
ALTER TABLE `user` ADD COLUMN `resetPasswordExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `resetPasswordTokenHash` VARCHAR(191) NULL;
