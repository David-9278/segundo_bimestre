import { Router } from "express";
import { AuthController } from "../controladores/AuthController";
import { AvaliacaoController } from "../controladores/AvaliacaoController";
import { CandidaturaController } from "../controladores/CandidaturaController";
import { PerfilController } from "../controladores/PerfilController";
import { VagaController } from "../controladores/VagaController";
import { autenticar, exigirTipo } from "../middlewares/autenticacao";

const auth = new AuthController();
const perfil = new PerfilController();
const vagas = new VagaController();
const candidaturas = new CandidaturaController();
const avaliacoes = new AvaliacaoController();

const empresa = [autenticar, exigirTipo("EMPRESA")];
const profissional = [autenticar, exigirTipo("PROFISSIONAL")];

export const rotas = Router();

// Autenticação
rotas.post("/auth/empresas", (req, res) => auth.cadastrarEmpresa(req, res));
rotas.post("/auth/profissionais", (req, res) => auth.cadastrarProfissional(req, res));
rotas.post("/auth/login", (req, res) => auth.login(req, res));

// Perfis
rotas.get("/empresas/me", ...empresa, (req, res) => perfil.minhaEmpresa(req, res));
rotas.get("/profissionais/me", ...profissional, (req, res) => perfil.meuPerfilProfissional(req, res));
rotas.patch("/profissionais/me", ...profissional, (req, res) => perfil.atualizarMeuPerfilProfissional(req, res));
rotas.get("/profissionais", ...empresa, (req, res) => perfil.listarProfissionaisDisponiveis(req, res));

// Vagas (a busca é pública; o restante exige empresa dona da vaga)
rotas.get("/vagas", (req, res) => vagas.pesquisar(req, res));
rotas.get("/vagas/minhas", ...empresa, (req, res) => vagas.minhasVagas(req, res));
rotas.get("/vagas/:id", (req, res) => vagas.buscar(req, res));
rotas.post("/vagas", ...empresa, (req, res) => vagas.criar(req, res));
rotas.put("/vagas/:id", ...empresa, (req, res) => vagas.atualizar(req, res));
rotas.patch("/vagas/:id/status", ...empresa, (req, res) => vagas.alterarStatus(req, res));
rotas.delete("/vagas/:id", ...empresa, (req, res) => vagas.remover(req, res));

// Solicitações de substituição (candidaturas)
rotas.post("/vagas/:id/solicitacoes", ...empresa, (req, res) => candidaturas.solicitar(req, res));
rotas.get("/vagas/:id/solicitacoes", ...empresa, (req, res) => candidaturas.listarDaVaga(req, res));
rotas.get("/solicitacoes/minhas", ...profissional, (req, res) => candidaturas.minhas(req, res));
rotas.patch("/solicitacoes/:id/aceitar", ...profissional, (req, res) => candidaturas.aceitar(req, res));
rotas.patch("/solicitacoes/:id/recusar", ...profissional, (req, res) => candidaturas.recusar(req, res));

// Avaliações (empresa e profissional da vaga concluída)
rotas.post("/vagas/:id/avaliacoes", autenticar, (req, res) => avaliacoes.criar(req, res));
rotas.get("/vagas/:id/avaliacoes", autenticar, (req, res) => avaliacoes.listar(req, res));
