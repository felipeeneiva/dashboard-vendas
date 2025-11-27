CREATE TABLE `vendas_diarias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendedorId` int NOT NULL,
	`dataVenda` timestamp NOT NULL,
	`nomePassageiros` text NOT NULL,
	`valorTotal` int NOT NULL,
	`destino` varchar(255),
	`mes` varchar(20) NOT NULL,
	`ano` int NOT NULL,
	`dataExtracao` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vendas_diarias_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_venda` UNIQUE(`vendedorId`,`dataVenda`,`nomePassageiros`)
);
--> statement-breakpoint
ALTER TABLE `vendas_diarias` ADD CONSTRAINT `vendas_diarias_vendedorId_vendedores_id_fk` FOREIGN KEY (`vendedorId`) REFERENCES `vendedores`(`id`) ON DELETE no action ON UPDATE no action;