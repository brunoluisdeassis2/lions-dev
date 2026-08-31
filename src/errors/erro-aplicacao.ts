// Esta classe representa um erro que nos ja esperamos que possa acontecer.
export class ErroAplicacao extends Error {
  public readonly codigoHttp: number;

  constructor(mensagem: string, codigoHttp: number) {
    super(mensagem);
    this.codigoHttp = codigoHttp;
  }
}
