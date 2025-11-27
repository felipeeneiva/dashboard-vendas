ALTER TABLE `fornecedores` DROP INDEX `operadoraNormalizada_idx`;--> statement-breakpoint
ALTER TABLE `vendas_diarias` MODIFY COLUMN `nomePassageiros` varchar(255) NOT NULL;--> statement-breakpoint
CREATE INDEX `operadoraNormalizada_idx` ON `fornecedores` (`operadoraNormalizada`,`mes`,`vendedorId`);