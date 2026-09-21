// Minhas verificações: comparo o que o código devolve com o resultado que espero.
// assert é uma ferramenta do Node que lança um erro quando uma comparação não passa.
import assert from "node:assert/strict";
// Trago as funções dos exercícios e a aplicação para testá-las neste arquivo.
import { calculateTotal } from "./exercicio1";
import { AppError, divide, validarEntrada } from "./exercicio2";
import { buildInstallments, parcelasComAjuste } from "./exercicio3";
import { processOrder } from "./exercicio4";
import { app } from "./server";

// Uso async porque algumas verificações precisam esperar pedidos e respostas.
// Promise<void> indica que, ao terminar, não devolvo um valor: apenas concluo ou falho.
async function verificar(): Promise<void> {
  // equal confere se dois valores são iguais: resultado obtido primeiro, esperado depois.
  // Aqui testo a compra abaixo de 100, igual a 100, acima de 100 e a lista vazia.
  assert.equal(calculateTotal([20, 30]), 50);
  assert.equal(calculateTotal([40, 60]), 90);
  assert.equal(calculateTotal([80, 40]), 108);
  assert.equal(calculateTotal([]), 0);
  // Para a divisão válida, espero que 10 dividido por 2 dê 5.
  assert.equal(divide(validarEntrada({ numerator: 10, denominator: 2 })), 5);
  // Repito a validação com entradas erradas: valor ausente, null, objeto vazio, texto, NaN e Infinity.
  for (const entrada of [undefined, null, {}, { numerator: "10", denominator: 2 }, { numerator: NaN, denominator: 2 }, { numerator: 1, denominator: Infinity }]) {
    // throws confere se a função realmente lança o erro esperado, neste caso AppError.
    // Passo uma função com () => para o teste poder executar e observar a falha.
    assert.throws(() => validarEntrada(entrada), AppError);
  }
  // Confiro se dividir por zero é rejeitado.
  assert.throws(() => divide({ numerator: 1, denominator: 0 }), AppError);
  // Também testo uma conta que passa do maior número finito que o JavaScript consegue representar.
  assert.throws(() => divide({ numerator: Number.MAX_VALUE, denominator: 0.1 }), AppError);
  // deepEqual compara o conteúdo das listas, item por item.
  // Confiro três, uma e quatro parcelas, e depois a versão com ajuste de centavos.
  assert.deepEqual(buildInstallments(100, 3), [33.33, 33.33, 33.33]);
  assert.deepEqual(buildInstallments(100, 1), [100]);
  assert.deepEqual(buildInstallments(100, 4), [25, 25, 25, 25]);
  assert.deepEqual(parcelasComAjuste(100, 3), [33.33, 33.33, 33.34]);
  // Quantidade zero precisa provocar um erro, não gerar uma lista aparentemente válida.
  assert.throws(() => buildInstallments(100, 0));
  // Espero o processamento do pedido válido e confiro se a soma é 100.
  assert.equal(await processOrder("1"), 100);
  // rejects confere a falha de uma Promise. O trecho entre /.../ procura o texto na mensagem.
  await assert.rejects(processOrder("inexistente"), /Pedido não encontrado/);

  // Inicio um servidor local para os testes. A porta 0 pede ao sistema uma porta disponível.
  const server = app.listen(0, "127.0.0.1");
  // Espero o evento listening, que avisa que já posso enviar requisições.
  // once escuta só a primeira ocorrência; resolve conclui esta espera.
  await new Promise<void>((resolve) => server.once("listening", resolve));
  // Uso try/finally para fechar o servidor mesmo se alguma comparação falhar.
  try {
    // Consulto o endereço para descobrir qual porta o sistema escolheu.
    const endereco = server.address();
    // Confiro se recebi um objeto de endereço antes de tentar ler sua porta.
    if (!endereco || typeof endereco === "string") throw new Error("Sem porta");
    // Set guarda valores sem repetição. Vou usá-lo para conferir se cada resposta recebeu um ID diferente.
    const ids = new Set<string>();
    // Cada par abaixo contém uma rota e o status que espero dela.
    // [rota, status] separa os dois valores do par em variáveis.
    // as const preserva os valores literais e a estrutura dos pares na tipagem do TypeScript.
    for (const [rota, status] of [["/health", 200], ["/rota-inexistente", 404], ["/usuarios/42", 200], ["/erro", 500], ["/lento", 200], ["/crash", 500], ["/crash", 500]] as const) {
      // Marco o instante antes da requisição para conferir a duração da rota lenta.
      const inicio = performance.now();
      // fetch faz o pedido HTTP; await espera chegar a resposta.
      // No texto entre crases, ${...} insere a porta e a rota no endereço.
      // globalThis.Response é o tipo da resposta do fetch, não a resposta do Express.
      const resposta: globalThis.Response = await fetch(`http://127.0.0.1:${endereco.port}${rota}`);
      // Espero a leitura do corpo da resposta e guardo seu conteúdo como texto.
      const corpo = await resposta.text();
      // Comparo o status recebido com o que anotei no par da rota.
      assert.equal(resposta.status, status);
      // ok exige uma condição verdadeira. Aqui confiro se veio o cabeçalho com o ID.
      assert.ok(resposta.headers.get("x-request-id"));
      // Guardo o ID no Set. O ! depois da chamada diz ao TypeScript que este valor existe.
      // Esse ! não valida nada sozinho; a verificação real está na linha anterior.
      ids.add(resposta.headers.get("x-request-id")!);
      // Na rota lenta, confiro se houve uma espera próxima dos 200 ms programados.
      if (rota === "/lento") assert.ok(performance.now() - inicio >= 190);
      // Se a resposta é de erro, confiro se ela não expõe o stack nem a mensagem interna da fila.
      // && significa “e”: as duas condições precisam ser verdadeiras.
      if (status === 500) assert.ok(!corpo.includes("stack") && !corpo.includes("falha ao processar"));
      // Mostro no terminal qual cenário passou.
      console.log("Verificado:", rota, status);
    }
    // São sete requisições. Espero sete IDs diferentes; size informa quantos valores há no Set.
    assert.equal(ids.size, 7);
  // Este bloco roda mesmo quando algum teste lança erro.
  } finally {
    // Fecho o servidor que abri só para esta verificação.
    server.close();
  }
  // Só chego a esta mensagem se nenhuma verificação anterior falhou.
  console.log("Todos os cenários passaram.");
}
// Inicio os testes. Se a Promise falhar, mostro o erro e marco a saída com 1
// para o terminal saber que a verificação não passou.
verificar().catch((erro: unknown) => { console.error(erro); process.exitCode = 1; });
