// Minhas verificações comparam resultados reais com o que os enunciados pedem.
import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import { PassThrough } from "node:stream";
import express from "express";
import winston from "winston";
import { app } from "./server";
import { logger } from "./logger";
import { AppError } from "./exercicio2";
import { readConfig, retryLater, fetchConfig } from "./exercicio7";
import { applyDiscount } from "./exercicio10";
import { CacheLimitado } from "./exercicio11";
import { errorHandler } from "./errorHandler";

async function verificar(): Promise<void> {
  // Também leio os logs em memória para conferir os IDs. O console continua ativo.
  const stream = new PassThrough();
  let saida = "";
  stream.on("data", (parte: Buffer) => { saida += parte.toString(); });
  const transporte = new winston.transports.Stream({ stream });
  logger.add(transporte);
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const endereco = server.address();
  assert.ok(endereco && typeof endereco !== "string");
  const base = `http://127.0.0.1:${endereco.port}`;
  try {
    // Testo os cinco cenários de leitura e fetch; cada rejeição é esperada e tratada.
    assert.deepEqual(await readConfig("config/app.json"), { nome: "Minha API de estudos", porta: 3001 });
    console.log("EX7: arquivo válido, sem erro");
    await assert.rejects(readConfig("config/nao-existe.json"), (erro: unknown) => {
      return erro instanceof AppError && erro.statusCode === 404 && erro.cause instanceof Error;
    });
    console.log("EX7: arquivo ausente virou AppError 404");
    await assert.rejects(readConfig("config/invalido.txt"), SyntaxError);
    console.log("EX7: JSON inválido identificado como SyntaxError");
    await assert.rejects(fetchConfig("http://nao-existe.invalid"), TypeError);
    await assert.rejects(fetchConfig("isto não é uma URL"), TypeError);
    const resposta404 = await fetch(base + "/ausente");
    assert.equal(resposta404.status, 404);
    console.log("EX7: fetch resolveu normalmente com status", resposta404.status);
    await assert.rejects(fetchConfig(base + "/ausente"), (erro: unknown) => erro instanceof AppError && erro.statusCode === 404);
    await assert.rejects(retryLater(), /releitura falhou/);
    console.log("EX7: falhas de rede, HTTP e temporizador tratadas; processo continua vivo");

    for (const [rota, esperado] of [["/usuarios/42", 200], ["/usuarios/999", 404], ["/usuarios/erro", 500], ["/erro-async", 500], ["/nao-registrada", 404]] as const) {
      const resposta = await fetch(base + rota);
      const corpo: unknown = await resposta.json();
      assert.equal(resposta.status, esperado);
      console.log("EX8:", rota, resposta.status, JSON.stringify(corpo));
      if (esperado !== 200) {
        assert.ok(typeof corpo === "object" && corpo !== null);
        assert.deepEqual(Object.keys(corpo).sort(), ["message", "statusCode", "timestamp"]);
        assert.ok("statusCode" in corpo && corpo.statusCode === esperado);
        assert.ok("timestamp" in corpo && typeof corpo.timestamp === "string" && !Number.isNaN(Date.parse(corpo.timestamp)));
        assert.ok(!JSON.stringify(corpo).includes("stack"));
        if (esperado === 500) assert.ok("message" in corpo && corpo.message === "Não foi possível concluir a operação.");
      }
    }

    // Promise.all inicia as três requisições sem esperar uma terminar antes da outra.
    const respostas = await Promise.all(["1", "2", "3"].map((id) => fetch(base + "/pedidos/" + id)));
    const ids: string[] = [];
    for (const resposta of respostas) {
      assert.equal(resposta.status, 200);
      await resposta.text();
      const id = resposta.headers.get("X-Request-Id");
      assert.ok(id);
      ids.push(id);
    }
    assert.equal(new Set(ids).size, 3);
    const erro = await fetch(base + "/pedidos/erro", { headers: { "X-Request-Id": "meu-teste-erro" } });
    assert.equal(erro.headers.get("X-Request-Id"), "meu-teste-erro");
    assert.equal(erro.status, 500);
    await erro.text();
    const invalido = await fetch(base + "/health", { headers: { "X-Request-Id": "!id-invalido!" } });
    assert.notEqual(invalido.headers.get("X-Request-Id"), "!id-invalido!");
    await invalido.text();

    // Dou uma volta no ciclo de eventos para os registros de conclusão terminarem.
    await new Promise<void>((resolve) => setImmediate(resolve));
    const logs = saida.trim().split("\n").map((linha) => JSON.parse(linha) as Record<string, unknown>);
    for (const id of ids) {
      const grupo = logs.filter((linha) => linha.requestId === id);
      assert.deepEqual(grupo.map((linha) => linha.message), ["requisição recebida", "buscando pedido", "pedido encontrado", "request"]);
    }
    const falha = logs.filter((linha) => linha.requestId === "meu-teste-erro");
    assert.deepEqual(falha.map((linha) => linha.message), ["requisição recebida", "buscando pedido", "Falha interna simulada ao buscar pedido", "request"]);
    assert.equal(falha.filter((linha) => linha.level === "error").length, 1);
    assert.equal(typeof falha[2].stack, "string");
    console.log("EX9: três IDs distintos e estáveis; ID do cliente preservado até o log de erro");
    console.log("FILTRO_ID:", ids[0]);

    const items = [{ price: 100, qty: 1 }, { price: 150, qty: 1 }, { price: 50, qty: 2 }];
    for (const ordem of [items, [...items].reverse(), [items[0], items[2], items[1]]]) assert.equal(applyDiscount(ordem), 332.5);
    assert.equal(applyDiscount([{ price: 180, qty: 1 }]), 180);
    assert.equal(applyDiscount([{ price: 200, qty: 1 }]), 200);
    assert.equal(applyDiscount([{ price: 500, qty: 1 }]), 475);
    assert.equal(applyDiscount([]), 0);
    console.log("EX10: 180→180; 200→200; três ordens→332.5; 500→475; vazia→0");

    const cache = new CacheLimitado();
    try {
      for (let i = 0; i < 2000; i++) {
        cache.handleRequest(String(i));
        assert.ok(cache.tamanho <= 20);
      }
      await new Promise<void>((resolve) => setTimeout(resolve, 1100));
      assert.equal(cache.tamanho, 0); // Confiro a expiração, não apenas o limite.
    } finally { cache.encerrar(); }
    assert.equal(cache.tamanho, 0);
    console.log("EX11: limite, expiração e encerramento verificados");
  } finally {
    server.close();
    logger.remove(transporte);
  }

  // Verifico separadamente o caso em que a resposta já começou.
  const parcial = express();
  let encaminhou = false;
  parcial.get("/", (_req, res, next) => { res.write("inicio"); next(new Error("Falha após os cabeçalhos")); });
  parcial.use(errorHandler);
  parcial.use(((erro: unknown, _req, res, _next) => {
    assert.ok(erro instanceof Error);
    encaminhou = true;
    res.end(); // Só concluo a resposta existente, sem tentar enviar outro JSON.
  }) as import("express").ErrorRequestHandler);
  const servidorParcial = createServer(parcial).listen(0, "127.0.0.1");
  await once(servidorParcial, "listening");
  try {
    const endereco = servidorParcial.address();
    assert.ok(endereco && typeof endereco !== "string");
    const resposta = await fetch(`http://127.0.0.1:${endereco.port}`);
    assert.equal(await resposta.text(), "inicio");
    assert.ok(encaminhou);
  } finally { servidorParcial.close(); }
  console.log("Todos os cenários da lista 3 passaram.");
}

// Não escondo falhas dos testes: mostro o erro e marco o comando como malsucedido.
verificar().catch((erro: unknown) => { console.error(erro); process.exitCode = 1; });
