-- AlterTable
ALTER TABLE `Investor` MODIFY `email` VARCHAR(191) NULL,
    MODIFY `password` VARCHAR(191) NULL,
    MODIFY `phone` VARCHAR(191) NULL,
    MODIFY `DoB` DATETIME(3) NULL,
    MODIFY `cccupation` VARCHAR(191) NULL,
    MODIFY `city` VARCHAR(191) NULL,
    MODIFY `country` VARCHAR(191) NULL,
    MODIFY `fullName` VARCHAR(191) NULL,
    MODIFY `industry` VARCHAR(191) NULL,
    MODIFY `investmentType` VARCHAR(191) NULL;
