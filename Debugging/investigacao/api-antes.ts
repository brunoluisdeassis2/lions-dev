// Reproduzo o handler com três parâmetros e os logs sem contexto dos enunciados.
import express, { Request, Response } from "express";
import { AppError } from "../src/exercicio2";
import { logger } from "../src/logger";

export const appAntes = express();
let requestId = 0;
appAntes.use((_req, _res, next) => {
  requestId++;
  logger.info("requisição recebida", { requestId });
  next();
});
appAntes.get("/usuarios/:id", async () => {
  throw new AppError("usuário não encontrado", 404);
});
appAntes.get("/pedidos/:id", async (req, res) => {
  logger.info("buscando pedido");
  await new Promise<void>((resolve) => setTimeout(resolve, 30));
  logger.info("pedido encontrado");
  res.json({ id: req.params.id });
});
// O erro do enunciado é a quantidade de parâmetros. Uso unknown sem corrigir esse defeito.
function handlerErrado(erro: unknown, _req: Request, res: Response): void {
  console.error("handler errado foi chamado", erro);
  res.status(500).send("erro");
}
appAntes.use(handlerErrado);
