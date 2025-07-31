/*
  Warnings:

  - You are about to drop the column `clerkId` on the `Customer` table. All the data in the column will be lost.
  - Added the required column `clerkId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Customer` DROP COLUMN `clerkId`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `clerkId` VARCHAR(191) NOT NULL;
