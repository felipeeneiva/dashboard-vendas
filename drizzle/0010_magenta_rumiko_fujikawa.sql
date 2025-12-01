CREATE TABLE `metas_trimestrais` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendedorId` int NOT NULL,
	`trimestre` varchar(50) NOT NULL,
	`metaTrimestral` int NOT NULL,
	`superMeta` int NOT NULL,
	`bonusMeta` int NOT NULL,
	`bonusSuperMeta` int NOT NULL,
	`metaAgencia` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `metas_trimestrais_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_vendedor_trimestre` UNIQUE(`vendedorId`,`trimestre`)
);
--> statement-breakpoint
ALTER TABLE `metas_trimestrais` ADD CONSTRAINT `metas_trimestrais_vendedorId_vendedores_id_fk` FOREIGN KEY (`vendedorId`) REFERENCES `vendedores`(`id`) ON DELETE no action ON UPDATE no action;