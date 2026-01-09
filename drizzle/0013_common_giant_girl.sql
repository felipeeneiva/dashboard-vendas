ALTER TABLE `vendedores` ADD `openId` varchar(64);--> statement-breakpoint
ALTER TABLE `vendedores` ADD CONSTRAINT `vendedores_openId_unique` UNIQUE(`openId`);