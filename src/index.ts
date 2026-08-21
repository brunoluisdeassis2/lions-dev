// Interfaces usadas nos exemplos do exercício.
interface IUser {
  id: number;
  name: string;
  email: string;
}

interface IProduct {
  id: number;
  name: string;
  price: number;
}

// T representa o tipo dos itens recebidos.
// A função retorna o mesmo array, mantendo o tipo original.
function getData<T>(items: T[]): T[] {
  return items;
}

const names: string[] = ["Ana", "Bruno", "Carlos"];
const numbers: number[] = [10, 20, 30];

const users: IUser[] = [
  { id: 1, name: "Ana", email: "ana@email.com" },
  { id: 2, name: "Bruno", email: "bruno@email.com" },
];

// Testes de getData com strings, numbers e objetos IUser.
console.log("Strings:", getData<string>(names));
console.log("Numbers:", getData<number>(numbers));
console.log("Usuários:", getData<IUser>(users));

// T precisa ser um objeto que possua uma propriedade id do tipo number.
// find retorna o objeto encontrado ou undefined quando o id não existe.
function getById<T extends { id: number }>(
  items: T[],
  id: number,
): T | undefined {
  return items.find((item) => item.id === id);
}

const products: IProduct[] = [
  { id: 1, name: "Notebook", price: 3500 },
  { id: 2, name: "Mouse", price: 120 },
];

// Testes de getById com arrays de IUser e IProduct.
console.log("Usuário encontrado:", getById<IUser>(users, 2));
console.log("Produto encontrado:", getById<IProduct>(products, 1));
console.log("Produto inexistente:", getById<IProduct>(products, 99));
