// Minha ideia: registrar quando começo e termino um pedido e guardar o erro se ele falhar.
// Um log é um registro do que aconteceu no programa.
// import traz o logger que configurei no arquivo logger.ts. Reutilizo a mesma configuração.
import { logger } from "./logger";

// findOrder significa buscar pedido. orderId é o identificador do pedido em texto (string).
// export permite usar a função em outro arquivo. async faz a função devolver uma Promise:
// uma promessa de resultado que pode terminar com sucesso ou falha.
// Aqui a busca é simulada; não estou acessando um banco de dados.
export async function findOrder(orderId: string) {
  // Só cadastrei o pedido "1" neste exemplo. !== significa “é diferente de”.
  // Se receber outro ID, new Error cria a falha e throw interrompe a busca.
  if (orderId !== "1") throw new Error("Pedido não encontrado");
  // Devolvo um objeto com dois produtos, de 40 e 60. items é a lista e price é o preço.
  // A senha é fictícia: coloquei esse campo para conferir que não aparece nos logs.
  return { items: [{ price: 40 }, { price: 60 }], password: "SEGREDO_DE_TESTE" };
}

// processOrder significa processar pedido. Recebo seu ID e tento somar os preços.
// Promise<number> avisa que, se tudo der certo, o resultado da operação será um número.
export async function processOrder(orderId: string): Promise<number> {
  // Registro o início como informação normal (info).
  // { orderId } é uma forma curta de escrever { orderId: orderId }.
  // Assim, o ID fica em um campo separado da mensagem e posso localizar esse pedido no log.
  logger.info("inicio do processamento", { orderId });
  // Dentro do try, tento executar a busca e a soma. Se alguma etapa falhar, vou ao catch.
  try {
    // await espera a Promise da busca terminar antes de seguir nesta função.
    // Se der certo, guardo o pedido em order. Se falhar, sigo para o catch.
    // Essa espera não impede o Node de cuidar de outras tarefas.
    const order = await findOrder(orderId);
    // Começo a soma em zero. Uso let porque vou atualizar o total a cada produto.
    let total = 0;
    // for...of pega um produto de cada vez na lista order.items.
    // item.price é o preço desse produto; += soma esse preço ao total atual.
    // Neste pedido: começo em 0, somo 40 e depois 60, chegando a 100.
    for (const item of order.items) total += item.price;
    // Devolvo a soma. Mesmo com return aqui, o finally abaixo roda antes de eu sair.
    return total;
  // catch recebe a falha da tentativa. unknown lembra que ainda preciso conferir o tipo do erro.
  } catch (erro: unknown) {
    // instanceof Error confere se recebi um erro do JavaScript.
    // child({ orderId }) reaproveita o logger e acrescenta o ID do pedido ao registro.
    // error(erro) registra a falha com a mensagem e o stack: o caminho das chamadas
    // que levou ao erro. Isso me ajuda a encontrar onde o problema começou.
    if (erro instanceof Error) logger.child({ orderId }).error(erro);
    // Se lançarem algo que não é um Error, registro uma mensagem genérica com o ID.
    else logger.error("Falha inesperada no pedido", { orderId });
    // Lanço a falha de novo para quem chamou esta função saber que o pedido não deu certo.
    // Só escrever no log não transforma uma operação com erro em sucesso.
    throw erro;
  // finally roda tanto se a soma funcionar quanto se acontecer um erro.
  } finally {
    // Registro que a tentativa terminou. “Fim” não quer dizer “sucesso”.
    // Não registro o pedido inteiro, porque ele contém a senha fictícia.
    logger.info("fim do processamento", { orderId });
  }
}

// Só executo este exemplo quando inicio este arquivo diretamente, com npm run ex4.
// Se um teste importar a função, este bloco não roda sozinho.
if (require.main === module) {
  // process.argv guarda os argumentos do terminal: posição 0 é o Node, 1 é o arquivo
  // e 2 é o primeiro argumento que passei. Se não passei ID, || escolhe "1".
  // Para testar outro ID, posso usar: npm run ex4 -- inexistente.
  const orderId = process.argv[2] || "1";
  // Inicio o processamento. Este .catch trata a Promise rejeitada que saiu da função.
  // () => { ... } é uma função escrita de forma curta; ela roda se houver falha.
  processOrder(orderId).catch(() => {
    // A falha já foi registrada lá dentro, então não repito o log.
    // Defino a saída como 1 para o terminal saber que o comando falhou.
    // Isso não mata o programa imediatamente; marca o código usado quando ele terminar.
    process.exitCode = 1;
  });
}
