/*
  Warnings:

  - The primary key for the `Investor` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `Investor` DROP PRIMARY KEY,
    ADD PRIMARY KEY (`Username`);
