// Uso o Winston, uma biblioteca que ajuda a organizar os registros do programa.
// import traz essa biblioteca instalada no projeto.
import winston from "winston";
import { requestStorage } from "./requestContext";

// Crio um logger para compartilhar com os outros arquivos usando export.
// createLogger recebe um objeto com as opções: nível, formato e destino dos registros.
export const logger = winston.createLogger({
  // process.env lê as variáveis de ambiente, que são configurações vindas de fora do código.
  // Se LOG_LEVEL não tiver valor, || escolhe "info" como padrão.
  // O nível é um filtro: info deixa passar info, warn e error; error mostra só erros.
  level: process.env.LOG_LEVEL || "info",
  // combine junta as regras abaixo para formatar cada registro.
  format: winston.format.combine(
    // Peço para acrescentar a data e a hora em um campo chamado timestamp.
    winston.format.timestamp(),
    // Quando registro um Error, peço para incluir também o stack, que mostra
    // o caminho das chamadas que levou à falha. true significa que ativei essa opção.
    winston.format.errors({ stack: true }),
    // Escolho JSON: a saída fica organizada em campos, como message, level e timestamp.
    // Leio o contexto automaticamente em cada registro, inclusive dentro dos serviços.
    // Se já houver ID explícito (como no evento finish), preservo esse ID.
    winston.format((registro) => {
      registro.requestId = registro.requestId || requestStorage.getStore()?.requestId;
      registro.pid = process.pid; // Me ajuda a distinguir os dois processos do teste com PM2.
      return registro;
    })(),
    winston.format.json(),
  ),
  // transports indica para onde vão os registros. Escolhi o console (terminal).
  // new cria esse destino. Quando uso PM2, ele já captura a saída; não preciso gravar tudo duas vezes.
  transports: [new winston.transports.Console()],
});
