// Importamos o Express e os tipos usados nas rotas.
import express, { NextFunction, Request, Response } from "express";

// Importamos as partes que criamos para os exercícios 7 e 8.
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { tratadorDeErros } from "./middlewares/tratador-erros.middleware";
import { IUser } from "./models/user";
import { UserService } from "./services/user.service";
import { ServicoDeProdutos } from "./services/servico-produtos";

// Criamos o servidor Express e escolhemos a porta 3000.
const app = express();
const port: number = 3000;

// Permite que o servidor entenda JSON enviado no corpo das requisições.
app.use(express.json());

// Faz o logger ser executado antes de todas as rotas.
app.use(loggerMiddleware);

// Criamos um único objeto que guardará e manipulará os usuários.
const userService = new UserService();

// Este objeto guarda e manipula os produtos enquanto o servidor estiver ligado.
const servicoDeProdutos = new ServicoDeProdutos();

// Verifica os dados obrigatórios usados para criar um usuário.
function usuarioNovoValido(user: IUser): boolean {
  return (
    typeof user.id === "number" &&
    typeof user.nome === "string" &&
    typeof user.email === "string" &&
    typeof user.isActive === "boolean"
  );
}

// Verifica os dados opcionais usados para atualizar um usuário.
function atualizacaoValida(dados: Partial<IUser>): boolean {
  // Uma atualização vazia não deve ser aceita.
  if (Object.keys(dados).length === 0) {
    return false;
  }

  // Cada campo só é validado quando tiver sido enviado.
  if (dados.nome !== undefined && typeof dados.nome !== "string") {
    return false;
  }

  if (dados.email !== undefined && typeof dados.email !== "string") {
    return false;
  }

  if (dados.isActive !== undefined && typeof dados.isActive !== "boolean") {
    return false;
  }

  // Se nenhum teste encontrou problema, os dados são válidos.
  return true;
}

// GET /users pede ao serviço a lista completa de usuários.
app.get("/users", function (request: Request, response: Response): void {
  const users = userService.getAll();
  response.status(200).json(users);

  // A rota não usa informações da requisição, mas ela faz parte da assinatura.
  void request;
});

// GET /users/:id procura somente o usuário que possui o ID informado.
app.get("/users/:id", function (request: Request, response: Response): void {
  const id = Number(request.params.id);
  const user = userService.getById(id);

  // Se o serviço não encontrar o usuário, respondemos com 404.
  if (user === undefined) {
    response.status(404).json({ message: "Usuário não encontrado" });
    return;
  }

  // Se encontrou, respondemos com o usuário e o status 200.
  response.status(200).json(user);
});

// POST /users recebe e cria um novo usuário.
app.post("/users", function (request: Request, response: Response): void {
  const newUser: IUser = request.body;

  // Impede a criação quando os dados estiverem incorretos.
  if (!usuarioNovoValido(newUser)) {
    response.status(400).json({ message: "Dados inválidos" });
    return;
  }

  // O serviço adiciona o usuário e a rota responde com status 201.
  const createdUser = userService.create(newUser);
  response.status(201).json(createdUser);
});

// PUT /users/:id atualiza os campos enviados para um usuário.
app.put("/users/:id", function (request: Request, response: Response): void {
  const id = Number(request.params.id);
  const updateData: Partial<IUser> = request.body;

  // Impede a atualização quando os dados estiverem incorretos.
  if (!atualizacaoValida(updateData)) {
    response.status(400).json({ message: "Dados inválidos" });
    return;
  }

  // O serviço procura o usuário e aplica as alterações.
  const updatedUser = userService.update(id, updateData);

  // Se o usuário não existir, respondemos com 404.
  if (updatedUser === undefined) {
    response.status(404).json({ message: "Usuário não encontrado" });
    return;
  }

  // Se a alteração funcionar, devolvemos o usuário atualizado.
  response.status(200).json(updatedUser);
});

// DELETE /users/:id remove o usuário que possui o ID informado.
app.delete("/users/:id", function (request: Request, response: Response): void {
  const id = Number(request.params.id);
  const deletedUser = userService.delete(id);

  // Se o usuário não existir, respondemos com 404.
  if (deletedUser === undefined) {
    response.status(404).json({ message: "Usuário não encontrado" });
    return;
  }

  // O status 204 informa que a exclusão funcionou e não envia um corpo.
  response.status(204).send();
});

// GET /products devolve todos os produtos cadastrados.
app.get("/products", function (requisicao: Request, resposta: Response): void {
  const produtos = servicoDeProdutos.listar();
  resposta.status(200).json(produtos);

  void requisicao;
});

// GET /products/:id busca um unico produto.
app.get(
  "/products/:id",
  function (
    requisicao: Request,
    resposta: Response,
    proximo: NextFunction,
  ): void {
    try {
      const id = Number(requisicao.params.id);
      const produto = servicoDeProdutos.buscar(id);
      resposta.status(200).json(produto);
    } catch (erro: unknown) {
      proximo(erro);
    }
  },
);

// POST /products cria um produto com os dados enviados no corpo.
app.post(
  "/products",
  function (
    requisicao: Request,
    resposta: Response,
    proximo: NextFunction,
  ): void {
    try {
      const produtoCriado = servicoDeProdutos.criar(requisicao.body);
      resposta.status(201).json(produtoCriado);
    } catch (erro: unknown) {
      proximo(erro);
    }
  },
);

// PUT /products/:id substitui os dados de um produto existente.
app.put(
  "/products/:id",
  function (
    requisicao: Request,
    resposta: Response,
    proximo: NextFunction,
  ): void {
    try {
      const id = Number(requisicao.params.id);
      const produtoAtualizado = servicoDeProdutos.atualizar(
        id,
        requisicao.body,
      );
      resposta.status(200).json(produtoAtualizado);
    } catch (erro: unknown) {
      proximo(erro);
    }
  },
);

// DELETE /products/:id apaga um produto.
app.delete(
  "/products/:id",
  function (
    requisicao: Request,
    resposta: Response,
    proximo: NextFunction,
  ): void {
    try {
      const id = Number(requisicao.params.id);
      servicoDeProdutos.remover(id);
      resposta.status(204).send();
    } catch (erro: unknown) {
      proximo(erro);
    }
  },
);

// O middleware de erro fica depois das rotas para receber os erros delas.
app.use(tratadorDeErros);

// Liga o servidor e mostra no terminal o endereço para acesso.
app.listen(port, function (): void {
  console.log(`Servidor iniciado em http://localhost:${port}`);
});
