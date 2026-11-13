ALTER TABLE "profissionais"
ADD COLUMN "categoria" TEXT;

CREATE UNIQUE INDEX "avaliacoes_vaga_id_avaliador_tipo_key"
ON "avaliacoes"("vaga_id", "avaliador_tipo");
