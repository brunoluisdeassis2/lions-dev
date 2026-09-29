// Minha reprodução do Watch usa o Inspector do Node, o mecanismo de depuração do runtime.
// No VS Code eu posso observar as mesmas expressões com a configuração da lista 3.
const inspector = require("node:inspector");
const fs = require("node:fs");
const path = require("node:path");
const session = new inspector.Session();
session.connect();
session.post("Debugger.enable");

// Localizo a condição no JavaScript compilado, sem depender de um número de linha fixo.
const arquivo = path.resolve("dist/investigacao/desconto-antes.js");
const linha = fs.readFileSync(arquivo, "utf8").split("\n").findIndex((texto) => texto.includes("if (total > 200"));
session.post("Debugger.setBreakpointByUrl", { url: "file://" + arquivo, lineNumber: linha });
let paradas = 0;
let avancando = false;
session.on("Debugger.paused", ({ params }) => {
  if (avancando) {
    console.log("Step Over: avancei a execução da condição.");
    avancando = false;
    session.post("Debugger.resume");
    return;
  }
  paradas++;
  const expressao = "JSON.stringify({ total, applied, index, valorItem: items[index].price * items[index].qty, somaBruta: items.reduce((soma, item) => soma + item.price * item.qty, 0), somaAteAqui: items.slice(0, index + 1).reduce((soma, item) => soma + item.price * item.qty, 0) })";
  session.post("Debugger.evaluateOnCallFrame", {
    callFrameId: params.callFrames[0].callFrameId, expression: expressao,
  }, (erro, resultado) => {
    if (erro) throw erro;
    console.log("Watch antes da condição:", resultado.result.value);
  });
  avancando = true;
  session.post("Debugger.stepOver");
});
const { descontoAntes } = require(arquivo);
const items = [{ price: 100, qty: 1 }, { price: 150, qty: 1 }, { price: 50, qty: 2 }];
console.log("Inspector real; não é uma captura da interface gráfica do VS Code.");
console.log("Resultado original:", descontoAntes(items));
session.disconnect();
if (paradas !== 3) throw new Error("Esperava observar as três iterações.");
console.log("Resultado invertido:", descontoAntes([...items].reverse()));
console.log("Resultado outra ordem:", descontoAntes([items[0], items[2], items[1]]));
