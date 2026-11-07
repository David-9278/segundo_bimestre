-- CreateTable
CREATE TABLE "empresas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "telefone" TEXT,
    "cidade" TEXT,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "profissionais" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cpd" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "telefone" TEXT,
    "funcap" TEXT NOT NULL,
    "anos_experiencia" INTEGER NOT NULL DEFAULT 0,
    "nota_media" REAL DEFAULT 0.0,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "vagas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "empresa_id" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "data_vaga" DATETIME NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "duracao_horas" INTEGER NOT NULL,
    "valor_hora" REAL NOT NULL,
    "endereco" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aberta',
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vagas_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "candidaturas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vaga_id" INTEGER NOT NULL,
    "profissional_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'enviado',
    "data_resposta" DATETIME,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "candidaturas_vaga_id_fkey" FOREIGN KEY ("vaga_id") REFERENCES "vagas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "candidaturas_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "profissionais" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vaga_id" INTEGER NOT NULL,
    "avaliador_tipo" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "avaliacoes_vaga_id_fkey" FOREIGN KEY ("vaga_id") REFERENCES "vagas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_cnpj_key" ON "empresas"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_email_key" ON "empresas"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profissionais_cpd_key" ON "profissionais"("cpd");

-- CreateIndex
CREATE UNIQUE INDEX "profissionais_email_key" ON "profissionais"("email");

-- CreateIndex
CREATE UNIQUE INDEX "candidaturas_vaga_id_profissional_id_key" ON "candidaturas"("vaga_id", "profissional_id");
