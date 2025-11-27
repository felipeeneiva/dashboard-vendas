CREATE TABLE `fornecedores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendedorId` int NOT NULL,
	`mes` varchar(20) NOT NULL,
	`operadora` varchar(200) NOT NULL,
	`operadoraNormalizada` varchar(200) NOT NULL,
	`tarifa` int NOT NULL DEFAULT 0,
	`taxa` int NOT NULL DEFAULT 0,
	`duTebOver` int NOT NULL DEFAULT 0,
	`incentivo` int NOT NULL DEFAULT 0,
	`valorTotal` int NOT NULL DEFAULT 0,
	`dataExtracao` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fornecedores_id` PRIMARY KEY(`id`),
	CONSTRAINT `operadoraNormalizada_idx` UNIQUE(`operadoraNormalizada`,`mes`,`vendedorId`)
);
