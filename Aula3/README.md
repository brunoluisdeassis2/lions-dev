# Exercícios 7 e 8 - Express com TypeScript

Esta API continua o CRUD de usuários e adiciona duas melhorias:

1. Um middleware que registra todas as requisições no terminal.
2. Uma classe `UserService` que guarda e manipula os usuários.

## Como executar

Dentro da pasta `Aula3`, execute:

```bash
npm install
npm start
```

O servidor ficará disponível em `http://localhost:3000`.

Para encerrar, pressione `Ctrl + C` no terminal.

## Arquivos importantes

- `src/server.ts`: cria o servidor, valida os dados e possui as rotas.
- `src/models/user.ts`: define a interface `IUser`.
- `src/middlewares/logger.middleware.ts`: registra cada requisição.
- `src/services/user.service.ts`: guarda e manipula os usuários.

## Rotas

- `GET /users`: lista todos os usuários.
- `GET /users/:id`: procura um usuário pelo ID.
- `POST /users`: cria um usuário.
- `PUT /users/:id`: atualiza os campos enviados.
- `DELETE /users/:id`: remove um usuário.

## Exemplo para criar um usuário

```json
{
  "id": 3,
  "nome": "Carlos",
  "email": "carlos@gmail.com",
  "isActive": true
}
```

## Exemplo para atualizar somente o nome

```json
{
  "nome": "Carlos Silva"
}
```
