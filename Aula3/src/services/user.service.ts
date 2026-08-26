// Importamos a interface que explica o formato de um usuário.
import { IUser } from "../models/user";

// Esta classe guarda e manipula os usuários da aplicação.
export class UserService {
  // "private" impede que as rotas alterem o array diretamente.
  // Assim, toda alteração precisa passar pelos métodos da classe.
  private users: IUser[] = [
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

  // Devolve a lista completa de usuários.
  getAll(): IUser[] {
    return this.users;
  }

  // Procura um usuário pelo ID.
  // Se não encontrar, o find devolve undefined.
  getById(id: number): IUser | undefined {
    return this.users.find(function (user: IUser) {
      return user.id === id;
    });
  }

  // Coloca um novo usuário no final da lista e o devolve.
  create(user: IUser): IUser {
    this.users.push(user);
    return user;
  }

  // Atualiza somente os campos enviados pelo cliente.
  // Partial<IUser> significa que os campos podem ser opcionais nesta operação.
  update(id: number, dados: Partial<IUser>): IUser | undefined {
    const posicao = this.users.findIndex(function (user: IUser) {
      return user.id === id;
    });

    // O findIndex devolve -1 quando não encontra o usuário.
    if (posicao === -1) {
      return undefined;
    }

    // Mantemos os dados antigos e trocamos somente os campos recebidos.
    const usuarioAtualizado: IUser = {
      ...this.users[posicao],
      ...dados,
      id: id,
    };

    // Substituímos o usuário antigo pelo usuário atualizado.
    this.users[posicao] = usuarioAtualizado;
    return usuarioAtualizado;
  }

  // Remove um usuário pelo ID e devolve o usuário removido.
  delete(id: number): IUser | undefined {
    const posicao = this.users.findIndex(function (user: IUser) {
      return user.id === id;
    });

    // Se o usuário não existir, devolvemos undefined.
    if (posicao === -1) {
      return undefined;
    }

    // O splice remove um item e devolve uma lista com o item removido.
    const usuariosRemovidos = this.users.splice(posicao, 1);
    return usuariosRemovidos[0];
  }
}
