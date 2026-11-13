export class ErroHttp extends Error {
  constructor(
    public readonly status: number,
    mensagem: string,
  ) {
    super(mensagem);
  }
}

export function idDaRota(valor: unknown, nome = "id"): number {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new ErroHttp(400, `Parâmetro "${nome}" inválido`);
  }
  return numero;
}
