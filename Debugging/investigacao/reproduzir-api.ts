// Registro o comportamento real da API defeituosa antes de comparar com a solução.
import { once } from "node:events";
import { appAntes } from "./api-antes";

async function reproduzir(): Promise<void> {
  const server = appAntes.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const endereco = server.address();
    if (!endereco || typeof endereco === "string") throw new Error("Sem porta");
    const base = `http://127.0.0.1:${endereco.port}`;
    const resposta = await fetch(base + "/usuarios/999");
    console.log("EX8 ANTES: status", resposta.status);
    console.log("EX8 ANTES: content-type", resposta.headers.get("content-type"));
    console.log("EX8 ANTES: corpo", await resposta.text());
    console.log("EX9 ANTES: três requisições concorrentes");
    await Promise.all(["1", "2", "3"].map(async (id) => {
      const resposta = await fetch(base + "/pedidos/" + id);
      await resposta.text();
    }));
  } finally { server.close(); }
}
reproduzir().catch((erro: unknown) => { console.error(erro); process.exitCode = 1; });
