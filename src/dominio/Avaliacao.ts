import type { TipoUsuario } from "./Usuario";

export class Avaliacao {
  private _id?: number;
  private _vagaId!: number;
  private _avaliadorTipo!: TipoUsuario;
  private _nota!: number;
  private _comentario: string | null = null;
  private _criadoEm?: Date;

  constructor(
    vagaId: number,
    avaliadorTipo: string,
    nota: number,
    comentario?: string | null,
    id?: number,
    criadoEm?: Date,
  ) {
    this.setVagaId(vagaId);
    this.setAvaliadorTipo(avaliadorTipo);
    this.setNota(nota);
    this.setComentario(comentario);
    this._id = id;
    this._criadoEm = criadoEm;
  }

  get id() { return this._id; }
  get vagaId() { return this._vagaId; }
  get avaliadorTipo() { return this._avaliadorTipo; }
  get nota() { return this._nota; }
  get comentario() { return this._comentario; }
  get criadoEm() { return this._criadoEm; }

  setVagaId(vagaId: number) {
    if (!Number.isInteger(vagaId) || vagaId <= 0) {
      throw new Error("Vaga inválida para a avaliação");
    }
    this._vagaId = vagaId;
  }

  setAvaliadorTipo(tipo: string) {
    if (tipo !== "EMPRESA" && tipo !== "PROFISSIONAL") {
      throw new Error("O avaliador deve ser EMPRESA ou PROFISSIONAL");
    }
    this._avaliadorTipo = tipo;
  }

  setNota(nota: number) {
    if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
      throw new Error("A nota deve ser um número inteiro de 1 a 5");
    }
    this._nota = nota;
  }

  setComentario(comentario?: string | null) {
    const texto = comentario == null ? "" : String(comentario).trim();
    if (texto.length > 500) {
      throw new Error("O comentário deve ter no máximo 500 caracteres");
    }
    this._comentario = texto === "" ? null : texto;
  }

  toJSON() {
    return {
      id: this._id,
      vagaId: this._vagaId,
      avaliadorTipo: this._avaliadorTipo,
      nota: this._nota,
      comentario: this._comentario,
      criadoEm: this._criadoEm,
    };
  }
}
