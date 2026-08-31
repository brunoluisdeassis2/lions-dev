import { RequestHandler, Router } from "express";

import { ServicoDeProdutos } from "../services/servico-produtos";
import {
  ConsultaVazia,
  CorpoVazio,
  DadosParaAtualizarProduto,
  DadosParaCriarProduto,
  ParametrosComId,
  ParametrosVazios,
  RespostaListaDeProdutos,
  RespostaProduto,
} from "../types/tipos-http";

export function criarRotasDeProdutos(servico: ServicoDeProdutos): Router {
  const rotas = Router();

  const listar: RequestHandler<
    ParametrosVazios,
    RespostaListaDeProdutos,
    CorpoVazio,
    ConsultaVazia
  > = (requisicao, resposta) => {
    const produtos = servico.listar();
    resposta.status(200).json(produtos);

    void requisicao;
  };

  const buscar: RequestHandler<
    ParametrosComId,
    RespostaProduto,
    CorpoVazio,
    ConsultaVazia
  > = (requisicao, resposta, proximo) => {
    try {
      const id = Number(requisicao.params.id);
      const produto = servico.buscar(id);
      resposta.status(200).json(produto);
    } catch (erro: unknown) {
      proximo(erro);
    }
  };

  const criar: RequestHandler<
    ParametrosVazios,
    RespostaProduto,
    DadosParaCriarProduto,
    ConsultaVazia
  > = (requisicao, resposta, proximo) => {
    try {
      const produtoCriado = servico.criar(requisicao.body);
      resposta.status(201).json(produtoCriado);
    } catch (erro: unknown) {
      proximo(erro);
    }
  };

  const atualizar: RequestHandler<
    ParametrosComId,
    RespostaProduto,
    DadosParaAtualizarProduto,
    ConsultaVazia
  > = (requisicao, resposta, proximo) => {
    try {
      const id = Number(requisicao.params.id);
      const produtoAtualizado = servico.atualizar(id, requisicao.body);
      resposta.status(200).json(produtoAtualizado);
    } catch (erro: unknown) {
      proximo(erro);
    }
  };

  const remover: RequestHandler<
    ParametrosComId,
    void,
    CorpoVazio,
    ConsultaVazia
  > = (requisicao, resposta, proximo) => {
    try {
      const id = Number(requisicao.params.id);
      servico.remover(id);
      resposta.status(204).send();
    } catch (erro: unknown) {
      proximo(erro);
    }
  };

  rotas.get("/", listar);
  rotas.get("/:id", buscar);
  rotas.post("/", criar);
  rotas.put("/:id", atualizar);
  rotas.delete("/:id", remover);

  return rotas;
}
