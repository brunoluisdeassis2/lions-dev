// Minha ideia: montar uma lista com a quantidade de parcelas que foi pedida.
// buildInstallments significa montar parcelas; total é o valor da compra;
// quantity é a quantidade de parcelas. number[] indica que devolvo uma lista de números.
// Com export, também posso usar esta função no arquivo de testes.
export function buildInstallments(total: number, quantity: number): number[] {
  // Não aceito total infinito, NaN ou negativo.
  // Number.isInteger confere se a quantidade é inteira: 3 pode, 2.5 não pode.
  // Também rejeito zero e negativos. Cada || significa “ou”; ! significa “não”.
  if (!Number.isFinite(total) || total < 0 || !Number.isInteger(quantity) || quantity <= 0) {
    // Se algum dado estiver errado, lanço um erro e paro a função.
    throw new Error("Informe um total não negativo e uma quantidade inteira positiva.");
  }
  // Divido o total pela quantidade. toFixed(2) deixa duas casas decimais,
  // mas devolve um texto. Number(...) transforma esse texto de volta em número.
  // Exemplo: 100 / 3 vira o texto "33.33" e depois o número 33.33.
  const installmentValue = Number((total / quantity).toFixed(2));
  // Crio uma lista vazia para guardar as parcelas. Posso adicionar itens a ela
  // mesmo usando const: o que não posso é trocar esta variável por outra lista.
  const installments: number[] = [];

  // Começo a contar as parcelas em 1. number++ aumenta o contador em 1.
  // Uso <= para incluir a última: com quantidade 3, passo por 1, 2 e 3.
  // Meu erro anterior era usar <, que parava antes de criar a terceira parcela.
  for (let number = 1; number <= quantity; number++) {
    // push coloca um valor no fim da lista. Cada volta adiciona uma parcela.
    // Para estudar no debugger, coloco o breakpoint nesta linha: o programa pausa
    // antes de adicionar, e posso olhar number, quantity e installments.
    installments.push(installmentValue);
  }
  // Entrego a lista pronta para quem chamou a função.
  return installments;
}

// Desafio extra: 33.33 + 33.33 + 33.33 dá 99.99, faltando um centavo.
// Nesta outra função, faço a conta em centavos e deixo a sobra na última parcela.
export function parcelasComAjuste(total: number, quantity: number): number[] {
  // Chamo a função anterior para aproveitar suas verificações de entrada.
  // Ela também monta uma lista, mas aqui não uso essa lista; faço outra com o ajuste.
  buildInstallments(total, quantity);
  // Multiplico por 100 para trabalhar em centavos: 100 reais viram 10000 centavos.
  // Math.round arredonda para o inteiro mais próximo.
  const centavos = Math.round(total * 100);
  // Math.floor arredonda para baixo: 10000 / 3 vira 3333 centavos por parcela base.
  const valorBase = Math.floor(centavos / quantity);
  // Começo outra lista vazia, agora para as parcelas ajustadas.
  const parcelas: number[] = [];
  // Repito uma vez para cada parcela, incluindo a última com <=.
  for (let numero = 1; numero <= quantity; numero++) {
    // Começo com o valor base. Uso let porque posso mudar o valor da última parcela.
    let valor = valorBase;
    // === confere se cheguei à última parcela.
    if (numero === quantity) {
      // Tiro do total o que já foi reservado para as outras parcelas.
      // No exemplo: 10000 - 3333 * (3 - 1) = 3334 centavos.
      valor = centavos - valorBase * (quantity - 1);
    }
    // Divido por 100 para voltar a reais e coloco o valor na lista.
    parcelas.push(valor / 100);
  }
  // Devolvo a lista ajustada: [33.33, 33.33, 33.34] no exemplo de 100 em 3 vezes.
  return parcelas;
}

// Estes exemplos rodam com npm run ex3, mas não quando outro arquivo importa as funções.
if (require.main === module) {
  // Espero três parcelas de 33.33, ainda sem ajuste de centavos.
  console.log(buildInstallments(100, 3));
  // Espero uma parcela de 100.
  console.log(buildInstallments(100, 1));
  // Espero quatro parcelas de 25.
  console.log(buildInstallments(100, 4));
  // Espero 33.33, 33.33 e 33.34: agora a soma fecha em 100.
  console.log("Com ajuste:", parcelasComAjuste(100, 3));
}
