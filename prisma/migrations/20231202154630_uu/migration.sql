/*
  Warnings:

  - You are about to drop the column `cccupation` on the `Investor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Investor` DROP COLUMN `cccupation`,
    ADD COLUMN `occupation` VARCHAR(191) NULL;
