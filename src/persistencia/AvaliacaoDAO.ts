import { prisma } from "../config/database";
import { Avaliacao } from "../dominio/Avaliacao";

export class AvaliacaoDAO {
  async criar(avaliacao: Avaliacao): Promise<Avaliacao> {
    const registro = await prisma.avaliacao.create({
      data: {
        vagaId: avaliacao.vagaId,
        avaliadorTipo: avaliacao.avaliadorTipo,
        nota: avaliacao.nota,
        comentario: avaliacao.comentario,
      },
    });

    return this.mapearParaDominio(registro);
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

  async calcularMediaDoProfissional(profissionalId: number): Promise<number> {
    const aceitas = await prisma.candidatura.findMany({
      where: { profissionalId, status: "aceita" },
      select: { vagaId: true },
    });
    const vagaIds = aceitas.map((c) => c.vagaId);
    if (vagaIds.length === 0) return 0;

    const resultado = await prisma.avaliacao.aggregate({
      _avg: { nota: true },
      where: { vagaId: { in: vagaIds }, avaliadorTipo: "EMPRESA" },
    });
    const media = resultado._avg.nota ?? 0;
    return Math.round(media * 10) / 10;
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
