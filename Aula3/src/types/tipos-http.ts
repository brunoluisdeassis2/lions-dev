import { IProduto } from "../models/produto";
import { IUsuario } from "../models/usuario";

// Usamos estes tipos quando a rota nao recebe determinada informacao.
export type ParametrosVazios = Record<string, never>;
export type CorpoVazio = Record<string, never>;
export type ConsultaVazia = Record<string, never>;

// Toda rota com /:id recebe o id como texto.
export interface ParametrosComId {
  id: string;
}

// GET /users pode receber, por exemplo, ?active=true.
export interface ConsultaDeUsuarios {
  active?: string;
}

export interface DadosParaAtualizarUsuario {
  nome?: string;
  email?: string;
  isActive?: boolean;
}

export interface DadosDeProduto {
  name: string;
  price: number;
  inStock: boolean;
  categories: string[];
}

// Estes nomes deixam claro o corpo esperado por cada operacao.
export type DadosParaCriarUsuario = IUsuario;
export type DadosParaCriarProduto = DadosDeProduto;
export type DadosParaAtualizarProduto = DadosDeProduto;

// Estas respostas sao usadas pelos handlers tipados.
export type RespostaListaDeUsuarios = IUsuario[];
export type RespostaUsuario = IUsuario;
export type RespostaListaDeProdutos = IProduto[];
export type RespostaProduto = IProduto;
