// Minha ideia: conferir os dados antes de dividir e explicar quando não posso fazer a conta.
// Criei AppError como um modelo para os erros que já sei que podem acontecer.
// class define esse modelo; extends Error aproveita o erro que já existe no JavaScript.
// export permite que meus testes usem esta classe em outro arquivo.
export class AppError extends Error {
  // Guardo um código numérico junto com a mensagem, por exemplo 400 para entrada inválida.
  statusCode: number;

  // constructor roda quando escrevo new AppError(...).
  // Recebo a explicação em texto (string) e o código em número (number).
  constructor(message: string, statusCode: number) {
    // Passo a mensagem para a classe Error que estou aproveitando.
    super(message);
    // this é o erro que estou criando agora. Dou a ele o nome AppError.
    this.name = "AppError";
    // Guardo no erro o código que recebi no constructor.
    this.statusCode = statusCode;
  }
}

// Anotei o formato que uma entrada válida deve ter. interface descreve esse formato
// para o TypeScript, mas não confere os dados enquanto o programa está rodando.
interface DivisionInput {
  // numerator é o número que vou dividir: em 10 / 2, é o 10.
  numerator: number;
  // denominator é o número pelo qual divido: em 10 / 2, é o 2.
  denominator: number;
}

// Recebo os dados já conferidos e devolvo um número.
// input.numerator significa “o campo numerator dentro do objeto input”.
export function divide(input: DivisionInput): number {
  // === compara os valores sem converter texto em número.
  // Não deixo dividir por zero: o JavaScript devolveria Infinity, não um erro automático.
  if (input.denominator === 0) {
    // new cria o erro; throw lança esse erro e interrompe o caminho normal da função.
    throw new AppError("Não é possível dividir por zero.", 400);
  }
  // Faço a divisão com / e guardo o resultado.
  const resultado = input.numerator / input.denominator;
  // Number.isFinite confere se tenho um número finito. O ! significa “não”.
  // Mesmo com entradas válidas, uma conta muito grande pode virar Infinity.
  if (!Number.isFinite(resultado)) {
    throw new AppError("O resultado precisa ser um número finito.", 400);
  }
  // Só devolvo o resultado depois de passar pelas verificações.
  return resultado;
}

// rawInput é o dado que chegou de fora. unknown significa que ainda não sei seu tipo.
// Vou conferir esse dado antes de tratá-lo como DivisionInput.
export function validarEntrada(rawInput: unknown): DivisionInput {
  // typeof informa o tipo; !== significa “é diferente de”.
  // || significa “ou”: rejeito se não for objeto OU se for null (ausência de valor).
  // Preciso conferir null separado porque typeof null também devolve “object”.
  if (typeof rawInput !== "object" || rawInput === null) {
    throw new AppError("Envie um objeto com numerator e denominator.", 400);
  }
  // Com in, confiro se cada campo existe no objeto.
  // Se faltar numerator OU denominator, paro aqui com uma mensagem.
  if (!("numerator" in rawInput) || !("denominator" in rawInput)) {
    throw new AppError("Informe os dois números.", 400);
  }
  // Ter os campos não basta: os dois precisam conter números.
  // O texto "10" parece um número para mim, mas continua sendo texto para o programa.
  if (typeof rawInput.numerator !== "number" || typeof rawInput.denominator !== "number") {
    throw new AppError("Os dois campos precisam ser números.", 400);
  }
  // NaN significa “não é um número válido”; Infinity representa infinito.
  // Os dois passam em typeof como number, então preciso desta conferência extra.
  if (!Number.isFinite(rawInput.numerator) || !Number.isFinite(rawInput.denominator)) {
    throw new AppError("Não envie Infinity ou NaN.", 400);
  }
  // Monto e devolvo um objeto com os dois números que acabei de conferir.
  return { numerator: rawInput.numerator, denominator: rawInput.denominator };
}

// Esta função organiza a tentativa e o tratamento da falha.
// void significa que não devolvo um resultado para quem chamou; mostro mensagens.
export function execute(rawInput: unknown): void {
  // try é o bloco em que tento fazer a operação. Se acontecer um throw, vou para o catch.
  try {
    // Primeiro valido. Se falhar aqui, não chego à divisão da próxima linha.
    const entrada = validarEntrada(rawInput);
    // Divido os números válidos e mostro o resultado no terminal.
    console.log("Resultado:", divide(entrada));
  // catch recebe a falha. Uso unknown porque preciso conferir o que foi lançado.
  } catch (erro: unknown) {
    // instanceof confere se o erro foi criado a partir de AppError.
    // Se foi, já tenho uma mensagem apropriada para explicar o problema.
    if (erro instanceof AppError) {
      // Mostro o código e a mensagem do erro esperado. Não mostro um resultado de sucesso.
      console.log("Erro", erro.statusCode, erro.message);
    } else {
      // Se não reconheci o erro, guardo os detalhes na saída de erros do programa (stderr).
      // Aqui ela também aparece no terminal. Em uma API, isso ficaria no servidor.
      console.error("Log interno:", erro);
      // Para o usuário, deixo uma mensagem genérica, sem os detalhes internos da falha.
      console.log("Erro 500: não foi possível realizar a operação.");
    }
  }
}

// Rodo estes exemplos só quando executo este arquivo diretamente: npm run ex2.
// Os códigos 400 e 500 aqui são mensagens no terminal; este arquivo não é uma API.
if (require.main === module) {
  // Caso válido: espero o resultado 5.
  execute({ numerator: 10, denominator: 2 });
  // Caso inválido: espero a mensagem de divisão por zero.
  execute({ numerator: 10, denominator: 0 });
  // undefined representa um valor ausente. Espero que a validação rejeite.
  execute(undefined);
  // Envio texto de propósito para conferir se a validação percebe a diferença.
  execute({ numerator: "10", denominator: 2 });
  // Envio um número inválido de propósito para testar Number.isFinite.
  execute({ numerator: NaN, denominator: 2 });
  // Este último exemplo é só uma simulação de falha inesperada.
  // get faz uma função rodar quando alguém tenta ler numerator. Coloquei um throw
  // nessa leitura para conferir o caminho do catch que não recebe AppError.
  execute({ get numerator() { throw new Error("Falha simulada de leitura"); }, denominator: 2 });
}
