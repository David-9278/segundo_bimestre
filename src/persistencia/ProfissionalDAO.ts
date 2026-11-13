import { prisma } from "../config/database";
import { Profissional } from "../dominio/Profissional";

export class ProfissionalDAO {
  async criar(profissional: Profissional): Promise<Profissional> {
    const registro = await prisma.profissional.create({
      data: {
        nome: profissional.nome,
        cpf: profissional.cpf,
        email: profissional.email,
        senha: profissional.senha,
        telefone: profissional.telefone,
        cidade: profissional.cidade,
        funcao: profissional.funcao,
        categoria: profissional.categoria,
        anosExperiencia: profissional.anosExperiencia,
        notaMedia: profissional.notaMedia,
        disponivel: profissional.disponivel,
      },
    });

    return this.mapearParaDominio(registro);
  }

  async buscarPorEmail(email: string): Promise<Profissional | null> {
    const registro = await prisma.profissional.findUnique({ where: { email } });
    return registro ? this.mapearParaDominio(registro) : null;
  }

  async buscarPorId(id: number): Promise<Profissional | null> {
    const registro = await prisma.profissional.findUnique({ where: { id } });
    return registro ? this.mapearParaDominio(registro) : null;
  }

  async listarTodos(): Promise<Profissional[]> {
    const registros = await prisma.profissional.findMany();
    return registros.map((r) => this.mapearParaDominio(r));
  }

   async listarDisponiveis(): Promise<Profissional[]> {
    const registros = await prisma.profissional.findMany({ where: { disponivel: true } });
    return registros.map((r) => this.mapearParaDominio(r));
  }

  async atualizar(profissional: Profissional): Promise<Profissional> {
    if (profissional.id == null) {
      throw new Error("Profissional deve ter um ID para ser atualizado.");
    }

    const registro = await prisma.profissional.update({
      where: { id: profissional.id },
      data: {
        nome: profissional.nome,
        cpf: profissional.cpf,
        email: profissional.email,
        senha: profissional.senha,
        telefone: profissional.telefone,
        cidade: profissional.cidade,
        funcao: profissional.funcao,
        categoria: profissional.categoria,
        anosExperiencia: profissional.anosExperiencia,
        notaMedia: profissional.notaMedia,
        disponivel: profissional.disponivel,
      },
    });

    return this.mapearParaDominio(registro);
  }

  async atualizarNotaMedia(id: number, notaMedia: number): Promise<void> {
    await prisma.profissional.update({ where: { id }, data: { notaMedia } });
  }

  async deletar(id: number): Promise<boolean> {
    await prisma.profissional.delete({ where: { id } });
    return true;
  }

  private mapearParaDominio(registro: any): Profissional {
    return new Profissional(
      registro.nome,
      registro.email,
      registro.senha,
      registro.cpf,
      registro.funcao,
      registro.anosExperiencia,
      registro.telefone,
      registro.cidade,
      registro.notaMedia,
      registro.disponivel,
      registro.id,
      registro.criadoEm,
      registro.categoria,
    );
  }
}
