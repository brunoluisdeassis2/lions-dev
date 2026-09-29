// Minha ideia: criar uma API pequena para testar os logs e os erros dos exercícios 5 e 6.
// Express ajuda a receber requisições e enviar respostas. Os outros nomes são tipos do TypeScript.
import express from "express";
import { requestContext } from "./requestContext";
import { errorHandler } from "./errorHandler";
import { AppError } from "./exercicio2";
import { findUser, buscarPedido } from "./servico-estudo";
// Trago o registrador de mensagens que configurei no exercício 4.
import { logger } from "./logger";
// Trago a função que vai medir e registrar cada requisição.
import { requestLogger } from "./requestLogger";

// Crio a aplicação. export permite que meu arquivo de testes também use essa API.
export const app = express();
// use coloca um middleware no caminho das requisições.
// Registro o logger antes das rotas para ele conseguir observar todas elas.
// Primeiro preparo o ID que vai acompanhar a requisição inteira.
app.use(requestContext);
app.use(requestLogger);
// Permito que o Express entenda corpos enviados em JSON.
app.use(express.json());
// get define o que faço quando chega uma requisição GET neste endereço.
// Respondo um objeto em JSON; sem escolher outro status, ele será 200 (sucesso).
// _req é o pedido que recebi, mas não preciso usar aqui. res é a resposta.
app.get("/health", (_req, res) => { res.json({ ok: true }); });
// Uso async/await para esperar a busca. No Express 5, uma rejeição chega ao errorHandler.
// Em Express 4, eu precisaria de try/catch com next(erro) ou de um adaptador equivalente.
app.get("/usuarios/:id", async (req, res) => {
  const usuario = await findUser(req.params.id);
  if (!usuario) throw new AppError("Usuário não encontrado", 404);
  res.json(usuario);
});
// O serviço registra seus passos usando o ID do contexto, sem recebê-lo como parâmetro.
app.get("/pedidos/:id", async (req, res) => {
  const pedido = await buscarPedido(req.params.id);
  res.json(pedido);
});
// Provoco uma Promise rejeitada para verificar o tratamento de uma rota assíncrona.
app.get("/erro-async", async () => {
  await Promise.reject(new Error("Falha interna da Promise de teste"));
});
// Crio uma falha de propósito com throw para testar o tratamento e o log de status 500.
app.get("/erro", () => { throw new Error("Falha simulada na rota"); });
// Crio uma rota com atraso para conferir se o logger realmente mede a espera.
app.get("/lento", (_req, res) => {
  // setTimeout agenda a função para depois de pelo menos 200 milissegundos.
  // A função () => { ... } responde quando o temporizador executar.
  setTimeout(() => { res.json({ ok: true }); }, 200);
});
// Nesta rota, simulo uma tarefa que falha depois de uma espera.
// Preciso encaminhar essa falha ao Express em vez de deixar o processo cair.
app.get("/crash", (_req, res, next) => {
  // A função dentro deste temporizador roda depois, fora da execução inicial da rota.
  setTimeout(() => {
    // Coloco o try DENTRO da função agendada: é aqui que o erro pode acontecer.
    try {
      // Simulo a falha da fila. Ainda não enviei sucesso, porque a tarefa não terminou.
      throw new Error("falha ao processar a fila");
    // Recebo a falha como unknown: não assumo seu tipo sem conferir.
    } catch (erro: unknown) {
      // Passar o erro ao next encaminha a falha para o middleware de erros do Express.
      next(erro);
    }
  }, 100);
});
// Se nenhuma rota respondeu, envio um AppError ao mesmo tratamento das outras falhas.
app.use((_req, _res, next) => { next(new AppError("Rota não encontrada", 404)); });
// Registro o tratador por último: ele recebe os erros das etapas anteriores.
app.use(errorHandler);

// Só abro a porta ao executar este arquivo diretamente.
// Quando os testes importam app, eles escolhem como iniciar o servidor.
if (require.main === module) {
  // Leio a porta de PORT. Se não foi informada, uso 3001.
  // Number transforma a configuração em número.
  const port = Number(process.env.PORT || 3001);
  // listen começa a receber conexões. 127.0.0.1 é o endereço local deste computador.
  // Guardo o servidor para poder fechá-lo depois.
  const servidor = app.listen(port, "127.0.0.1", () => {
    // Esta função roda quando o servidor está pronto. Registro também a porta escolhida.
    logger.info("Servidor iniciado", { port });
  });
  // Crio uma função para parar de forma organizada quando receber um pedido de encerramento.
  function encerrar(): void {
    // Registro que comecei o encerramento para conseguir enxergar isso nos logs do PM2.
    logger.info("Encerrando servidor");
    // Paro de aceitar novas conexões e espero as respostas em andamento terminarem.
    // Quando o fechamento concluir, process.exit(0) encerra o programa sem indicar falha.
    servidor.close(() => { process.exit(0); });
    // Se o fechamento demorar demais, encerro após três segundos com código 1 (falha).
    // unref() faz esse temporizador não manter o programa vivo sozinho.
    setTimeout(() => { process.exit(1); }, 3000).unref();
  }
  // Escuto SIGINT, o sinal enviado por Ctrl+C e normalmente pelo PM2 ao parar a aplicação.
  process.on("SIGINT", encerrar);
  // Também trato SIGTERM, outro sinal usado para pedir que o processo termine.
  process.on("SIGTERM", encerrar);
}
