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

## Exercicios 9 e 10 - Erros e produtos

Os produtos ficam guardados em memoria e desaparecem quando o servidor e
desligado. O cliente envia `name`, `price`, `inStock` e `categories`; o servidor
cria o `id` automaticamente.

### Rotas de produtos

- `GET /products`: lista todos os produtos.
- `GET /products/:id`: busca um produto pelo ID.
- `POST /products`: cria um produto e responde com status 201.
- `PUT /products/:id`: substitui os dados de um produto.
- `DELETE /products/:id`: exclui um produto e responde com status 204.

Exemplo de corpo para criar ou atualizar:

```json
{
  "name": "Notebook",
  "price": 3500,
  "inStock": true,
  "categories": ["Eletronicos", "Informatica"]
}
```

O nome precisa ter pelo menos 3 caracteres. O preco deve ser um numero finito
e nao pode ser negativo. `inStock` deve ser booleano e `categories` deve ser
uma lista formada apenas por textos.

`ErroAplicacao` representa erros esperados, como produto inexistente. O
middleware global transforma esses erros em respostas HTTP. Erros inesperados
recebem status 500 e uma mensagem generica para nao expor detalhes internos.

Validacao de tipo pergunta se o dado possui o formato esperado. Regra de
negocio pergunta se um dado do tipo correto e permitido pela aplicacao. Por
exemplo: primeiro verificamos se `price` e numero; depois verificamos se ele nao
e negativo.
