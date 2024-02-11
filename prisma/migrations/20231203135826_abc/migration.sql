/*
  Warnings:

  - The primary key for the `Investor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Investor` table. All the data in the column will be lost.
  - Added the required column `NID` to the `Investor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Investor` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `NID` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`NID`);
