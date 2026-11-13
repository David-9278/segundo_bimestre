import type { NextFunction, Request, Response } from "express";
import { ErroHttp } from "../utils/erros";

export function rotaNaoEncontrada(req: Request, res: Response) {
  res.status(404).json({ erro: `Rota ${req.method} ${req.path} não encontrada` });
}

export function tratarErros(erro: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (erro instanceof ErroHttp) {
    return res.status(erro.status).json({ erro: erro.message });
  }

  const codigo = (erro as { code?: string } | null)?.code;
  if (codigo === "P2002") {
    return res.status(409).json({ erro: "Já existe um registro com esses dados (email, CPF/CNPJ ou candidatura repetida)" });
  }
  if (codigo === "P2025") {
    return res.status(404).json({ erro: "Registro não encontrado" });
  }

  // Erros lançados pelas classes de domínio (validações) são `Error` puro.
  if (erro instanceof Error && erro.constructor === Error) {
    return res.status(400).json({ erro: erro.message });
  }

  if (erro instanceof SyntaxError && "body" in erro) {
    return res.status(400).json({ erro: "JSON inválido no corpo da requisição" });
  }

  console.error(erro);
  return res.status(500).json({ erro: "Erro interno do servidor" });
}
