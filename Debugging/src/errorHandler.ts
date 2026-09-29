// Minha ideia: responder a todas as falhas com os mesmos três campos em JSON.
import { ErrorRequestHandler } from "express";
import { AppError } from "./exercicio2";
import { logger } from "./logger";

// Preciso declarar os QUATRO parâmetros, mesmo sem usar todos.
// ErrorRequestHandler descreve essa função; unknown me obriga a conferir o erro.
export const errorHandler: ErrorRequestHandler = (erro: unknown, _req, res, next) => {
  // Registro os detalhes apenas no servidor. O logger acrescenta o requestId atual.
  if (erro instanceof Error) logger.error(erro);
  else logger.error("Falha sem objeto Error");
  res.locals.erroRegistrado = true;

  // Se a resposta começou, não posso mandar outro JSON nem novos cabeçalhos.
  // Entrego a falha ao próximo tratador, em vez de responder duas vezes.
  if (res.headersSent) {
    next(erro);
    return;
  }

  // Uso uma mensagem genérica para falhas inesperadas. Não exponho caminhos nem stack.
  let statusCode = 500;
  let message = "Não foi possível concluir a operação.";
  if (erro instanceof AppError) {
    statusCode = erro.statusCode;
    message = erro.message;
  }
  res.status(statusCode).json({
    statusCode,
    message,
    timestamp: new Date().toISOString(), // Data em um formato padronizado.
  });
};
