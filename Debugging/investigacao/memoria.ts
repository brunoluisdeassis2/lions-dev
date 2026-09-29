// Minha investigação fica separada do cache corrigido: estes logs não vão para a API.
import { CacheLimitado } from "../src/exercicio11";

const modo = process.argv[2] || "antes";
const cache: Record<string, Buffer> = {};
const listeners: Array<() => void> = [];
// Guardo os intervalos só para conseguir limpar esta reprodução quando ela terminar.
const intervalos: NodeJS.Timeout[] = [];
const corrigido = modo === "corrigido" ? new CacheLimitado() : undefined;

function medir(iteracoes: number): void {
  // A coleta manual exige --expose-gc. Uso a mesma condição nos três experimentos.
  // Mesmo após GC, os dados que ainda têm referência continuam ocupando memória.
  global.gc?.();
  const uso = process.memoryUsage();
  const mb = (bytes: number) => Number((bytes / 1024 / 1024).toFixed(2));
  console.log(JSON.stringify({
    modo, iteracoes, rssMiB: mb(uso.rss), heapTotalMiB: mb(uso.heapTotal),
    heapUsedMiB: mb(uso.heapUsed), externalMiB: mb(uso.external),
    arrayBuffersMiB: mb(uso.arrayBuffers),
    entradas: corrigido ? corrigido.tamanho : Object.keys(cache).length,
    listeners: listeners.length, intervalos: corrigido ? 1 : intervalos.length,
  }));
}

try {
  medir(0);
  for (let i = 0; i < 2000; i++) {
    const id = `req-${i}`;
    if (corrigido) {
      corrigido.handleRequest(id);
    } else {
      cache[id] = Buffer.alloc(1024 * 512);
      listeners.push(() => console.log(id));
      if (modo !== "sem-timer") {
        intervalos.push(setInterval(() => { void cache[id]; }, 1000));
      }
    }
    // Meço depois de completar 200, 400, ... 2000 pedidos, sempre nos mesmos pontos.
    if ((i + 1) % 200 === 0) medir(i + 1);
  }
} finally {
  corrigido?.encerrar();
  for (const intervalo of intervalos) clearInterval(intervalo);
}
