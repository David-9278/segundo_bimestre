export const STATUS_CANDIDATURA = ["enviado", "aceita", "recusada", "expirada"] as const;
export type StatusCandidatura = (typeof STATUS_CANDIDATURA)[number];

export class Candidatura {
  private _id?: number;
  private _vagaId!: number;
  private _profissionalId!: number;
  private _status: StatusCandidatura = "enviado";
  private _dataResposta: Date | null = null;
  private _criadoEm?: Date;

  constructor(
    vagaId: number,
    profissionalId: number,
    status: string = "enviado",
    dataResposta?: Date | null,
    id?: number,
    criadoEm?: Date,
  ) {
    this.setVagaId(vagaId);
    this.setProfissionalId(profissionalId);
    this.setStatus(status);
    this._dataResposta = dataResposta ?? null;
    this._id = id;
    this._criadoEm = criadoEm;
  }

  get id() { return this._id; }
  get vagaId() { return this._vagaId; }
  get profissionalId() { return this._profissionalId; }
  get status() { return this._status; }
  get dataResposta() { return this._dataResposta; }
  get criadoEm() { return this._criadoEm; }

  setVagaId(vagaId: number) {
    if (!Number.isInteger(vagaId) || vagaId <= 0) {
      throw new Error("Vaga inválida para a candidatura");
    }
    this._vagaId = vagaId;
  }

  setProfissionalId(profissionalId: number) {
    if (!Number.isInteger(profissionalId) || profissionalId <= 0) {
      throw new Error("Profissional inválido para a candidatura");
    }
    this._profissionalId = profissionalId;
  }

  setStatus(status: string) {
    if (!(STATUS_CANDIDATURA as readonly string[]).includes(status)) {
      throw new Error(`Status inválido. Opções: ${STATUS_CANDIDATURA.join(", ")}`);
    }
    this._status = status as StatusCandidatura;
  }

  estaPendente() {
    return this._status === "enviado";
  }

  private responder(novo: StatusCandidatura) {
    if (!this.estaPendente()) {
      throw new Error(`Esta solicitação não está mais pendente (status atual: ${this._status})`);
    }
    this._status = novo;
    this._dataResposta = new Date();
  }

  aceitar() { this.responder("aceita"); }
  recusar() { this.responder("recusada"); }

  toJSON() {
    return {
      id: this._id,
      vagaId: this._vagaId,
      profissionalId: this._profissionalId,
      status: this._status,
      dataResposta: this._dataResposta,
      criadoEm: this._criadoEm,
    };
  }
}
