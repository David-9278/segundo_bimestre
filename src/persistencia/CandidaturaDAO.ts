import { prisma } from "../config/database";
import { Candidatura } from "../dominio/Candidatura";
import { Vaga } from "../dominio/Vaga";

export interface CandidaturaComVaga {
  candidatura: Candidatura;
  vaga: Vaga;
  empresaNome: string;
}

export interface CandidaturaComProfissional {
  candidatura: Candidatura;
  profissional: {
    id: number;
    nome: string;
    funcao: string;
    cidade: string | null;
    anosExperiencia: number;
    notaMedia: number | null;
  };
}

class AceiteConcorrente extends Error {}

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

  async listarPorVaga(vagaId: number): Promise<CandidaturaComProfissional[]> {
    const registros = await prisma.candidatura.findMany({
      where: { vagaId },
      include: {
        profissional: {
          select: {
            id: true,
            nome: true,
            funcao: true,
            cidade: true,
            anosExperiencia: true,
            notaMedia: true,
          },
        },
      },
      orderBy: { criadoEm: "asc" },
    });
    return registros.map((registro) => ({
      candidatura: this.mapearParaDominio(registro),
      profissional: registro.profissional,
    }));
  }

  async listarPorProfissional(
    profissionalId: number,
    status?: string,
  ): Promise<CandidaturaComVaga[]> {
    const registros = await prisma.candidatura.findMany({
      where: status ? { profissionalId, status } : { profissionalId },
      include: { vaga: { include: { empresa: { select: { nome: true } } } } },
      orderBy: { criadoEm: "desc" },
    });

    return registros.map((registro: any) => ({
      candidatura: this.mapearParaDominio(registro),
      empresaNome: registro.vaga.empresa.nome,
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

  async recusarSePendente(candidatura: Candidatura): Promise<Candidatura | null> {
    if (candidatura.id == null) {
      throw new Error("Candidatura deve ter um ID para ser atualizada.");
    }

    const resposta = await prisma.candidatura.updateMany({
      where: { id: candidatura.id, status: "enviado" },
      data: {
        status: candidatura.status,
        dataResposta: candidatura.dataResposta,
      },
    });
    if (resposta.count !== 1) return null;

    const registro = await prisma.candidatura.findUniqueOrThrow({
      where: { id: candidatura.id },
    });
    return this.mapearParaDominio(registro);
  }

  async confirmarAceite(candidatura: Candidatura): Promise<Candidatura | null> {
    if (candidatura.id == null) {
      throw new Error("Candidatura deve ter um ID para ser atualizada.");
    }

    try {
      return await prisma.$transaction(async (tx) => {
        const resposta = await tx.candidatura.updateMany({
          where: { id: candidatura.id, status: "enviado" },
          data: {
            status: candidatura.status,
            dataResposta: candidatura.dataResposta,
          },
        });
        if (resposta.count !== 1) throw new AceiteConcorrente();

        const vagaPreenchida = await tx.vaga.updateMany({
          where: { id: candidatura.vagaId, status: "aberta" },
          data: { status: "preenchida" },
        });
        if (vagaPreenchida.count !== 1) throw new AceiteConcorrente();

        const profissionalReservado = await tx.profissional.updateMany({
          where: { id: candidatura.profissionalId, disponivel: true },
          data: { disponivel: false },
        });
        if (profissionalReservado.count !== 1) throw new AceiteConcorrente();

        await tx.candidatura.updateMany({
          where: {
            vagaId: candidatura.vagaId,
            id: { not: candidatura.id },
            status: "enviado",
          },
          data: { status: "expirada" },
        });

        const registro = await tx.candidatura.findUniqueOrThrow({
          where: { id: candidatura.id },
        });
        return this.mapearParaDominio(registro);
      });
    } catch (erro) {
      if (erro instanceof AceiteConcorrente) return null;
      throw erro;
    }
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
