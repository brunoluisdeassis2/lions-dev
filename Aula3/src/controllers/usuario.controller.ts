import { RequestHandler, Router } from "express";

import { ErroAplicacao } from "../errors/erro-aplicacao";
import { ServicoDeUsuarios } from "../services/servico-usuarios";
import {
  ConsultaDeUsuarios,
  ConsultaVazia,
  CorpoVazio,
  DadosParaAtualizarUsuario,
  DadosParaCriarUsuario,
  ParametrosComId,
  ParametrosVazios,
  RespostaListaDeUsuarios,
  RespostaUsuario,
} from "../types/tipos-http";

export function criarRotasDeUsuarios(
  servico: ServicoDeUsuarios,
): Router {
  const rotas = Router();

  const listar: RequestHandler<
    ParametrosVazios,
    RespostaListaDeUsuarios,
    CorpoVazio,
    ConsultaDeUsuarios
  > = async (requisicao, resposta, proximo) => {
    try {
      let ativo: boolean | undefined = undefined;

      if (requisicao.query.active === "true") {
        ativo = true;
      }

      if (requisicao.query.active === "false") {
        ativo = false;
      }

      if (
        requisicao.query.active !== undefined &&
        requisicao.query.active !== "true" &&
        requisicao.query.active !== "false"
      ) {
        throw new ErroAplicacao("O filtro active deve ser true ou false", 400);
      }

      const usuarios = await servico.listar(ativo);
      resposta.status(200).json(usuarios);
    } catch (erro: unknown) {
      proximo(erro);
    }
  };

  const buscar: RequestHandler<
    ParametrosComId,
    RespostaUsuario,
    CorpoVazio,
    ConsultaVazia
  > = async (requisicao, resposta, proximo) => {
    try {
      const id = Number(requisicao.params.id);
      const usuario = await servico.buscar(id);
      resposta.status(200).json(usuario);
    } catch (erro: unknown) {
      proximo(erro);
    }
  };

  const criar: RequestHandler<
    ParametrosVazios,
    RespostaUsuario,
    DadosParaCriarUsuario,
    ConsultaVazia
  > = async (requisicao, resposta, proximo) => {
    try {
      const usuarioCriado = await servico.criar(requisicao.body);
      resposta.status(201).json(usuarioCriado);
    } catch (erro: unknown) {
      proximo(erro);
    }
  };

  const atualizar: RequestHandler<
    ParametrosComId,
    RespostaUsuario,
    DadosParaAtualizarUsuario,
    ConsultaVazia
  > = async (requisicao, resposta, proximo) => {
    try {
      const id = Number(requisicao.params.id);
      const usuarioAtualizado = await servico.atualizar(id, requisicao.body);
      resposta.status(200).json(usuarioAtualizado);
    } catch (erro: unknown) {
      proximo(erro);
    }
  };

  const remover: RequestHandler<
    ParametrosComId,
    void,
    CorpoVazio,
    ConsultaVazia
  > = async (requisicao, resposta, proximo) => {
    try {
      const id = Number(requisicao.params.id);
      await servico.remover(id);
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
