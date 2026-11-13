import type { Request, Response } from "express";
import { Vaga, type StatusVaga } from "../dominio/Vaga";
import { usuarioDa } from "../middlewares/autenticacao";
import { VagaDAO } from "../persistencia/VagaDAO";
import { ErroHttp, idDaRota } from "../utils/erros";

const vagaDAO = new VagaDAO();

/** Carrega a vaga e garante que ela pertence à empresa autenticada. */
export async function carregarVagaDaEmpresa(req: Request): Promise<Vaga> {
  const vaga = await vagaDAO.buscarPorId(idDaRota(req.params.id));
  if (!vaga) throw new ErroHttp(404, "Vaga não encontrada");
  if (vaga.empresaId !== usuarioDa(req).id) {
    throw new ErroHttp(403, "Esta vaga pertence a outra empresa");
  }
  return vaga;
}

export class VagaController {
  async pesquisar(req: Request, res: Response) {
    const vagas = await vagaDAO.pesquisarAbertas(String(req.query.busca ?? "").trim());
    res.json(vagas.map((v) => v.toJSON()));
  }

  async buscar(req: Request, res: Response) {
    const vaga = await vagaDAO.buscarPorId(idDaRota(req.params.id));
    if (!vaga) throw new ErroHttp(404, "Vaga não encontrada");
    res.json(vaga.toJSON());
  }

  async minhasVagas(req: Request, res: Response) {
    const vagas = await vagaDAO.listarPorEmpresa(usuarioDa(req).id);
    res.json(vagas.map((v) => v.toJSON()));
  }

  async criar(req: Request, res: Response) {
    const { titulo, categoria, descricao, dataVaga, horaInicio, duracaoHoras, valorHora, endereco } =
      req.body ?? {};

    const vaga = new Vaga(
      usuarioDa(req).id,
      titulo,
      new Date(dataVaga),
      horaInicio,
      Number(duracaoHoras),
      Number(valorHora),
      descricao,
      endereco,
      "aberta",
      undefined,
      undefined,
      categoria,
    );
    vaga.validarDataNaoPassada();

    res.status(201).json((await vagaDAO.criar(vaga)).toJSON());
  }

  async atualizar(req: Request, res: Response) {
    const vaga = await carregarVagaDaEmpresa(req);
    if (!vaga.estaAberta()) {
      throw new ErroHttp(409, "Só é possível editar vagas abertas");
    }

    const { titulo, categoria, descricao, dataVaga, horaInicio, duracaoHoras, valorHora, endereco } =
      req.body ?? {};
    if (titulo !== undefined) vaga.setTitulo(titulo);
    if (categoria !== undefined) vaga.setCategoria(categoria);
    if (descricao !== undefined) vaga.setDescricao(descricao);
    if (dataVaga !== undefined) {
      vaga.setDataVaga(new Date(dataVaga));
      vaga.validarDataNaoPassada();
    }
    if (horaInicio !== undefined) vaga.setHoraInicio(horaInicio);
    if (duracaoHoras !== undefined) vaga.setDuracaoHoras(Number(duracaoHoras));
    if (valorHora !== undefined) vaga.setValorHora(Number(valorHora));
    if (endereco !== undefined) vaga.setEndereco(endereco);

    res.json((await vagaDAO.atualizar(vaga)).toJSON());
  }

  /** Empresa conclui ou cancela a vaga. "preenchida" só acontece quando um profissional aceita. */
  async alterarStatus(req: Request, res: Response) {
    const vaga = await carregarVagaDaEmpresa(req);
    const novo = String(req.body?.status ?? "") as StatusVaga;

    if (novo === "preenchida") {
      throw new ErroHttp(400, "A vaga passa a preenchida quando um profissional aceita a solicitação");
    }

    const statusAnterior = vaga.status;
    vaga.alterarStatus(novo);
    const atualizada = await vagaDAO.transicionarStatus(vaga, statusAnterior);
    if (!atualizada) throw new ErroHttp(409, "A vaga já foi alterada por outra solicitação");
    res.json(atualizada.toJSON());
  }

  async remover(req: Request, res: Response) {
    const vaga = await carregarVagaDaEmpresa(req);
    await vagaDAO.remover(vaga.id!);
    res.status(204).send();
  }
}
