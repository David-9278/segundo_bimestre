import type { Request, Response } from "express";
import { Empresa } from "../dominio/Empresa";
import { Profissional } from "../dominio/Profissional";
import { Usuario, type TipoUsuario } from "../dominio/Usuario";
import { EmpresaDAO } from "../persistencia/EmpresaDAO";
import { ProfissionalDAO } from "../persistencia/ProfissionalDAO";
import { ErroHttp } from "../utils/erros";
import { gerarToken, hashSenha, verificarSenha } from "../utils/seguranca";

const empresaDAO = new EmpresaDAO();
const profissionalDAO = new ProfissionalDAO();

export class AuthController {
  async cadastrarEmpresa(req: Request, res: Response) {
    const { nome, email, senha, cnpj, telefone, cidade } = req.body ?? {};
    Usuario.validarSenhaPura(senha);

    const empresa = await empresaDAO.criar(
      new Empresa(nome, email, hashSenha(senha), cnpj, telefone, cidade),
    );
    res.status(201).json({
      token: gerarToken(empresa.id!, "EMPRESA"),
      usuario: empresa.toJSON(),
    });
  }

  async cadastrarProfissional(req: Request, res: Response) {
    const { nome, email, senha, cpf, funcao, categoria, anosExperiencia, telefone, cidade } = req.body ?? {};
    Usuario.validarSenhaPura(senha);

    const profissional = await profissionalDAO.criar(
      new Profissional(
        nome,
        email,
        hashSenha(senha),
        cpf,
        funcao,
        Number(anosExperiencia ?? 0),
        telefone,
        cidade,
        undefined,
        true,
        undefined,
        undefined,
        categoria,
      ),
    );
    res.status(201).json({
      token: gerarToken(profissional.id!, "PROFISSIONAL"),
      usuario: profissional.toJSON(),
    });
  }

  async login(req: Request, res: Response) {
    const { email, senha } = req.body ?? {};
    const tipo = String(req.body?.tipo ?? "").toUpperCase() as TipoUsuario;

    if (tipo !== "EMPRESA" && tipo !== "PROFISSIONAL") {
      throw new ErroHttp(400, 'Informe "tipo": "EMPRESA" ou "PROFISSIONAL"');
    }
    if (typeof email !== "string" || typeof senha !== "string") {
      throw new ErroHttp(400, "Informe email e senha");
    }

    const usuario =
      tipo === "EMPRESA"
        ? await empresaDAO.buscarPorEmail(email.trim())
        : await profissionalDAO.buscarPorEmail(email.trim());

    if (!usuario || !verificarSenha(senha, usuario.senha)) {
      throw new ErroHttp(401, "Email ou senha inválidos");
    }

    res.json({ token: gerarToken(usuario.id!, tipo), usuario: usuario.toJSON() });
  }
}
