/*
  Warnings:

  - Added the required column `clerkId` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Customer` ADD COLUMN `clerkId` VARCHAR(191) NOT NULL;
