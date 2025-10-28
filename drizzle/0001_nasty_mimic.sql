CREATE TABLE `atualizacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` enum('manual','automatica') NOT NULL,
	`status` enum('sucesso','erro','parcial') NOT NULL,
	`vendedoresAtualizados` int DEFAULT 0,
	`totalRegistros` int DEFAULT 0,
	`mensagem` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `atualizacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `metricas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendedorId` int NOT NULL,
	`mes` varchar(20) NOT NULL,
	`totalVendas` int NOT NULL DEFAULT 0,
	`totalReceita` int NOT NULL DEFAULT 0,
	`comissaoTotal` int NOT NULL DEFAULT 0,
	`percentualReceita` int NOT NULL DEFAULT 0,
	`status` enum('com_dados','sem_dados') NOT NULL DEFAULT 'sem_dados',
	`dataExtracao` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `metricas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendedores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`sheetId` varchar(100) NOT NULL,
	`ativo` boolean NOT NULL DEFAULT true,
	`dataEntrada` timestamp NOT NULL,
	`metaMensal` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendedores_id` PRIMARY KEY(`id`),
	CONSTRAINT `vendedores_sheetId_unique` UNIQUE(`sheetId`)
);
