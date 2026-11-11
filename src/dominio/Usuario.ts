export type TipoUsuario = "EMPRESA" | "PROFISSIONAL";

export abstract class Usuario {
  private _id?: number;
  private _nome!: string;
  private _email!: string;
  private _senha!: string;
  private _telefone: string | null = null;
  private _cidade: string | null = null;
  private _criadoEm?: Date;

  constructor(
    nome: string,
    email: string,
    senha: string,
    telefone?: string | null,
    cidade?: string | null,
    id?: number,
    criadoEm?: Date,
  ) {
    this.setNome(nome);
    this.setEmail(email);
    this.setSenha(senha);
    this.setTelefone(telefone);
    this.setCidade(cidade);
    this._id = id;
    this._criadoEm = criadoEm;
  }

  get id() {
    return this._id;
  }
  get nome() {
    return this._nome;
  }
  get email() {
    return this._email;
  }
  get senha() {
    return this._senha;
  }
  get telefone() {
    return this._telefone;
  }
  get cidade() {
    return this._cidade;
  }
  get criadoEm() {
    return this._criadoEm;
  }

  static validarSenhaPura(senha: unknown) {
    if (typeof senha !== "string" || senha.length < 6) {
      throw new Error("A senha deve ter pelo menos 6 caracteres");
    }
  }

  setNome(nome: string) {
    if (!nome || nome.trim().length < 2) {
      throw new Error("O nome deve ter pelo menos 2 caracteres");
    }
    this._nome = nome.trim();
  }

  setEmail(email: string) {
    const emailTrim = String(email ?? "").trim();
    const temArroba = emailTrim.includes("@");
    const temPonto = emailTrim.includes(".");
    const temEspaco = emailTrim.includes(" ");

    if (!temArroba || !temPonto || temEspaco) {
      throw new Error("Email inválido");
    }
    this._email = emailTrim;
  }

  setSenha(senha: string) {
    if (!senha) {
      throw new Error("Senha inválida");
    }
    this._senha = senha;
  }

  setTelefone(telefone?: string | null) {
    if (telefone == null || String(telefone).trim() === "") {
      this._telefone = null;
      return;
    }
    const digitos = String(telefone).replace(/\D/g, "");
    if (digitos.length < 10 || digitos.length > 11) {
      throw new Error("Telefone inválido (informe DDD + número)");
    }
    this._telefone = digitos;
  }

  setCidade(cidade?: string | null) {
    if (cidade == null || String(cidade).trim() === "") {
      this._cidade = null;
      return;
    }
    if (String(cidade).trim().length < 2) {
      throw new Error("A cidade deve ter pelo menos 2 caracteres");
    }
    this._cidade = String(cidade).trim();
  }

  abstract getTipo(): TipoUsuario;

  toJSON() {
    return {
      id: this._id,
      nome: this._nome,
      email: this._email,
      telefone: this._telefone,
      cidade: this._cidade,
      tipo: this.getTipo(),
      criadoEm: this._criadoEm,
    };
  }
}
