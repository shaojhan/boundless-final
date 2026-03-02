-- CreateTable
CREATE TABLE `article` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `auid` VARCHAR(16) NOT NULL,
    `title` VARCHAR(40) NOT NULL,
    `content` TEXT NOT NULL,
    `img` VARCHAR(100) NOT NULL,
    `category_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `state` TINYINT NOT NULL,
    `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `valid` TINYINT NOT NULL DEFAULT 1,
    `updated_time` DATETIME(3) NULL,
    `published_time` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `article_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(4) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `article_comment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `article_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `content` TEXT NOT NULL,
    `likes` INTEGER NOT NULL,
    `created_time` DATETIME(3) NOT NULL,
    `updated_time` DATETIME(3) NULL,
    `valid` TINYINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `article_comment_like` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `article_comment_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_time` DATETIME(3) NOT NULL,
    `updated_time` DATETIME(3) NULL,
    `valid` TINYINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brand` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(20) NOT NULL,
    `valid` TINYINT NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `parent_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `color` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupon` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `coupon_template_id` INTEGER NOT NULL,
    `created_time` DATETIME(3) NOT NULL,
    `valid` TINYINT NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupon_template` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(20) NOT NULL,
    `discount` DOUBLE NOT NULL,
    `kind` TINYINT NOT NULL,
    `type` TINYINT NOT NULL,
    `coupon_code` VARCHAR(12) NOT NULL,
    `requirement` INTEGER NULL,
    `created_time` DATETIME(3) NOT NULL,
    `onshelf_time` DATETIME(3) NOT NULL,
    `left_time` INTEGER NULL,
    `limit_time` DATETIME(3) NULL,
    `valid` TINYINT NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorite` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pid` INTEGER NOT NULL,
    `uid` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `genre` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(10) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instrument_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `parent_id` INTEGER NULL,
    `name` VARCHAR(10) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jam` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `juid` VARCHAR(16) NOT NULL,
    `former` VARCHAR(30) NOT NULL,
    `member` VARCHAR(200) NULL DEFAULT '[]',
    `name` VARCHAR(100) NULL,
    `cover_img` VARCHAR(60) NULL,
    `introduce` TEXT NULL,
    `works_link` TEXT NULL,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `degree` TINYINT NOT NULL,
    `genre` VARCHAR(12) NOT NULL,
    `players` VARCHAR(12) NOT NULL,
    `region` VARCHAR(12) NOT NULL,
    `band_condition` TEXT NULL,
    `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_time` DATETIME(3) NULL,
    `formed_time` DATETIME(3) NULL,
    `state` TINYINT NOT NULL DEFAULT 0,
    `valid` TINYINT NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jam_apply` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `juid` VARCHAR(16) NOT NULL,
    `former_uid` VARCHAR(16) NOT NULL,
    `applier_uid` VARCHAR(16) NOT NULL,
    `applier_play` INTEGER NOT NULL,
    `message` TEXT NOT NULL,
    `state` INTEGER NOT NULL DEFAULT 0,
    `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `valid` TINYINT NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lesson_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(6) NOT NULL,
    `valid` TINYINT NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `ouid` VARCHAR(16) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_total` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(20) NOT NULL,
    `payment` INTEGER NOT NULL,
    `transportation_state` VARCHAR(6) NOT NULL,
    `phone` VARCHAR(10) NOT NULL,
    `discount` TINYINT NOT NULL,
    `postcode` INTEGER NOT NULL,
    `country` VARCHAR(60) NOT NULL,
    `township` VARCHAR(60) NOT NULL,
    `address` VARCHAR(60) NOT NULL,
    `created_time` DATETIME(3) NOT NULL,
    `ouid` VARCHAR(16) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `otp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `exp_timestamp` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `player` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(10) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `puid` VARCHAR(12) NULL,
    `type` INTEGER NULL,
    `name` VARCHAR(50) NULL,
    `price` INTEGER NULL,
    `discount` DECIMAL(2, 1) NULL,
    `discount_state` INTEGER NULL,
    `instrument_category_id` INTEGER NULL,
    `lesson_category_id` INTEGER NULL,
    `brand_id` INTEGER NULL,
    `teacher_id` INTEGER NULL,
    `img` VARCHAR(150) NULL,
    `img_small` VARCHAR(50) NULL,
    `info` VARCHAR(572) NULL,
    `outline` VARCHAR(552) NULL,
    `achievement` VARCHAR(306) NULL,
    `suitable` VARCHAR(197) NULL,
    `homework` INTEGER NULL,
    `length` INTEGER NULL,
    `specs` VARCHAR(347) NULL,
    `stock` INTEGER NULL,
    `sales` INTEGER NULL,
    `created_time` VARCHAR(19) NULL,
    `onshelf_time` VARCHAR(19) NULL,
    `updated_time` VARCHAR(19) NULL,
    `valid` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_color` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pid` INTEGER NOT NULL,
    `cid` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_review` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `content` TEXT NULL,
    `stars` TINYINT NOT NULL,
    `likes` INTEGER NULL,
    `created_time` DATETIME(3) NOT NULL,
    `updated_time` DATETIME(3) NULL,
    `valid` TINYINT NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_review_like` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `review_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_time` DATETIME(3) NOT NULL,
    `updated_time` DATETIME(3) NULL,
    `valid` TINYINT NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_size` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pid` INTEGER NOT NULL,
    `sid` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_tag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pid` INTEGER NOT NULL,
    `tid` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` VARCHAR(255) NOT NULL,
    `product_id` INTEGER NOT NULL,
    `quantity` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_order` (
    `id` VARCHAR(255) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `amount` INTEGER NULL,
    `transaction_id` VARCHAR(255) NULL,
    `payment` VARCHAR(255) NULL,
    `shipping` VARCHAR(255) NULL,
    `status` VARCHAR(255) NULL,
    `order_info` TEXT NULL,
    `reservation` TEXT NULL,
    `confirm` TEXT NULL,
    `return_code` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `size` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teacher_info` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(25) NOT NULL,
    `img` VARCHAR(100) NOT NULL,
    `info` TEXT NOT NULL,
    `valid` TINYINT NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(16) NOT NULL,
    `name` VARCHAR(25) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `password` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(10) NULL,
    `postcode` INTEGER NULL,
    `country` VARCHAR(20) NULL,
    `township` VARCHAR(20) NULL,
    `address` VARCHAR(100) NULL,
    `birthday` DATE NOT NULL,
    `genre_like` VARCHAR(10) NULL,
    `play_instrument` VARCHAR(10) NULL,
    `info` VARCHAR(500) NULL,
    `img` VARCHAR(100) NULL,
    `gender` VARCHAR(10) NULL,
    `nickname` VARCHAR(100) NULL,
    `google_uid` VARCHAR(100) NULL,
    `photo_url` VARCHAR(255) NULL,
    `privacy` VARCHAR(100) NULL,
    `my_lesson` VARCHAR(100) NULL,
    `my_jam` VARCHAR(16) NULL,
    `created_time` DATETIME(3) NOT NULL,
    `updated_time` DATETIME(3) NOT NULL,
    `valid` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
