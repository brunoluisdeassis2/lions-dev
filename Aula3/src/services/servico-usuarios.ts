import { ErroAplicacao } from "../errors/erro-aplicacao";
import { IUsuario } from "../models/usuario";
import { IRepositorioDeUsuarios } from "../repositories/repositorio-usuarios";
import { DadosParaAtualizarUsuario } from "../types/tipos-http";

// O Service cuida das regras, mas nao sabe onde os usuarios estao guardados.
export class ServicoDeUsuarios {
  constructor(private repositorio: IRepositorioDeUsuarios) {}

  async listar(ativo?: boolean): Promise<IUsuario[]> {
    const usuarios = await this.repositorio.listar();

    if (ativo === undefined) {
      return usuarios;
    }

    return usuarios.filter(function (usuario: IUsuario) {
      return usuario.isActive === ativo;
    });
  }

  async buscar(id: number): Promise<IUsuario> {
    this.validarId(id);

    const usuario = await this.repositorio.buscarPorId(id);

    if (usuario === undefined) {
      throw new ErroAplicacao("Usuario nao encontrado", 404);
    }

    return usuario;
  }

  async criar(usuario: IUsuario): Promise<IUsuario> {
    this.validarUsuario(usuario);

    const usuarios = await this.repositorio.listar();

    const idJaExiste = usuarios.find(function (usuarioAtual: IUsuario) {
      return usuarioAtual.id === usuario.id;
    });

    if (idJaExiste !== undefined) {
      throw new ErroAplicacao("Ja existe um usuario com esse ID", 400);
    }

    const emailJaExiste = usuarios.find(function (usuarioAtual: IUsuario) {
      return usuarioAtual.email === usuario.email;
    });

    if (emailJaExiste !== undefined) {
      throw new ErroAplicacao("Ja existe um usuario com esse email", 400);
    }

    return this.repositorio.criar(usuario);
  }

  async atualizar(
    id: number,
    dados: DadosParaAtualizarUsuario,
  ): Promise<IUsuario> {
    this.validarId(id);
    this.validarAtualizacao(dados);

    const usuarioAtualizado = await this.repositorio.atualizar(id, dados);

    if (usuarioAtualizado === undefined) {
      throw new ErroAplicacao("Usuario nao encontrado", 404);
    }

    return usuarioAtualizado;
  }

  async remover(id: number): Promise<void> {
    this.validarId(id);

    const removeu = await this.repositorio.remover(id);

    if (removeu === false) {
      throw new ErroAplicacao("Usuario nao encontrado", 404);
    }
  }

  private validarId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ErroAplicacao("ID invalido", 400);
    }
  }

  private validarUsuario(usuario: IUsuario): void {
    if (
      typeof usuario.id !== "number" ||
      typeof usuario.nome !== "string" ||
      typeof usuario.email !== "string" ||
      typeof usuario.isActive !== "boolean"
    ) {
      throw new ErroAplicacao("Dados do usuario invalidos", 400);
    }
  }

  private validarAtualizacao(dados: DadosParaAtualizarUsuario): void {
    if (Object.keys(dados).length === 0) {
      throw new ErroAplicacao("Envie algum dado para atualizar", 400);
    }

    if (dados.nome !== undefined && typeof dados.nome !== "string") {
      throw new ErroAplicacao("Nome invalido", 400);
    }

    if (dados.email !== undefined && typeof dados.email !== "string") {
      throw new ErroAplicacao("Email invalido", 400);
    }

    if (dados.isActive !== undefined && typeof dados.isActive !== "boolean") {
      throw new ErroAplicacao("isActive deve ser verdadeiro ou falso", 400);
    }
  }
}
