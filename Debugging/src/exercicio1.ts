// Minha ideia aqui: somar os preços e dar 10% de desconto se a soma chegar a 100.
// Mantive os nomes do enunciado: calculateTotal = calcular total; prices = preços.
// Com export, deixo outros arquivos usarem esta função. function cria a função.
// prices: number[] diz que recebo uma lista de números. O : number depois
// dos parênteses diz que a função devolve um número.
export function calculateTotal(prices: number[]): number {
  // Começo a soma em zero. Uso let porque vou mudar esse valor durante a conta.
  let subtotal = 0;

  // Meu for repete a soma para cada preço da lista. index é a posição do preço.
  // Começo em 0; continuo enquanto index for menor que o tamanho da lista;
  // index++ aumenta a posição em 1 a cada volta. length é o tamanho da lista.
  // Anotei o erro: [40, 60] tem tamanho 2, mas só tem as posições 0 e 1.
  // Se eu usasse <= aqui, tentaria ler a posição 2, que não existe.
  for (let index = 0; index < prices.length; index++) {
    // Leio prices[index] como “o preço da posição atual”.
    // += é uma forma curta de escrever: subtotal = subtotal + prices[index].
    // Com [40, 60], minha soma passa de 0 para 40 e depois para 100.
    subtotal += prices[index];
  }

  // if significa “se”. Só entro neste bloco se a soma for maior ou igual a 100.
  // Preciso do = junto com > para incluir a compra de exatamente 100.
  if (subtotal >= 100) {
    // const guarda um valor que não vou trocar depois.
    // 0.1 representa 10%: para uma compra de 100, o desconto é 10.
    const desconto = subtotal * 0.1;
    // return devolve o resultado e encerra esta chamada da função.
    // Devolvo o valor a pagar: 100 - 10 = 90. Devolver só o desconto daria 10.
    return subtotal - desconto;
  }
  // Se não entrei no if, a compra ficou abaixo de 100. Devolvo a soma sem desconto.
  return subtotal;
}

// Este trecho só roda quando executo este arquivo diretamente, com npm run ex1.
// Se outro arquivo importar minha função, estes exemplos não rodam sozinhos.
// console.log mostra no terminal o resultado de cada chamada abaixo.
if (require.main === module) {
  // Espero 50: 20 + 30 não alcança o mínimo para ganhar desconto.
  console.log(calculateTotal([20, 30]));
  // Espero 90: a soma é exatamente 100 e também recebe 10% de desconto.
  console.log(calculateTotal([40, 60]));
  // Espero 108: a soma é 120 e retiro 12 de desconto.
  console.log(calculateTotal([80, 40]));
  // Espero 0: [] é uma lista vazia, então o for não faz nenhuma soma.
  console.log(calculateTotal([]));
}
