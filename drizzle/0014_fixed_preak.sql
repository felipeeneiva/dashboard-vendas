ALTER TABLE `vendedores` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `vendedores` ADD `primeiroAcesso` boolean DEFAULT true NOT NULL;