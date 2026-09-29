// Minha ideia: guardar o ID da requisição em um contexto que acompanha suas tarefas.
// Assim não preciso acrescentar um parâmetro requestId em toda função que eu chamar.
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { RequestHandler } from "express";

// Digo ao TypeScript que acrescentei um campo ao Request do Express.
// O ? indica que ele pode não existir antes de passar pelo middleware abaixo.
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

// Cada execução guarda seu próprio objeto. Não é um contador global compartilhado.
export const requestStorage = new AsyncLocalStorage<{ requestId: string }>();

export const requestContext: RequestHandler = (req, res, next) => {
  // Tento reaproveitar o ID enviado pelo cliente. Se não houver, gero um UUID.
  // Aceito letras, números, ponto, hífen e sublinhado, até 100 caracteres.
  // Essa conferência evita guardar texto arbitrário ou enorme nos registros.
  const recebido = req.get("X-Request-Id");
  let requestId: string = randomUUID();
  if (recebido && /^[a-zA-Z0-9._-]{1,100}$/.test(recebido)) {
    requestId = recebido;
  }
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  // run abre o contexto e chama a próxima etapa dentro dele.
  // As tarefas criadas aqui, inclusive depois de await, continuam vendo este ID.
  requestStorage.run({ requestId }, () => next());
};
