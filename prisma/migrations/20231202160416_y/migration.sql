/*
  Warnings:

  - Made the column `email` on table `Investor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `Investor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `Investor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `DoB` on table `Investor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `Investor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `country` on table `Investor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fullName` on table `Investor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `industry` on table `Investor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `investmentType` on table `Investor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `occupation` on table `Investor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Investor` MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `password` VARCHAR(191) NOT NULL,
    MODIFY `phone` VARCHAR(191) NOT NULL,
    MODIFY `DoB` DATETIME(3) NOT NULL,
    MODIFY `city` VARCHAR(191) NOT NULL,
    MODIFY `country` VARCHAR(191) NOT NULL,
    MODIFY `fullName` VARCHAR(191) NOT NULL,
    MODIFY `industry` VARCHAR(191) NOT NULL,
    MODIFY `investmentType` VARCHAR(191) NOT NULL,
    MODIFY `occupation` VARCHAR(191) NOT NULL;
