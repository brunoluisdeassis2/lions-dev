// Guardei a versão ERRADA para investigar com breakpoint, sem encher o laço de logs.
import { Item } from "../src/exercicio10";

export function descontoAntes(items: Item[]): number {
  let total = 0;
  let applied = 0;
  for (let index = 0; index < items.length; index++) {
    total += items[index].price * items[index].qty;
    // Coloco o breakpoint nesta condição. O Watch mostra o estado ANTES do desconto.
    if (total > 200 && applied < 2) {
      total = total - total * 0.05;
      applied++;
    }
  }
  return Number(total.toFixed(2));
}

if (require.main === module) {
  const items = [{ price: 100, qty: 1 }, { price: 150, qty: 1 }, { price: 50, qty: 2 }];
  console.log("Original:", descontoAntes(items));
  console.log("Invertida:", descontoAntes([...items].reverse()));
  // Neste exemplo, inverter mantém os valores por item em 100, 150, 100!
  // Também testo outra ordem, que de fato muda a sequência para 100, 100, 150.
  console.log("Outra ordem:", descontoAntes([items[0], items[2], items[1]]));
}
