// Importamos do Express os três tipos usados por um middleware.
import { Request, Response, NextFunction } from "express";

// Este middleware observa e registra todas as requisições recebidas.
export function loggerMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  // Criamos um texto com a data e a hora atuais.
  const horario = new Date().toISOString();

  // Mostramos no terminal o horário, o método e a URL acessada.
  console.log(`[${horario}] ${request.method} ${request.originalUrl}`);

  // O logger não precisa modificar a resposta, mas Response faz parte do middleware.
  // Esta linha apenas deixa explícito que recebemos esse parâmetro.
  void response;

  // Libera a requisição para seguir até a próxima etapa.
  next();
}
