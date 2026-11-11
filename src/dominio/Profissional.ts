import { Usuario } from "./Usuario";

export class Profissional extends Usuario {
  private _cpf!: string;
  private _funcap!: string;
  private _anosExperiencia = 0;
  private _notaMedia = 0;
  private _disponivel = true;

  constructor(
    nome: string,
    email: string,
    senha: string,
    cpf: string,
    funcap: string,
    anosExperiencia = 0,
    telefone?: string | null,
    cidade?: string | null,
    notaMedia: number | null = 0,
    disponivel = true,
    id?: number,
    criadoEm?: Date,
  ) {
    super(nome, email, senha, telefone, cidade, id, criadoEm);
    this.setCpf(cpf);
    this.setFuncap(funcap);
    this.setAnosExperiencia(anosExperiencia);
    this.setNotaMedia(notaMedia ?? 0);
    this.setDisponivel(disponivel);
  }

  get cpf() {
    return this._cpf;
  }
  get funcap() {
    return this._funcap;
  }
  get anosExperiencia() {
    return this._anosExperiencia;
  }
  get notaMedia() {
    return this._notaMedia;
  }
  get disponivel() {
    return this._disponivel;
  }

  setCpf(cpf: string) {
    const digitos = String(cpf ?? "").replace(/\D/g, "");
    if (digitos.length !== 11) {
      throw new Error("CPF inválido (deve ter 11 dígitos)");
    }
    this._cpf = digitos;
  }

  setFuncap(funcap: string) {
    if (!funcap || funcap.trim().length < 2) {
      throw new Error(
        "A função do profissional deve ter pelo menos 2 caracteres",
      );
    }
    this._funcap = funcap.trim();
  }

  setAnosExperiencia(anos: number) {
    if (!Number.isInteger(anos) || anos < 0 || anos > 60) {
      throw new Error(
        "Anos de experiência deve ser um número inteiro entre 0 e 60",
      );
    }
    this._anosExperiencia = anos;
  }

  setNotaMedia(nota: number) {
    if (typeof nota !== "number" || isNaN(nota) || nota < 0 || nota > 5) {
      throw new Error("A nota média deve estar entre 0 e 5");
    }
    this._notaMedia = nota;
  }

  setDisponivel(disponivel: boolean) {
    if (typeof disponivel !== "boolean") {
      throw new Error("Disponibilidade deve ser verdadeiro ou falso");
    }
    this._disponivel = disponivel;
  }

  getTipo() {
    return "PROFISSIONAL" as const;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      cpf: this._cpf,
      funcap: this._funcap,
      anosExperiencia: this._anosExperiencia,
      notaMedia: this._notaMedia,
      disponivel: this._disponivel,
    };
  }
}
