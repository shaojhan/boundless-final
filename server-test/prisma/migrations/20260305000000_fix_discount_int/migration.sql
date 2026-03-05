-- AlterTable: change discount from TINYINT to INT
ALTER TABLE `order_total` MODIFY COLUMN `discount` INT NOT NULL DEFAULT 0;
