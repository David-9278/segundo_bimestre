import type { Request, Response } from "express";
import { Avaliacao } from "../dominio/Avaliacao";
import { usuarioDa } from "../middlewares/autenticacao";
import { AvaliacaoDAO } from "../persistencia/AvaliacaoDAO";
import { CandidaturaDAO } from "../persistencia/CandidaturaDAO";
import { VagaDAO } from "../persistencia/VagaDAO";
import { ErroHttp, idDaRota } from "../utils/erros";

const avaliacaoDAO = new AvaliacaoDAO();
const candidaturaDAO = new CandidaturaDAO();
const vagaDAO = new VagaDAO();

/** Retorna vaga + candidatura aceita, garantindo que o usuário participa dela. */
async function carregarParticipacao(req: Request) {
  const auth = usuarioDa(req);
  const vaga = await vagaDAO.buscarPorId(idDaRota(req.params.id));
  if (!vaga) throw new ErroHttp(404, "Vaga não encontrada");

  const aceita = await candidaturaDAO.buscarAceitaPorVaga(vaga.id!);
  if (!aceita) throw new ErroHttp(409, "Esta vaga não tem profissional confirmado");

  const participa =
    auth.tipo === "EMPRESA" ? vaga.empresaId === auth.id : aceita.profissionalId === auth.id;
  if (!participa) throw new ErroHttp(403, "Você não participa desta vaga");

  return { auth, vaga };
}

export class AvaliacaoController {
  async criar(req: Request, res: Response) {
    const { auth, vaga } = await carregarParticipacao(req);

    if (vaga.status !== "concluida") {
      throw new ErroHttp(409, "A avaliação só é liberada depois que a vaga é concluída");
    }
    if (await avaliacaoDAO.buscarPorVagaETipo(vaga.id!, auth.tipo)) {
      throw new ErroHttp(409, "Você já avaliou esta vaga");
    }

    const avaliacao = await avaliacaoDAO.criar(
      new Avaliacao(vaga.id!, auth.tipo, Number(req.body?.nota), req.body?.comentario),
    );

    res.status(201).json(avaliacao.toJSON());
  }

  async listar(req: Request, res: Response) {
    const { vaga } = await carregarParticipacao(req);
    const lista = await avaliacaoDAO.listarPorVaga(vaga.id!);
    res.json(lista.map((a) => a.toJSON()));
  }
}
