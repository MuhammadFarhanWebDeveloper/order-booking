/*
  Warnings:

  - You are about to alter the column `category` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - You are about to alter the column `unit` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.

*/
-- AlterTable
ALTER TABLE `Product` MODIFY `category` ENUM('ELECTRONICS', 'GROCERY', 'CLOTHING', 'STATIONERY', 'BEAUTY', 'FURNITURE', 'TOYS', 'MEDICINE', 'OTHER') NOT NULL,
    MODIFY `unit` ENUM('PIECE', 'GRAM', 'KILOGRAM', 'LITRE', 'MILLILITRE', 'METER', 'CENTIMETER', 'BOX', 'PACK') NOT NULL;
