// Este arquivo guarda os erros do enunciado para comparação. Não é a solução.
import express from "express";
import winston from "winston";

function calculateTotal(prices: number[]): number {
  let subtotal = 0;
  for (let index = 0; index <= prices.length; index++) {
    console.log({ index, preco: prices[index], subtotal });
    if (prices[index] === undefined) console.trace("Primeiro valor inesperado");
    subtotal += prices[index];
  }
  if (subtotal > 100) return subtotal * 0.1;
  return subtotal;
}

async function investigar(): Promise<void> {
  console.log("Exercício 1, resultado:", calculateTotal([40, 60]));
  console.log("Exercício 2, divisão por zero:", 10 / 0);
  const parcelas: number[] = [];
  for (let number = 1; number < 3; number++) parcelas.push(33.33);
  console.log("Exercício 3:", parcelas);
  const logger = winston.createLogger({ level: "error", transports: [new winston.transports.Console()] });
  console.log("Exercício 4: entre estas marcas deveria haver início e fim.");
  logger.info("inicio do processamento");
  logger.info("fim do processamento");
  console.log("Fim das marcas: nenhuma linha do logger.");

  const app = express();
  app.get("/health", (_req, res) => { res.json({ ok: true }); });
  app.use((req, res, next) => {
    const start = new Date();
    // getTime só permite compilar a reprodução; o momento do log continua errado.
    console.log({ method: req.method, route: req.path, status: res.statusCode, duration: new Date().getTime() - start.getTime() });
    next();
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const endereco = server.address();
  if (!endereco || typeof endereco === "string") throw new Error("Sem porta");
  for (const rota of ["/health", "/rota-inexistente"]) {
    const resposta = await fetch(`http://127.0.0.1:${endereco.port}${rota}`);
    await resposta.text();
    console.log("Status real:", rota, resposta.status);
  }
  server.close();
}
investigar().catch((erro: unknown) => { console.error(erro); process.exitCode = 1; });
