import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { TipoUsuario } from "../dominio/Usuario";

// ---------- Senhas (scrypt, sem dependências externas) ----------
export function hashSenha(senha: string): string {
  const sal = randomBytes(16).toString("hex");
  const hash = scryptSync(senha, sal, 64).toString("hex");
  return `${sal}:${hash}`;
}

export function verificarSenha(senha: string, armazenada: string): boolean {
  const [sal, hash] = armazenada.split(":");
  if (!sal || !hash) return false;
  const esperado = Buffer.from(hash, "hex");
  const calculado = scryptSync(senha, sal, esperado.length);
  return timingSafeEqual(esperado, calculado);
}

// ---------- Token assinado (HMAC-SHA256) ----------
export interface PayloadToken {
  sub: number;
  tipo: TipoUsuario;
  exp: number; // segundos desde epoch
}

const DURACAO_SEGUNDOS = 60 * 60 * 8;

function segredo(): string {
  const valor = process.env.JWT_SECRET;
  if (!valor) {
    throw new Error("JWT_SECRET não definido. Copie .env.example para .env.");
  }
  return valor;
}

function assinar(corpo: string): string {
  return createHmac("sha256", segredo()).update(corpo).digest("base64url");
}

export function gerarToken(id: number, tipo: TipoUsuario): string {
  const payload: PayloadToken = {
    sub: id,
    tipo,
    exp: Math.floor(Date.now() / 1000) + DURACAO_SEGUNDOS,
  };
  const corpo = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${corpo}.${assinar(corpo)}`;
}

export function lerToken(token: string): PayloadToken | null {
  const [corpo, assinatura] = token.split(".");
  if (!corpo || !assinatura) return null;

  const esperada = Buffer.from(assinar(corpo));
  const recebida = Buffer.from(assinatura);
  if (esperada.length !== recebida.length || !timingSafeEqual(esperada, recebida)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(corpo, "base64url").toString()) as PayloadToken;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.tipo !== "EMPRESA" && payload.tipo !== "PROFISSIONAL") return null;
    return payload;
  } catch {
    return null;
  }
}
