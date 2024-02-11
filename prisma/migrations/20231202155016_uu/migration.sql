/*
  Warnings:

  - You are about to alter the column `DoB` on the `Investor` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `Investor` MODIFY `DoB` DATETIME(3) NULL;
