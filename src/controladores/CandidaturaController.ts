import type { Request, Response } from "express";
import { Candidatura } from "../dominio/Candidatura";
import { Profissional } from "../dominio/Profissional";
import { usuarioDa } from "../middlewares/autenticacao";
import { CandidaturaDAO } from "../persistencia/CandidaturaDAO";
import { ProfissionalDAO } from "../persistencia/ProfissionalDAO";
import { ErroHttp, idDaRota } from "../utils/erros";
import { carregarVagaDaEmpresa } from "./VagaController";

const candidaturaDAO = new CandidaturaDAO();
const profissionalDAO = new ProfissionalDAO();

const LIMITE_AUTOMATICO = 3;

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

/** Carrega a candidatura e garante que ela é do profissional autenticado. */
async function carregarCandidaturaDoProfissional(req: Request): Promise<Candidatura> {
  const candidatura = await candidaturaDAO.buscarPorId(idDaRota(req.params.id));
  if (!candidatura) throw new ErroHttp(404, "Solicitação não encontrada");
  if (candidatura.profissionalId !== usuarioDa(req).id) {
    throw new ErroHttp(403, "Esta solicitação é de outro profissional");
  }
  return candidatura;
}

export class CandidaturaController {
  /**
   * Empresa pede substituição: envia solicitações a profissionais.
   * Se `profissionalIds` não vier, recomenda até 3 disponíveis por categoria/função,
   * priorizando correspondência exata, avaliação e experiência.
   */
  async solicitar(req: Request, res: Response) {
    const vaga = await carregarVagaDaEmpresa(req);
    if (!vaga.estaAberta()) throw new ErroHttp(409, "A vaga não está aberta");

    const jaSolicitados = new Set(
      (await candidaturaDAO.listarPorVaga(vaga.id!)).map(({ candidatura }) => candidatura.profissionalId),
    );

    let escolhidos: Profissional[];
    const ids: unknown = req.body?.profissionalIds;

    if (ids !== undefined) {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new ErroHttp(400, "profissionalIds deve ser uma lista com pelo menos um id");
      }
      escolhidos = [];
      for (const bruto of new Set(ids.map((i) => idDaRota(i, "profissionalIds")))) {
        const prof = await profissionalDAO.buscarPorId(bruto);
        if (!prof) throw new ErroHttp(404, `Profissional ${bruto} não encontrado`);
        if (!prof.disponivel) throw new ErroHttp(409, `Profissional ${bruto} não está disponível`);
        escolhidos.push(prof);
      }
    } else {
      const titulo = normalizar(vaga.titulo);
      const categoriaVaga = vaga.categoria;
      escolhidos = (await profissionalDAO.listarDisponiveis())
        .filter((p) => {
          const funcao = normalizar(p.funcao);
          if (vaga.categoriaSalva !== null) {
            return normalizar(p.categoria) === normalizar(categoriaVaga);
          }
          return (
            (categoriaVaga !== "Outro" && p.categoria === categoriaVaga) ||
            funcao.includes(titulo) ||
            titulo.includes(funcao)
          );
        })
        .sort((a, b) => {
          const funcaoA = normalizar(a.funcao);
          const funcaoB = normalizar(b.funcao);
          const compatibilidadeA = funcaoA === titulo ? 1 : 0;
          const compatibilidadeB = funcaoB === titulo ? 1 : 0;
          return compatibilidadeB - compatibilidadeA || b.notaMedia - a.notaMedia || b.anosExperiencia - a.anosExperiencia;
        });
    }

    escolhidos = escolhidos.filter((p) => !jaSolicitados.has(p.id!));
    if (ids === undefined) escolhidos = escolhidos.slice(0, LIMITE_AUTOMATICO);

    if (escolhidos.length === 0) {
      throw new ErroHttp(404, "Nenhum profissional disponível para esta vaga no momento");
    }

    const criadas = await candidaturaDAO.criarVarias(
      escolhidos.map((p) => new Candidatura(vaga.id!, p.id!)),
    );
    res.status(201).json({
      notificados: criadas.length,
      candidaturas: criadas.map((c) => c.toJSON()),
    });
  }

  async listarDaVaga(req: Request, res: Response) {
    const vaga = await carregarVagaDaEmpresa(req);
    const lista = await candidaturaDAO.listarPorVaga(vaga.id!);
    res.json(lista.map(({ candidatura, profissional }) => ({
      ...candidatura.toJSON(),
      profissional,
    })));
  }

  async minhas(req: Request, res: Response) {
    const status = req.query.status ? String(req.query.status) : undefined;
    const lista = await candidaturaDAO.listarPorProfissional(usuarioDa(req).id, status);
    res.json(lista.map(({ candidatura, vaga, empresaNome }) => ({
      ...candidatura.toJSON(),
      vaga: {
        ...vaga.toJSON(),
        empresaNome,
      },
    })));
  }

  async aceitar(req: Request, res: Response) {
    const candidatura = await carregarCandidaturaDoProfissional(req);
    if (!candidatura.estaPendente()) {
      throw new ErroHttp(409, `Esta solicitação não está mais pendente (status atual: ${candidatura.status})`);
    }

    candidatura.aceitar();
    const atualizada = await candidaturaDAO.confirmarAceite(candidatura);
    if (!atualizada) {
      throw new ErroHttp(409, "Esta solicitação já foi respondida ou a vaga não está mais aberta");
    }
    res.json(atualizada.toJSON());
  }

  async recusar(req: Request, res: Response) {
    const candidatura = await carregarCandidaturaDoProfissional(req);
    if (!candidatura.estaPendente()) {
      throw new ErroHttp(409, `Esta solicitação não está mais pendente (status atual: ${candidatura.status})`);
    }
    candidatura.recusar();
    const atualizada = await candidaturaDAO.recusarSePendente(candidatura);
    if (!atualizada) {
      throw new ErroHttp(409, "Esta solicitação já foi respondida");
    }
    res.json(atualizada.toJSON());
  }
}
