import { Usuario } from "./Usuario";
import { Vaga } from "./Vaga";

export class Empresa extends Usuario {
  private _cnpj!: string;
  private _vagas: Vaga[] = [];

  constructor(
    nome: string,
    email: string,
    senha: string,
    cnpj: string,
    telefone?: string | null,
    cidade?: string | null,
    id?: number,
    criadoEm?: Date,
    vagas: Vaga[] = [],
  ) {
    super(nome, email, senha, telefone, cidade, id, criadoEm);
    this.setCnpj(cnpj);
    this._vagas = vagas;
  }

  get cnpj() { return this._cnpj; }
  get vagas() { return this._vagas; }

  setCnpj(cnpj: string) {
    const digitos = String(cnpj ?? "").replace(/\D/g, "");
    if (digitos.length !== 14) {
      throw new Error("CNPJ inválido (deve ter 14 dígitos)");
    }
    this._cnpj = digitos;
  }

  getTipo() {
    return "EMPRESA" as const;
  }

  toJSON() {
    return { ...super.toJSON(), cnpj: this._cnpj, vagas: this._vagas };
  }
}
