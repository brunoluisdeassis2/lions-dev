// Minha ideia: esperar a tarefa dentro do try para conseguir tratar sua falha no catch.
import { readFile } from "node:fs/promises";
import { AppError } from "./exercicio2";

// unknown significa que ler JSON não garante qual formato de dado está dentro dele.
export async function readConfig(path: string): Promise<unknown> {
  try {
    // await espera a leitura. Se ela rejeitar, a execução segue para o catch abaixo.
    const content = await readFile(path, "utf-8");
    return JSON.parse(content);
  } catch (erro: unknown) {
    // Passo o erro inteiro para preservar o stack, não apenas sua mensagem.
    console.error("falha ao ler config", erro);
    if (erro instanceof Error && "code" in erro && erro.code === "ENOENT") {
      // ENOENT é o código de arquivo/caminho inexistente no Node.
      const conhecido = new AppError("Configuração não encontrada", 404);
      conhecido.cause = erro; // Guardo a falha original para ajudar na investigação.
      throw conhecido;
    }
    // JSON malformado gera SyntaxError. Não o confundo com arquivo ausente.
    throw erro;
  }
}

export function retryLater(): Promise<void> {
  // Uma Promise pode terminar bem (resolve) ou falhar (reject).
  // Uso reject no temporizador para a falha chegar a quem fizer await nesta função.
  return new Promise((_resolve, reject) => {
    setTimeout(() => {
      reject(new Error("tentativa de releitura falhou"));
    }, 200);
  });
}

export async function fetchConfig(url: string): Promise<unknown> {
  try {
    const resposta = await fetch(url, { signal: AbortSignal.timeout(3000) });
    // fetch só rejeita por problemas como rede ou URL inválida. HTTP 404 é uma resposta!
    // ok indica status de 200 a 299; se não for ok, crio explicitamente um erro.
    if (!resposta.ok) {
      throw new AppError("Não foi possível buscar a configuração", resposta.status);
    }
    return await resposta.json(); // Espero o parse aqui para seu erro também chegar ao catch.
  } catch (erro: unknown) {
    console.error("falha no fetch", erro);
    throw erro; // Aviso quem chamou. Não devolvo sucesso depois da falha.
  }
}

if (require.main === module) {
  // Este exemplo permite escolher um arquivo pelo terminal: npm run ex7 -- caminho.json.
  readConfig(process.argv[2] || "config/app.json")
    .then((config) => console.log("config carregada", config))
    .catch((erro: unknown) => {
      // O stack já foi registrado. Aqui mostro só a mensagem adequada para o usuário.
      if (erro instanceof AppError) console.log(erro.message);
      else console.log("Não foi possível carregar a configuração.");
      process.exitCode = 1;
    });
}
