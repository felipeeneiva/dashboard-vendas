ALTER TABLE `vendedores` ADD `email` varchar(320);--> statement-breakpoint
ALTER TABLE `vendedores` ADD CONSTRAINT `vendedores_email_unique` UNIQUE(`email`);