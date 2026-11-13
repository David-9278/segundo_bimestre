import { prisma } from "../config/database";
import { Vaga, type StatusVaga } from "../dominio/Vaga";

export class VagaDAO {
  async criar(vaga: Vaga): Promise<Vaga> {
    const registro = await prisma.vaga.create({
      data: {
        empresaId: vaga.empresaId,
        titulo: vaga.titulo,
        descricao: vaga.descricao,
        dataVaga: vaga.dataVaga,
        horaInicio: vaga.horaInicio,
        duracaoHoras: vaga.duracaoHoras,
        valorHora: vaga.valorHora,
        endereco: vaga.endereco,
        status: vaga.status,
      },
    });

    return this.mapearParaDominio(registro);
  }

 async pesquisarAbertas(termo: string = ""): Promise<Vaga[]> {
    // Cada palavra precisa aparecer em algum campo; palavras curtas ("em", "de") são ignoradas.
    const palavras = termo.split(/\s+/).filter(Boolean);
    const uteis = palavras.filter((p) => p.length > 2);
    const buscadas = uteis.length > 0 ? uteis : palavras;

    const pesquisa = buscadas.length
      ? {
          AND: buscadas.map((palavra) => ({
            OR: [
              { titulo: { contains: palavra } },
              { descricao: { contains: palavra } },
              { endereco: { contains: palavra } },
            ],
          })),
        }
      : {};

    const registros = await prisma.vaga.findMany({
      where: { status: "aberta", ...pesquisa },
      orderBy: { criadoEm: "desc" },
    });
    return registros.map((registro) => this.mapearParaDominio(registro));
  }

  async listarPorEmpresa(empresaId: number): Promise<Vaga[]> {
    const registros = await prisma.vaga.findMany({
      where: { empresaId },
      orderBy: { criadoEm: "desc" },
    });
    return registros.map((registro) => this.mapearParaDominio(registro));
  }

  async listarTodas(): Promise<Vaga[]> {
    const registros = await prisma.vaga.findMany();
    return registros.map((registro) => this.mapearParaDominio(registro));
  }

  async buscarPorId(id: number): Promise<Vaga | null> {
    const registro = await prisma.vaga.findUnique({ where: { id } });
    return registro ? this.mapearParaDominio(registro) : null;
  }

  async atualizar(vaga: Vaga): Promise<Vaga> {
    if (vaga.id == null) {
      throw new Error("Vaga deve ter um ID para ser atualizada.");
    }

    const registro = await prisma.vaga.update({
      where: { id: vaga.id },
      data: {
        titulo: vaga.titulo,
        descricao: vaga.descricao,
        dataVaga: vaga.dataVaga,
        horaInicio: vaga.horaInicio,
        duracaoHoras: vaga.duracaoHoras,
        valorHora: vaga.valorHora,
        endereco: vaga.endereco,
        status: vaga.status,
      },
    });

    return this.mapearParaDominio(registro);
  }

  async transicionarStatus(vaga: Vaga, statusAnterior: StatusVaga): Promise<Vaga | null> {
    if (vaga.id == null) {
      throw new Error("Vaga deve ter um ID para ser atualizada.");
    }

    return prisma.$transaction(async (tx) => {
      const resultado = await tx.vaga.updateMany({
        where: { id: vaga.id, status: statusAnterior },
        data: { status: vaga.status },
      });
      if (resultado.count !== 1) return null;

      if (vaga.status === "cancelada") {
        await tx.candidatura.updateMany({
          where: { vagaId: vaga.id, status: "enviado" },
          data: { status: "expirada" },
        });
      }

      if (vaga.status === "cancelada" || vaga.status === "concluida") {
        const contratacao = await tx.candidatura.findFirst({
          where: { vagaId: vaga.id, status: "aceita" },
          select: { profissionalId: true },
        });
        if (contratacao) {
          await tx.profissional.update({
            where: { id: contratacao.profissionalId },
            data: { disponivel: true },
          });
        }
      }

      const registro = await tx.vaga.findUniqueOrThrow({ where: { id: vaga.id } });
      return this.mapearParaDominio(registro);
    });
  }

  async remover(id: number): Promise<boolean> {
    await prisma.vaga.delete({ where: { id } });
    return true;
  }

  private mapearParaDominio(registro: any): Vaga {
    return new Vaga(
      registro.empresaId,
      registro.titulo,
      registro.dataVaga,
      registro.horaInicio,
      registro.duracaoHoras,
      registro.valorHora,
      registro.descricao,
      registro.endereco,
      registro.status,
      registro.id,
      registro.criadoEm,
    );
  }
}
