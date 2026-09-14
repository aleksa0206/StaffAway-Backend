-- CreateIndex (replacement index so the existing companyId foreign key stays valid)
CREATE INDEX `User_companyId_idx` ON `User`(`companyId`);

-- DropIndex
DROP INDEX `User_companyId_email_key` ON `User`;

-- CreateIndex
CREATE UNIQUE INDEX `User_email_key` ON `User`(`email`);
