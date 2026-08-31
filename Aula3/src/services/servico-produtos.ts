import { ErroAplicacao } from "../errors/erro-aplicacao";
import { IProduto } from "../models/produto";

// Sao os dados que o cliente precisa enviar para criar ou atualizar um produto.
interface DadosDoProduto {
  name: string;
  price: number;
  inStock: boolean;
  categories: string[];
}

export class ServicoDeProdutos {
  private produtos: IProduto[] = [];
  private proximoId: number = 1;

  listar(): IProduto[] {
    return this.produtos;
  }

  buscar(id: number): IProduto {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ErroAplicacao("ID invalido", 400);
    }

    const produto = this.produtos.find(function (produtoAtual: IProduto) {
      return produtoAtual.id === id;
    });

    if (produto === undefined) {
      throw new ErroAplicacao("Produto nao encontrado", 404);
    }

    return produto;
  }

  criar(corpo: unknown): IProduto {
    const dados = this.validar(corpo);

    const novoProduto: IProduto = {
      id: this.proximoId,
      name: dados.name.trim(),
      price: dados.price,
      inStock: dados.inStock,
      categories: dados.categories,
    };

    this.produtos.push(novoProduto);
    this.proximoId = this.proximoId + 1;

    return novoProduto;
  }

  atualizar(id: number, corpo: unknown): IProduto {
    // buscar tambem verifica se o ID e valido e se o produto existe.
    this.buscar(id);
    const dados = this.validar(corpo);

    const posicao = this.produtos.findIndex(function (produtoAtual: IProduto) {
      return produtoAtual.id === id;
    });

    const produtoAtualizado: IProduto = {
      id: id,
      name: dados.name.trim(),
      price: dados.price,
      inStock: dados.inStock,
      categories: dados.categories,
    };

    this.produtos[posicao] = produtoAtualizado;
    return produtoAtualizado;
  }

  remover(id: number): void {
    // buscar tambem verifica se o ID e valido e se o produto existe.
    this.buscar(id);

    const posicao = this.produtos.findIndex(function (produtoAtual: IProduto) {
      return produtoAtual.id === id;
    });

    this.produtos.splice(posicao, 1);
  }

  private validar(corpo: unknown): DadosDoProduto {
    if (typeof corpo !== "object" || corpo === null || Array.isArray(corpo)) {
      throw new ErroAplicacao("Envie um produto em formato de objeto", 400);
    }

    const dados = corpo as DadosDoProduto;

    if (typeof dados.name !== "string") {
      throw new ErroAplicacao("O nome deve ser um texto", 400);
    }

    if (dados.name.trim().length < 3) {
      throw new ErroAplicacao("O nome deve ter pelo menos 3 caracteres", 400);
    }

    if (typeof dados.price !== "number") {
      throw new ErroAplicacao("O preco deve ser um numero", 400);
    }

    if (!Number.isFinite(dados.price)) {
      throw new ErroAplicacao("O preco deve ser um numero valido", 400);
    }

    if (dados.price < 0) {
      throw new ErroAplicacao("O preco nao pode ser negativo", 400);
    }

    if (typeof dados.inStock !== "boolean") {
      throw new ErroAplicacao("inStock deve ser verdadeiro ou falso", 400);
    }

    if (!Array.isArray(dados.categories)) {
      throw new ErroAplicacao("categories deve ser uma lista", 400);
    }

    for (const categoria of dados.categories) {
      if (typeof categoria !== "string") {
        throw new ErroAplicacao("As categorias devem ser textos", 400);
      }
    }

    return dados;
  }
}
