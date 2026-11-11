import { prisma } from "../config/database";
import { Vaga } from "../dominio/Vaga";

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
    const pesquisa = termo
      ? {
          OR: [
            { titulo: { contains: termo } },
            { descricao: { contains: termo } },
            { endereco: { contains: termo } },
          ],
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

 async preencherSeAberta(id: number): Promise<boolean> {
    const resultado = await prisma.vaga.updateMany({
      where: { id, status: "aberta" },
      data: { status: "preenchida" },
    });
    return resultado.count === 1;
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
