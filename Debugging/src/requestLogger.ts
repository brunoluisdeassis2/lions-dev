// Minha ideia: medir quanto cada requisição demorou e registrar como ela terminou.
// Trago randomUUID do próprio Node para gerar um identificador para cada requisição.
import { randomUUID } from "node:crypto";
// Estes tipos me ajudam a identificar no TypeScript o pedido, a resposta e a próxima etapa.
import { Request, Response, NextFunction } from "express";
// Reutilizo o logger do exercício 4, com o mesmo formato e nível de mensagens.
import { logger } from "./logger";

// Meu middleware é uma função que participa do atendimento de cada requisição.
// req contém o pedido recebido; res é a resposta; next libera a próxima etapa.
// void indica que não devolvo um valor para quem chamou esta função.
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Guardo o instante de início com um relógio próprio para medir intervalos.
  // bigint guarda um número inteiro grande; aqui o tempo é medido em nanossegundos.
  const start = process.hrtime.bigint();
  // Reaproveito o ID do contexto; gero um novo só se este middleware for usado sozinho.
  const requestId = req.requestId || randomUUID();
  // locals é um espaço da resposta em que guardo informações só desta requisição.
  res.locals.requestId = requestId;
  // Também envio o ID em um cabeçalho: uma informação que acompanha a resposta.
  // Assim, consigo relacionar a resposta recebida ao registro no terminal.
  res.setHeader("X-Request-Id", requestId);

  // Crio uma função interna para usar quando a resposta terminar ou for cancelada.
  // Ela ainda consegue acessar start e requestId, criados nesta mesma requisição.
  // cancelada é boolean: true para sim, false para não.
  function registrar(cancelada: boolean): void {
    // Subtraio o início do instante atual para descobrir o tempo gasto.
    // Converto o bigint para Number e divido por um milhão para obter milissegundos.
    // 1_000_000 é apenas uma escrita mais legível de 1000000.
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    // Quero guardar /usuarios/:id, que é o modelo da rota, em vez de /usuarios/42.
    // O ?. só tenta ler path se req.route existir; evita erro em rota não encontrada.
    // Se não houver modelo, || escolhe o texto “rota-nao-encontrada”.
    const route = req.route?.path || "rota-nao-encontrada";
    // Reúno as informações em um objeto. Não coloco corpo, senha ou token no log.
    // method é o método, como GET; durationMs é o tempo gasto.
    const dados = {
      requestId, method: req.method, route, durationMs,
      // Leio condição ? valor1 : valor2 como “se for verdade, uso valor1; senão, valor2”.
      // Se cancelou, uso null: não afirmo que o cliente recebeu uma resposta completa.
      // Se terminou, guardo o status real, como 200, 404 ou 500.
      statusCode: cancelada ? null : res.statusCode, cancelada,
    };
    // Escolho o nível do log: cancelamento é aviso (warn), falha do servidor é error
    // Se o errorHandler já registrou a falha, marco só a conclusão em info,
    // para não repetir o registro de erro nem seu stack.
    if (cancelada) logger.warn("request cancelada", dados);
    else if (res.statusCode >= 500 && !res.locals.erroRegistrado) logger.error("request", dados);
    else logger.info("request", dados);
  }

  // on registra uma função para rodar quando ocorrer um evento.
  // finish indica que o servidor terminou de enviar a resposta para o sistema.
  // Só nesse momento registro o status final. false informa que não foi cancelamento.
  res.on("finish", () => registrar(false));
  // close indica que a conexão foi fechada e também pode acontecer após uma resposta normal.
  res.on("close", () => {
    // writableFinished diz se a resposta terminou. Com !, verifico se NÃO terminou.
    // Assim registro um cancelamento sem repetir o log de uma resposta já concluída.
    if (!res.writableFinished) registrar(true);
  });
  // Agora deixo a requisição seguir para a rota. As funções dos eventos ficam aguardando.
  // Se eu registrasse a conclusão aqui, ainda não saberia o status final nem o tempo total.
  // Marco também o começo para conseguir filtrar a sequência completa no exercício 9.
  logger.info("requisição recebida", { requestId });
  next();
}
