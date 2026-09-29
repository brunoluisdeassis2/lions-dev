// Guardei os dois erros originais. Executo em processos separados para observar ambos.
import fs from "node:fs";

function readConfig(path: string): void {
  try {
    fs.promises.readFile(path, "utf-8").then((content) => {
      console.log("config carregada", JSON.parse(content));
    });
  } catch (erro: unknown) {
    console.error("catch síncrono foi acionado", erro);
  }
}

if (process.argv[2] === "timer") {
  setTimeout(() => { throw new Error("tentativa de releitura falhou"); }, 200);
} else {
  readConfig("./config/nao-existe.json");
}
console.log("A parte síncrona terminou; a falha ainda vai acontecer.");
