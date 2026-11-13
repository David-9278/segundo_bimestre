import type { Request, Response } from "express";
import { EmpresaDAO } from "../persistencia/EmpresaDAO";
import { ProfissionalDAO } from "../persistencia/ProfissionalDAO";
import { usuarioDa } from "../middlewares/autenticacao";
import { ErroHttp } from "../utils/erros";
import { CATEGORIAS_PROFISSIONAL } from "../dominio/Profissional";

const empresaDAO = new EmpresaDAO();
const profissionalDAO = new ProfissionalDAO();

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export class PerfilController {
  async minhaEmpresa(req: Request, res: Response) {
    const empresa = await empresaDAO.buscarPorId(usuarioDa(req).id);
    if (!empresa) throw new ErroHttp(404, "Empresa não encontrada");
    res.json(empresa.toJSON());
  }

  async meuPerfilProfissional(req: Request, res: Response) {
    const profissional = await profissionalDAO.buscarPorId(usuarioDa(req).id);
    if (!profissional) throw new ErroHttp(404, "Profissional não encontrado");
    res.json(profissional.toJSON());
  }

  async atualizarMeuPerfilProfissional(req: Request, res: Response) {
    const profissional = await profissionalDAO.buscarPorId(usuarioDa(req).id);
    if (!profissional) throw new ErroHttp(404, "Profissional não encontrado");

    const { nome, telefone, cidade, funcao, categoria, anosExperiencia, disponivel } = req.body ?? {};
    if (nome !== undefined) profissional.setNome(nome);
    if (telefone !== undefined) profissional.setTelefone(telefone);
    if (cidade !== undefined) profissional.setCidade(cidade);
    if (funcao !== undefined) profissional.setFuncao(funcao);
    if (categoria !== undefined) profissional.setCategoria(categoria);
    if (anosExperiencia !== undefined) profissional.setAnosExperiencia(Number(anosExperiencia));
    if (disponivel !== undefined) profissional.setDisponivel(disponivel);

    res.json((await profissionalDAO.atualizar(profissional)).toJSON());
  }

  /** Empresas consultam os profissionais disponíveis (filtro opcional por função). */
  async listarProfissionaisDisponiveis(req: Request, res: Response) {
    const funcao = normalizar(String(req.query.funcao ?? ""));
    const categoriaParam = String(req.query.categoria ?? "").trim();
    const categoria = categoriaParam
      ? CATEGORIAS_PROFISSIONAL.find((item) => normalizar(item) === normalizar(categoriaParam))
      : undefined;
    if (categoriaParam && !categoria) {
      throw new ErroHttp(400, `Categoria inválida. Opções: ${CATEGORIAS_PROFISSIONAL.join(", ")}`);
    }

    let lista = await profissionalDAO.listarDisponiveis();
    if (categoria) {
      lista = lista.filter((p) => normalizar(p.categoria) === normalizar(categoria));
    }
    if (funcao) {
      lista = lista.filter((p) => normalizar(p.funcao).includes(funcao));
    }
    res.json(lista.map((p) => ({
      id: p.id,
      nome: p.nome,
      cidade: p.cidade,
      funcao: p.funcao,
      categoria: p.categoria,
      anosExperiencia: p.anosExperiencia,
      notaMedia: p.notaMedia,
    })));
  }
}
