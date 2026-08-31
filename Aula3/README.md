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

## Exercicios 11 e 12 - RequestHandler e Repository

As rotas de usuarios e produtos agora usam `RequestHandler`. Cada handler
informa os tipos dos parametros da URL, da resposta, do corpo recebido e da
query. Isso ajuda o TypeScript a encontrar erros enquanto escrevemos o codigo.

A tipagem nao substitui a validacao. Um cliente ainda pode enviar um JSON
errado durante a execucao, por isso as verificacoes dos dados continuam nos
Services.

### Organizacao das responsabilidades

- Controller: recebe a requisicao, chama o Service e envia a resposta HTTP.
- Service: valida os dados e aplica as regras da aplicacao.
- Repository: guarda, busca, altera e remove os dados.

O fluxo de uma requisicao de usuarios e:

```text
Cliente -> Controller -> Service -> Repository
```

O `RepositorioDeUsuarios` usa um array em memoria. Essa foi a opcao escolhida
por ser a mais simples para estudar. Os usuarios criados desaparecem quando o
servidor e reiniciado.

Os metodos do Repository retornam `Promise`. Por isso, o Service e o Controller
de usuarios usam `async` e `await`. Esse contrato permite trocar o array por um
arquivo ou banco de dados no futuro sem mudar as rotas.

Tambem e possivel filtrar usuarios pelo estado:

```text
GET /users?active=true
GET /users?active=false
```
