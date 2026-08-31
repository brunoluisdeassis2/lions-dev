import express from "express";

import { criarRotasDeProdutos } from "./controllers/produto.controller";
import { criarRotasDeUsuarios } from "./controllers/usuario.controller";
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { tratadorDeErros } from "./middlewares/tratador-erros.middleware";
import { RepositorioDeUsuarios } from "./repositories/repositorio-usuarios";
import { ServicoDeProdutos } from "./services/servico-produtos";
import { ServicoDeUsuarios } from "./services/servico-usuarios";

// Criamos o servidor Express e escolhemos a porta 3000.
const app = express();
const port: number = 3000;

// Permite que o servidor entenda JSON enviado no corpo das requisições.
app.use(express.json());

// Faz o logger ser executado antes de todas as rotas.
app.use(loggerMiddleware);

// Criamos cada objeto apenas uma vez quando a aplicação inicia.
const repositorioDeUsuarios = new RepositorioDeUsuarios();
const servicoDeUsuarios = new ServicoDeUsuarios(repositorioDeUsuarios);
const servicoDeProdutos = new ServicoDeProdutos();

// Ligamos cada grupo de rotas ao seu endereco principal.
app.use("/users", criarRotasDeUsuarios(servicoDeUsuarios));
app.use("/products", criarRotasDeProdutos(servicoDeProdutos));

// O middleware de erro fica depois das rotas para receber os erros delas.
app.use(tratadorDeErros);

// Liga o servidor e mostra no terminal o endereço para acesso.
app.listen(port, function (): void {
  console.log(`Servidor iniciado em http://localhost:${port}`);
});
