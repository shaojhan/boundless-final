-- ============================================================
-- Migration: add_fk_relations
-- 1. Add UNIQUE constraints on non-PK columns used as FK targets
-- 2. Fix legacy sentinel 0 values → NULL before adding FKs
-- 3. Remove orphaned order_items with no matching order_total
-- 4. Add all FOREIGN KEY constraints across tables
-- ============================================================

-- AddUniqueConstraint: user.uid, jam.juid, order_total.ouid
ALTER TABLE `user` ADD UNIQUE INDEX `user_uid_key`(`uid`);
ALTER TABLE `jam` ADD UNIQUE INDEX `jam_juid_key`(`juid`);
ALTER TABLE `order_total` ADD UNIQUE INDEX `order_total_ouid_key`(`ouid`);

-- Fix legacy sentinel 0 values → NULL (before adding FKs)
UPDATE `instrument_category` SET `parent_id` = NULL WHERE `parent_id` = 0;
UPDATE `product` SET `instrument_category_id` = NULL WHERE `instrument_category_id` = 0;
UPDATE `product` SET `lesson_category_id` = NULL WHERE `lesson_category_id` = 0;
UPDATE `product` SET `teacher_id` = NULL WHERE `teacher_id` = 0;
UPDATE `product` SET `brand_id` = NULL WHERE `brand_id` NOT IN (SELECT id FROM `brand`);

-- Remove orphaned order_items (ouid not found in order_total)
DELETE FROM `order_item` WHERE `ouid` NOT IN (SELECT `ouid` FROM `order_total`);

-- AddForeignKey: article
ALTER TABLE `article` ADD CONSTRAINT `article_category_id_fkey`
  FOREIGN KEY (`category_id`) REFERENCES `article_category`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `article` ADD CONSTRAINT `article_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: article_comment
ALTER TABLE `article_comment` ADD CONSTRAINT `article_comment_article_id_fkey`
  FOREIGN KEY (`article_id`) REFERENCES `article`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `article_comment` ADD CONSTRAINT `article_comment_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: article_comment_like
ALTER TABLE `article_comment_like` ADD CONSTRAINT `article_comment_like_article_comment_id_fkey`
  FOREIGN KEY (`article_comment_id`) REFERENCES `article_comment`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `article_comment_like` ADD CONSTRAINT `article_comment_like_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: category (self-referencing)
ALTER TABLE `category` ADD CONSTRAINT `category_parent_id_fkey`
  FOREIGN KEY (`parent_id`) REFERENCES `category`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: coupon
ALTER TABLE `coupon` ADD CONSTRAINT `coupon_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `coupon` ADD CONSTRAINT `coupon_coupon_template_id_fkey`
  FOREIGN KEY (`coupon_template_id`) REFERENCES `coupon_template`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: favorite
ALTER TABLE `favorite` ADD CONSTRAINT `favorite_pid_fkey`
  FOREIGN KEY (`pid`) REFERENCES `product`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `favorite` ADD CONSTRAINT `favorite_uid_fkey`
  FOREIGN KEY (`uid`) REFERENCES `user`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: instrument_category (self-referencing)
ALTER TABLE `instrument_category` ADD CONSTRAINT `instrument_category_parent_id_fkey`
  FOREIGN KEY (`parent_id`) REFERENCES `instrument_category`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: jam_apply → jam.juid
ALTER TABLE `jam_apply` ADD CONSTRAINT `jam_apply_juid_fkey`
  FOREIGN KEY (`juid`) REFERENCES `jam`(`juid`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: order_item → order_total.ouid + product
ALTER TABLE `order_item` ADD CONSTRAINT `order_item_ouid_fkey`
  FOREIGN KEY (`ouid`) REFERENCES `order_total`(`ouid`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `order_item` ADD CONSTRAINT `order_item_product_id_fkey`
  FOREIGN KEY (`product_id`) REFERENCES `product`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: otp
ALTER TABLE `otp` ADD CONSTRAINT `otp_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: product → category tables (SET NULL since columns are nullable)
ALTER TABLE `product` ADD CONSTRAINT `product_instrument_category_id_fkey`
  FOREIGN KEY (`instrument_category_id`) REFERENCES `instrument_category`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `product` ADD CONSTRAINT `product_lesson_category_id_fkey`
  FOREIGN KEY (`lesson_category_id`) REFERENCES `lesson_category`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `product` ADD CONSTRAINT `product_brand_id_fkey`
  FOREIGN KEY (`brand_id`) REFERENCES `brand`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `product` ADD CONSTRAINT `product_teacher_id_fkey`
  FOREIGN KEY (`teacher_id`) REFERENCES `teacher_info`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: product_color
ALTER TABLE `product_color` ADD CONSTRAINT `product_color_pid_fkey`
  FOREIGN KEY (`pid`) REFERENCES `product`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `product_color` ADD CONSTRAINT `product_color_cid_fkey`
  FOREIGN KEY (`cid`) REFERENCES `color`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: product_review
ALTER TABLE `product_review` ADD CONSTRAINT `product_review_product_id_fkey`
  FOREIGN KEY (`product_id`) REFERENCES `product`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `product_review` ADD CONSTRAINT `product_review_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: product_review_like
ALTER TABLE `product_review_like` ADD CONSTRAINT `product_review_like_review_id_fkey`
  FOREIGN KEY (`review_id`) REFERENCES `product_review`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `product_review_like` ADD CONSTRAINT `product_review_like_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: product_size
ALTER TABLE `product_size` ADD CONSTRAINT `product_size_pid_fkey`
  FOREIGN KEY (`pid`) REFERENCES `product`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `product_size` ADD CONSTRAINT `product_size_sid_fkey`
  FOREIGN KEY (`sid`) REFERENCES `size`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: product_tag
ALTER TABLE `product_tag` ADD CONSTRAINT `product_tag_pid_fkey`
  FOREIGN KEY (`pid`) REFERENCES `product`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `product_tag` ADD CONSTRAINT `product_tag_tid_fkey`
  FOREIGN KEY (`tid`) REFERENCES `tag`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: purchase_item
ALTER TABLE `purchase_item` ADD CONSTRAINT `purchase_item_order_id_fkey`
  FOREIGN KEY (`order_id`) REFERENCES `purchase_order`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `purchase_item` ADD CONSTRAINT `purchase_item_product_id_fkey`
  FOREIGN KEY (`product_id`) REFERENCES `product`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: purchase_order
ALTER TABLE `purchase_order` ADD CONSTRAINT `purchase_order_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: refresh_token
ALTER TABLE `refresh_token` ADD CONSTRAINT `refresh_token_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;
