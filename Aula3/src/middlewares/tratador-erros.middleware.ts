import { ErrorRequestHandler } from "express";

import { ErroAplicacao } from "../errors/erro-aplicacao";

// Esta funcao recebe os erros enviados pelas rotas.
export const tratadorDeErros: ErrorRequestHandler = (
  erro,
  requisicao,
  resposta,
  proximo,
) => {
  if (erro instanceof ErroAplicacao) {
    resposta.status(erro.codigoHttp).json({ message: erro.message });
    return;
  }

  console.error(erro);
  resposta.status(500).json({ message: "Erro interno do servidor" });

  // Os quatro parametros precisam existir para o Express reconhecer a funcao.
  void requisicao;
  void proximo;
};
