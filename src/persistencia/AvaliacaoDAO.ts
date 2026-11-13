import { prisma } from "../config/database";
import { Avaliacao } from "../dominio/Avaliacao";

export class AvaliacaoDAO {
  async criar(avaliacao: Avaliacao): Promise<Avaliacao> {
    return prisma.$transaction(async (tx) => {
      const registro = await tx.avaliacao.create({
        data: {
          vagaId: avaliacao.vagaId,
          avaliadorTipo: avaliacao.avaliadorTipo,
          nota: avaliacao.nota,
          comentario: avaliacao.comentario,
        },
      });

      if (avaliacao.avaliadorTipo === "EMPRESA") {
        const contratacao = await tx.candidatura.findFirst({
          where: { vagaId: avaliacao.vagaId, status: "aceita" },
          select: { profissionalId: true },
        });
        if (contratacao) {
          const vagasDoProfissional = await tx.candidatura.findMany({
            where: { profissionalId: contratacao.profissionalId, status: "aceita" },
            select: { vagaId: true },
          });
          const media = await tx.avaliacao.aggregate({
            _avg: { nota: true },
            where: {
              vagaId: { in: vagasDoProfissional.map(({ vagaId }) => vagaId) },
              avaliadorTipo: "EMPRESA",
            },
          });
          await tx.profissional.update({
            where: { id: contratacao.profissionalId },
            data: { notaMedia: Math.round((media._avg.nota ?? 0) * 10) / 10 },
          });
        }
      }

      return this.mapearParaDominio(registro);
    });
  }

  async listarPorVaga(vagaId: number): Promise<Avaliacao[]> {
    const registros = await prisma.avaliacao.findMany({
      where: { vagaId },
      orderBy: { criadoEm: "asc" },
    });
    return registros.map((registro) => this.mapearParaDominio(registro));
  }

  async buscarPorVagaETipo(
    vagaId: number,
    avaliadorTipo: string,
  ): Promise<Avaliacao | null> {
    const registro = await prisma.avaliacao.findFirst({
      where: { vagaId, avaliadorTipo },
    });
    return registro ? this.mapearParaDominio(registro) : null;
  }

  private mapearParaDominio(registro: any): Avaliacao {
    return new Avaliacao(
      registro.vagaId,
      registro.avaliadorTipo,
      registro.nota,
      registro.comentario,
      registro.id,
      registro.criadoEm,
    );
  }
}
