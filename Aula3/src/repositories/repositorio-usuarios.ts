import { IUsuario } from "../models/usuario";
import { DadosParaAtualizarUsuario } from "../types/tipos-http";

// A interface e uma lista das operacoes que o Repository promete oferecer.
export interface IRepositorioDeUsuarios {
  listar(): Promise<IUsuario[]>;
  buscarPorId(id: number): Promise<IUsuario | undefined>;
  criar(usuario: IUsuario): Promise<IUsuario>;
  atualizar(
    id: number,
    dados: DadosParaAtualizarUsuario,
  ): Promise<IUsuario | undefined>;
  remover(id: number): Promise<boolean>;
}

// Esta versao guarda os usuarios em um array na memoria.
export class RepositorioDeUsuarios implements IRepositorioDeUsuarios {
  private usuarios: IUsuario[] = [
    {
      id: 1,
      nome: "Ana",
      email: "ana@gmail.com",
      isActive: true,
    },
    {
      id: 2,
      nome: "Bruno",
      email: "bruno@gmail.com",
      isActive: true,
    },
  ];

  async listar(): Promise<IUsuario[]> {
    return this.usuarios;
  }

  async buscarPorId(id: number): Promise<IUsuario | undefined> {
    return this.usuarios.find(function (usuario: IUsuario) {
      return usuario.id === id;
    });
  }

  async criar(usuario: IUsuario): Promise<IUsuario> {
    this.usuarios.push(usuario);
    return usuario;
  }

  async atualizar(
    id: number,
    dados: DadosParaAtualizarUsuario,
  ): Promise<IUsuario | undefined> {
    const posicao = this.usuarios.findIndex(function (usuario: IUsuario) {
      return usuario.id === id;
    });

    if (posicao === -1) {
      return undefined;
    }

    const usuarioAtualizado: IUsuario = {
      ...this.usuarios[posicao],
      ...dados,
      id: id,
    };

    this.usuarios[posicao] = usuarioAtualizado;
    return usuarioAtualizado;
  }

  async remover(id: number): Promise<boolean> {
    const posicao = this.usuarios.findIndex(function (usuario: IUsuario) {
      return usuario.id === id;
    });

    if (posicao === -1) {
      return false;
    }

    this.usuarios.splice(posicao, 1);
    return true;
  }
}
