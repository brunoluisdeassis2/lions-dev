// Desafio extra: faço duas fotografias dos objetos vivos usando o Inspector do Node.
// Guardo os arquivos grandes numa pasta temporária, não no GitHub.
const inspector = require("node:inspector");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const pasta = fs.mkdtempSync(path.join(os.tmpdir(), "lions-heap-"));
const session = new inspector.Session();
session.connect();
session.post("HeapProfiler.enable");
const cache = {};
const listeners = [];
const intervalos = [];

function fotografar(quantidade) {
  const arquivo = path.join(pasta, quantidade + ".heapsnapshot");
  const destino = fs.openSync(arquivo, "w");
  const gravar = ({ params }) => fs.writeSync(destino, params.chunk);
  session.on("HeapProfiler.addHeapSnapshotChunk", gravar);
  session.post("HeapProfiler.takeHeapSnapshot", {}, (erro) => {
    if (erro) throw erro;
  });
  session.removeListener("HeapProfiler.addHeapSnapshotChunk", gravar);
  fs.closeSync(destino);

  // Leio o formato do snapshot para contar objetos, sem imprimir o arquivo inteiro.
  const dados = JSON.parse(fs.readFileSync(arquivo, "utf8"));
  const campos = dados.snapshot.meta.node_fields;
  const tipos = dados.snapshot.meta.node_types[0];
  const contagem = { Buffer: 0, Timeout: 0 };
  for (let i = 0; i < dados.nodes.length; i += campos.length) {
    const tipo = tipos[dados.nodes[i + campos.indexOf("type")]];
    const nome = dados.strings[dados.nodes[i + campos.indexOf("name")]];
    if (tipo === "object" && Object.hasOwn(contagem, nome)) contagem[nome]++;
  }
  console.log(JSON.stringify({ quantidade, arquivo, objetos: contagem, callbacksRetidos: listeners.length }));
}

try {
  for (let i = 0; i < 2000; i++) {
    const id = `req-${i}`;
    cache[id] = Buffer.alloc(1024 * 512);
    listeners.push(() => console.log(id));
    intervalos.push(setInterval(() => { void cache[id]; }, 1000));
    if (i === 199 || i === 1999) fotografar(i + 1);
  }
} finally {
  for (const intervalo of intervalos) clearInterval(intervalo);
  session.disconnect();
}
