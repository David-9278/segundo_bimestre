import { prisma } from "../config/database";
import { Candidatura } from "../dominio/Candidatura";
import { Vaga } from "../dominio/Vaga";

export interface CandidaturaComVaga {
  candidatura: Candidatura;
  vaga: Vaga;
}

export class CandidaturaDAO {
  async criarVarias(candidaturas: Candidatura[]): Promise<Candidatura[]> {
    if (candidaturas.length === 0) return [];

    const registros = await prisma.$transaction(
      candidaturas.map((c) =>
        prisma.candidatura.create({
          data: {
            vagaId: c.vagaId,
            profissionalId: c.profissionalId,
            status: c.status,
          },
        }),
      ),
    );
    return registros.map((registro) => this.mapearParaDominio(registro));
  }

  async buscarPorId(id: number): Promise<Candidatura | null> {
    const registro = await prisma.candidatura.findUnique({ where: { id } });
    return registro ? this.mapearParaDominio(registro) : null;
  }

  async listarPorVaga(vagaId: number): Promise<Candidatura[]> {
    const registros = await prisma.candidatura.findMany({
      where: { vagaId },
      orderBy: { criadoEm: "asc" },
    });
    return registros.map((registro) => this.mapearParaDominio(registro));
  }

  async listarPorProfissional(
    profissionalId: number,
    status?: string,
  ): Promise<CandidaturaComVaga[]> {
    const registros = await prisma.candidatura.findMany({
      where: status ? { profissionalId, status } : { profissionalId },
      include: { vaga: true },
      orderBy: { criadoEm: "desc" },
    });

    return registros.map((registro: any) => ({
      candidatura: this.mapearParaDominio(registro),
      vaga: new Vaga(
        registro.vaga.empresaId,
        registro.vaga.titulo,
        registro.vaga.dataVaga,
        registro.vaga.horaInicio,
        registro.vaga.duracaoHoras,
        registro.vaga.valorHora,
        registro.vaga.descricao,
        registro.vaga.endereco,
        registro.vaga.status,
        registro.vaga.id,
        registro.vaga.criadoEm,
      ),
    }));
  }

  async buscarAceitaPorVaga(vagaId: number): Promise<Candidatura | null> {
    const registro = await prisma.candidatura.findFirst({
      where: { vagaId, status: "aceita" },
    });
    return registro ? this.mapearParaDominio(registro) : null;
  }

  async atualizar(candidatura: Candidatura): Promise<Candidatura> {
    if (candidatura.id == null) {
      throw new Error("Candidatura deve ter um ID para ser atualizada.");
    }

    const registro = await prisma.candidatura.update({
      where: { id: candidatura.id },
      data: {
        status: candidatura.status,
        dataResposta: candidatura.dataResposta,
      },
    });
    return this.mapearParaDominio(registro);
  }

  async confirmarAceite(candidatura: Candidatura): Promise<Candidatura> {
    if (candidatura.id == null) {
      throw new Error("Candidatura deve ter um ID para ser atualizada.");
    }

    const [registro] = await prisma.$transaction([
      prisma.candidatura.update({
        where: { id: candidatura.id },
        data: {
          status: candidatura.status,
          dataResposta: candidatura.dataResposta,
        },
      }),
      prisma.candidatura.updateMany({
        where: {
          vagaId: candidatura.vagaId,
          id: { not: candidatura.id },
          status: "enviado",
        },
        data: { status: "expirada" },
      }),
    ]);
    return this.mapearParaDominio(registro);
  }

  async expirarPendentesDaVaga(vagaId: number): Promise<void> {
    await prisma.candidatura.updateMany({
      where: { vagaId, status: "enviado" },
      data: { status: "expirada" },
    });
  }

  private mapearParaDominio(registro: any): Candidatura {
    return new Candidatura(
      registro.vagaId,
      registro.profissionalId,
      registro.status,
      registro.dataResposta,
      registro.id,
      registro.criadoEm,
    );
  }
}
