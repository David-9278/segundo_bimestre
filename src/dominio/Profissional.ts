import { Usuario } from "./Usuario";

export const CATEGORIAS_PROFISSIONAL = [
  "Eventos",
  "Culinária",
  "Tecnologia",
  "Design",
  "Saúde",
  "Admin",
  "Setor de Beleza",
  "Outro",
] as const;

export type CategoriaProfissional = (typeof CATEGORIAS_PROFISSIONAL)[number];

const PALAVRAS_CATEGORIA: Record<Exclude<CategoriaProfissional, "Outro">, string[]> = {
  Eventos: ["cantor", "musico", "dj", "evento", "festa", "fotografo", "cerimonialista", "recepcionista", "animador"],
  "Culinária": ["garcom", "cozinheiro", "chef", "copeiro", "barista", "bartender", "confeiteiro", "padeiro", "churrasqueiro", "cozinha"],
  Tecnologia: ["ti", "suporte", "desenvolvedor", "programador", "informatica", "redes", "tecnologia"],
  Design: ["designer", "design", "grafico", "ilustrador", "diagramador"],
  Saúde: ["enfermeiro", "enfermagem", "tecnico de enfermagem", "cuidador", "medico", "fisioterapeuta", "saude"],
  Admin: ["administrativo", "auxiliar administrativo", "secretaria", "secretario", "recepcao", "atendente", "assistente"],
  "Setor de Beleza": ["cabeleireiro", "cabeleireira", "manicure", "maquiador", "maquiadora", "barbeiro", "esteticista", "beleza"],
};

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function inferirCategoria(funcao: string): CategoriaProfissional {
  const normalizada = normalizar(funcao);
  for (const [categoria, palavras] of Object.entries(PALAVRAS_CATEGORIA)) {
    if (palavras.some((palavra) =>
      new RegExp(`(^|[^a-z0-9])${palavra}([^a-z0-9]|$)`).test(normalizada)
    )) {
      return categoria as Exclude<CategoriaProfissional, "Outro">;
    }
  }
  return "Outro";
}

export class Profissional extends Usuario {
  private _cpf!: string;
  private _funcao!: string;
  private _categoria?: CategoriaProfissional;
  private _anosExperiencia = 0;
  private _notaMedia = 0;
  private _disponivel = true;

  constructor(
    nome: string,
    email: string,
    senha: string,
    cpf: string,
    funcao: string,
    anosExperiencia = 0,
    telefone?: string | null,
    cidade?: string | null,
    notaMedia: number | null = 0,
    disponivel = true,
    id?: number,
    criadoEm?: Date,
    categoria?: string,
  ) {
    super(nome, email, senha, telefone, cidade, id, criadoEm);
    this.setCpf(cpf);
    this.setFuncao(funcao);
    if (categoria != null) this.setCategoria(categoria);
    this.setAnosExperiencia(anosExperiencia);
    this.setNotaMedia(notaMedia ?? 0);
    this.setDisponivel(disponivel);
  }

  get cpf() {
    return this._cpf;
  }
  get funcao() {
    return this._funcao;
  }
  get anosExperiencia() {
    return this._anosExperiencia;
  }
  get categoria() {
    return this._categoria ?? inferirCategoria(this._funcao);
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

  setFuncao(funcao: string) {
    if (!funcao || funcao.trim().length < 2) {
      throw new Error(
        "A função do profissional deve ter pelo menos 2 caracteres",
      );
    }
    this._funcao = funcao.trim();
  }

  setCategoria(categoria: string) {
    const normalizada = normalizar(String(categoria ?? ""));
    const valor = CATEGORIAS_PROFISSIONAL.find((item) => normalizar(item) === normalizada);
    if (!valor) {
      throw new Error(`Categoria inválida. Opções: ${CATEGORIAS_PROFISSIONAL.join(", ")}`);
    }
    this._categoria = valor;
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
      funcao: this._funcao,
      categoria: this.categoria,
      anosExperiencia: this._anosExperiencia,
      notaMedia: this._notaMedia,
      disponivel: this._disponivel,
    };
  }
}
