// Esta interface é a ficha de um usuário.
// Ela diz quais informações todo usuário completo precisa possuir.
export interface IUser {
  id: number;
  nome: string;
  email: string;
  isActive: boolean;
}
