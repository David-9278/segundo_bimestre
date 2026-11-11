export const STATUS_VAGA = [
  "aberta",
  "preenchida",
  "concluida",
  "cancelada",
] as const;
export type StatusVaga = (typeof STATUS_VAGA)[number];

const TRANSICOES: Record<StatusVaga, StatusVaga[]> = {
  aberta: ["preenchida", "cancelada"],
  preenchida: ["concluida", "cancelada"],
  concluida: [],
  cancelada: [],
};

export class Vaga {
  private _id?: number;
  private _empresaId!: number;
  private _titulo!: string;
  private _descricao: string | null = null;
  private _dataVaga!: Date;
  private _horaInicio!: string;
  private _duracaoHoras!: number;
  private _valorHora!: number;
  private _endereco: string | null = null;
  private _status: StatusVaga = "aberta";
  private _criadoEm?: Date;

  constructor(
    empresaId: number,
    titulo: string,
    dataVaga: Date,
    horaInicio: string,
    duracaoHoras: number,
    valorHora: number,
    descricao?: string | null,
    endereco?: string | null,
    status: string = "aberta",
    id?: number,
    criadoEm?: Date,
  ) {
    this.setEmpresaId(empresaId);
    this.setTitulo(titulo);
    this.setDataVaga(dataVaga);
    this.setHoraInicio(horaInicio);
    this.setDuracaoHoras(duracaoHoras);
    this.setValorHora(valorHora);
    this.setDescricao(descricao);
    this.setEndereco(endereco);
    this.setStatus(status);
    this._id = id;
    this._criadoEm = criadoEm;
  }

  get id() {
    return this._id;
  }
  get empresaId() {
    return this._empresaId;
  }
  get titulo() {
    return this._titulo;
  }
  get descricao() {
    return this._descricao;
  }
  get dataVaga() {
    return this._dataVaga;
  }
  get horaInicio() {
    return this._horaInicio;
  }
  get duracaoHoras() {
    return this._duracaoHoras;
  }
  get valorHora() {
    return this._valorHora;
  }
  get endereco() {
    return this._endereco;
  }
  get status() {
    return this._status;
  }
  get criadoEm() {
    return this._criadoEm;
  }

  setEmpresaId(empresaId: number) {
    if (!Number.isInteger(empresaId) || empresaId <= 0) {
      throw new Error("Empresa inválida para a vaga");
    }
    this._empresaId = empresaId;
  }

  setTitulo(titulo: string) {
    if (!titulo || titulo.trim().length < 2) {
      throw new Error(
        "A função/cargo da vaga deve ter pelo menos 2 caracteres",
      );
    }
    this._titulo = titulo.trim();
  }

  setDescricao(descricao?: string | null) {
    const texto = descricao == null ? "" : String(descricao).trim();
    this._descricao = texto === "" ? null : texto;
  }

  setDataVaga(data: Date) {
    if (!(data instanceof Date) || isNaN(data.getTime())) {
      throw new Error("Data da vaga inválida");
    }
    this._dataVaga = data;
  }

  validarDataNaoPassada() {
    const limite = new Date();
    limite.setUTCHours(0, 0, 0, 0);
    limite.setUTCDate(limite.getUTCDate() - 1);
    if (this._dataVaga < limite) {
      throw new Error("A data da vaga não pode estar no passado");
    }
  }

  setHoraInicio(hora: string) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(hora ?? "").trim())) {
      throw new Error("Horário de início inválido (use HH:MM)");
    }
    this._horaInicio = hora.trim();
  }

  setDuracaoHoras(horas: number) {
    if (!Number.isInteger(horas) || horas < 1 || horas > 24) {
      throw new Error("A duração deve ser um número inteiro de 1 a 24 horas");
    }
    this._duracaoHoras = horas;
  }

  setValorHora(valor: number) {
    if (typeof valor !== "number" || isNaN(valor) || valor <= 0) {
      throw new Error("O valor por hora deve ser maior que zero");
    }
    this._valorHora = valor;
  }

  setEndereco(endereco?: string | null) {
    const texto = endereco == null ? "" : String(endereco).trim();
    this._endereco = texto === "" ? null : texto;
  }

  setStatus(status: string) {
    if (!(STATUS_VAGA as readonly string[]).includes(status)) {
      throw new Error(`Status inválido. Opções: ${STATUS_VAGA.join(", ")}`);
    }
    this._status = status as StatusVaga;
  }

  alterarStatus(novo: StatusVaga) {
    if (!TRANSICOES[this._status].includes(novo)) {
      throw new Error(
        `Não é possível mudar a vaga de "${this._status}" para "${novo}"`,
      );
    }
    this._status = novo;
  }

  estaAberta() {
    return this._status === "aberta";
  }

  getValorTotal() {
    return Math.round(this._valorHora * this._duracaoHoras * 100) / 100;
  }

  toJSON() {
    return {
      id: this._id,
      empresaId: this._empresaId,
      titulo: this._titulo,
      descricao: this._descricao,
      dataVaga: this._dataVaga,
      horaInicio: this._horaInicio,
      duracaoHoras: this._duracaoHoras,
      valorHora: this._valorHora,
      valorTotal: this.getValorTotal(),
      endereco: this._endereco,
      status: this._status,
      criadoEm: this._criadoEm,
    };
  }
}
