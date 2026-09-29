// Minha ideia: primeiro somar a compra inteira, depois aplicar o desconto uma única vez.
export interface Item {
  price: number; // Anotei: price é o preço de uma unidade.
  qty: number; // qty é a quantidade comprada daquele item.
}

export function applyDiscount(items: Item[]): number {
  let total = 0;
  for (let index = 0; index < items.length; index++) {
    // Multiplico o preço pela quantidade e acrescento ao total ainda SEM desconto.
    total += items[index].price * items[index].qty;
  }
  // A regra diz “ultrapassa 200”, então exatamente 200 NÃO ganha desconto.
  // Fora do laço, faço a conta só uma vez, sobre a soma completa.
  if (total > 200) total = total - total * 0.05;
  // toFixed devolve texto com duas casas; Number converte esse texto em número.
  return Number(total.toFixed(2));
}

if (require.main === module) {
  const items = [{ price: 100, qty: 1 }, { price: 150, qty: 1 }, { price: 50, qty: 2 }];
  console.log("Ordem original:", applyDiscount(items));
  // reverse inverte a lista. Faço uma cópia com [...items] para preservar a original.
  console.log("Ordem invertida:", applyDiscount([...items].reverse()));
}
