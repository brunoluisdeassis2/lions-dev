// Minha ideia: simular uma camada de dados sem precisar montar um banco de dados.
import { logger } from "./logger";

export async function findUser(id: string) {
  if (id === "erro") throw new Error("Falha interna simulada ao consultar usuários");
  if (id === "42") return { id: "42", nome: "Bruno" };
  return undefined;
}

export async function buscarPedido(id: string) {
  // Não recebo requestId como parâmetro. O logger lê o contexto desta requisição.
  logger.info("buscando pedido");
  // Crio uma espera para as requisições concorrentes se misturarem no terminal.
  await new Promise<void>((resolve) => setTimeout(resolve, 30));
  if (id === "erro") throw new Error("Falha interna simulada ao buscar pedido");
  logger.info("pedido encontrado");
  return { id, total: 100 };
}
