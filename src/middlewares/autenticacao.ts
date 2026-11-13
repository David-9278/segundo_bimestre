import type { NextFunction, Request, Response } from "express";
import type { TipoUsuario } from "../dominio/Usuario";
import { ErroHttp } from "../utils/erros";
import { lerToken } from "../utils/seguranca";

export interface UsuarioAutenticado {
  id: number;
  tipo: TipoUsuario;
}

declare global {
  namespace Express {
    interface Request {
      auth?: UsuarioAutenticado;
    }
  }
}

export function autenticar(req: Request, _res: Response, next: NextFunction) {
  const cabecalho = req.headers.authorization ?? "";
  const [esquema, token] = cabecalho.split(" ");
  if (esquema !== "Bearer" || !token) {
    throw new ErroHttp(401, "Envie o token no cabeçalho Authorization: Bearer <token>");
  }

  const payload = lerToken(token);
  if (!payload) throw new ErroHttp(401, "Token inválido ou expirado");

  req.auth = { id: payload.sub, tipo: payload.tipo };
  next();
}

export function exigirTipo(tipo: TipoUsuario) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.auth?.tipo !== tipo) {
      throw new ErroHttp(403, `Acesso restrito a usuários do tipo ${tipo}`);
    }
    next();
  };
}

/** Garante ao TypeScript que a rota passou por `autenticar`. */
export function usuarioDa(req: Request): UsuarioAutenticado {
  if (!req.auth) throw new ErroHttp(401, "Não autenticado");
  return req.auth;
}
