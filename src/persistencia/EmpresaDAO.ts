import { prisma } from "../config/database";
import { Empresa } from "../dominio/Empresa";
import { Vaga } from "../dominio/Vaga";

export class EmpresaDAO {
  async criar(empresa: Empresa): Promise<Empresa> {
    const registro = await prisma.empresa.create({
      data: {
        nome: empresa.nome,
        cnpj: empresa.cnpj,
        email: empresa.email,
        senha: empresa.senha,
        telefone: empresa.telefone,
        cidade: empresa.cidade,
      },
      include: { vagas: true },
    });

    return this.mapearParaDominio(registro);
  }

  async buscarPorEmail(email: string): Promise<Empresa | null> {
    const registro = await prisma.empresa.findUnique({
      where: { email },
      include: { vagas: true },
    });
    return registro ? this.mapearParaDominio(registro) : null;
  }

  async buscarPorId(id: number): Promise<Empresa | null> {
    const registro = await prisma.empresa.findUnique({
      where: { id },
      include: { vagas: true },
    });
    return registro ? this.mapearParaDominio(registro) : null;
  }

  async listarTodos(): Promise<Empresa[]> {
    const registros = await prisma.empresa.findMany({ include: { vagas: true } });
    return registros.map((r) => this.mapearParaDominio(r));
  }

  async atualizar(empresa: Empresa): Promise<Empresa> {
    if (empresa.id == null) {
      throw new Error("Empresa deve ter um ID para ser atualizada.");
    }

    const registro = await prisma.empresa.update({
      where: { id: empresa.id },
      data: {
        nome: empresa.nome,
        cnpj: empresa.cnpj,
        email: empresa.email,
        senha: empresa.senha,
        telefone: empresa.telefone,
        cidade: empresa.cidade,
      },
      include: { vagas: true },
    });

    return this.mapearParaDominio(registro);
  }

  async deletar(id: number): Promise<boolean> {
    await prisma.empresa.delete({ where: { id } });
    return true;
  }

  private mapearVagas(vagas: any[]): Vaga[] {
    return vagas?.map((vaga: any) =>
      new Vaga(
        vaga.empresaId,
        vaga.titulo,
        vaga.dataVaga,
        vaga.horaInicio,
        vaga.duracaoHoras,
        vaga.valorHora,
        vaga.descricao,
        vaga.endereco,
        vaga.status,
        vaga.id,
        vaga.criadoEm,
      ),
    ) ?? [];
  }

  private mapearParaDominio(registro: any): Empresa {
    return new Empresa(
      registro.nome,
      registro.email,
      registro.senha,
      registro.cnpj,
      registro.telefone,
      registro.cidade,
      registro.id,
      registro.criadoEm,
      this.mapearVagas(registro.vagas || []),
    );
  }
}
