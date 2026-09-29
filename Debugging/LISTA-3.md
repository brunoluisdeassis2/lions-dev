# Minhas anotações — exercícios 7 a 11

Continuei na pasta `Debugging`, reaproveitando o Winston, o `AppError` e a API.
Não precisei instalar `uuid`: meu Node 20 já tem `randomUUID`.
Os comentários dos arquivos explicam o que fiz em primeira pessoa.

## Como executo

No terminal da pasta `Debugging`:

```bash
npm run check
npm run build
npm run test:lista3
npm test
```

`check` confere os tipos; `build` gera o JavaScript; `test:lista3` verifica os novos
cenários; `test` confere que os exercícios anteriores continuam funcionando.
Os testes provocam erros de propósito: ver um stack no meio da saída não significa
que o teste falhou. Procuro a mensagem final e o código de saída do comando.

Para experimentar um assunto de cada vez:

```bash
npm run ex7
npm run ex7 -- config/invalido.txt
npm run ex10
npm run ex11
npm start
```

`npm start` mantém a API ligada na porta 3001; paro com Ctrl+C.
Os comandos `ex7` com arquivo inválido terminam com código 1 de forma tratada,
para indicar que não houve sucesso. O teste dos cinco cenários continua vivo
e termina com código 0, sem rejeição não tratada.

## 7. Erros assíncronos — por que meu catch não recebia a falha?

**Arquivo corrigido:** [src/exercicio7.ts](src/exercicio7.ts).

**Sintoma:** a função iniciava a leitura e saía do `try` antes de o arquivo ser lido.
Depois vinha uma rejeição não tratada. O erro do temporizador também escapava.
**Tipo:** erro de fluxo assíncrono, levando a falha de execução não tratada.
**Hipótese:** meu `catch` está no lugar certo visualmente, mas a operação termina depois dele.

**Como reproduzi:**

```bash
node dist/investigacao/async-antes.js leitura
node dist/investigacao/async-antes.js timer
```

Executei cada falha separadamente porque a primeira queda poderia impedir a outra.
Queria ver o `catch` registrar o problema; na prática apareceu primeiro
`A parte síncrona terminou; a falha ainda vai acontecer.`, depois o erro, e o processo
terminou com código 1. O texto do `catch` não apareceu.
As saídas completas estão em [async-antes-leitura.txt](evidencias/lista3/async-antes-leitura.txt)
e [async-antes-timer.txt](evidencias/lista3/async-antes-timer.txt).

**Ferramenta e causa encontrada:** comparei a ordem das mensagens e os stacks.
Uma Promise representa um resultado que vai chegar; sem `await`, meu `try` não
espera esse resultado. Um callback de `setTimeout` também executa depois, em outro
momento. Não adianta colocar só um `try` em volta da chamada que agenda o callback.

**O que corrigi:** fiz `readConfig` ser `async` e usei `await readFile(...)` dentro
do `try`. No `catch`, recebo `unknown`, confiro se é `Error` e identifico o código
`ENOENT` (arquivo/caminho ausente). Converto esse caso em `AppError` 404, preservando
a falha original em `cause`. JSON malformado continua sendo `SyntaxError`.
Registro o objeto inteiro com `console.error` e repasso a falha.

Para o temporizador, devolvo uma Promise e uso `reject` dentro do callback;
quem chama faz `await` e trata a rejeição. Não deixo um `throw` solto ali.

**Como validei:** arquivo válido, arquivo ausente, JSON inválido, host inexistente
(`.invalid`), URL malformada e HTTP 404 foram testados. Também tratei a falha do
temporizador. Veja [depois.txt](evidencias/lista3/depois.txt), linhas com `EX7`.
O arquivo válido devolveu o objeto correto sem log de erro. Os outros casos
produziram os erros esperados, e a sequência de testes continuou.

**O que preciso lembrar para explicar:**

- Falha de rede impede obter uma resposta HTTP; HTTP 404 é uma resposta recebida.
  `fetch` não rejeita só porque o status é 404: preciso verificar `resposta.ok`.
- `console.error` usa a saída de erros (`stderr`); `console.log` usa a saída normal.
  Passar o Error inteiro preserva o stack; passar só `erro.message` perde esse caminho.
- No Node 20 desta execução, uma rejeição não tratada termina o processo por padrão.
  Opções de execução podem mudar esse comportamento. `unhandledRejection` avisa sobre
  uma Promise rejeitada sem tratamento; não instalei um handler para esconder o defeito.
- Um callback executado depois pode ter um stack que começa no temporizador, sem
  toda a chamada original. `await`, contexto, ID e `cause` ajudam a investigar.

## 8. ErrorHandler — um único formato para responder às falhas

**Arquivos:** [src/errorHandler.ts](src/errorHandler.ts), [src/server.ts](src/server.ts)
e [src/servico-estudo.ts](src/servico-estudo.ts).

**Sintoma:** a função com três parâmetros não tratava o erro da rota.
**Tipo:** configuração incorreta do middleware e tratamento incorreto de erros.
**Hipótese:** o Express não reconhece minha função como um tratador de erros.
**Reprodução:** `node dist/investigacao/reproduzir-api.js`, após o build.
Esperava JSON com o status do `AppError`; obtive HTML com detalhes internos.

**Evidência importante:** meu projeto usa **Express 5.2.1**. Aqui o resultado original
foi **404 em HTML com stack**, e não 500 ou requisição pendurada como o texto do PDF
descreve. O tratador padrão do Express respeitou o `statusCode`, mas minha função
de três parâmetros não foi chamada. Registrei o observado em
[api-antes.txt](evidencias/lista3/api-antes.txt), em ambiente de desenvolvimento.

**Ferramenta e causa:** conferi status, corpo, cabeçalho `content-type` e a quantidade
de parâmetros. O Express reconhece um tratador de erros por seus **quatro parâmetros**:
`erro, req, res, next`. Só escrever um tipo TypeScript não substitui essa assinatura.

**Correção:** criei uma função `ErrorRequestHandler`, com erro `unknown`, registrada
depois das rotas. Para `AppError`, uso o status e a mensagem conhecidos. Para erro
inesperado, uso 500 e uma mensagem genérica. Todo erro recebe:

```json
{
  "statusCode": 404,
  "message": "Usuário não encontrado",
  "timestamp": "data e hora da resposta em formato ISO"
}
```

Esse exemplo descreve o formato; os horários reais estão nas evidências.
Uma rota não registrada também vira `AppError` 404, para passar pelo mesmo tratamento.
O logger recebe o erro com stack. O cliente não recebe stack, caminho nem mensagem interna.

Antes de responder, confiro `res.headersSent`. Se a resposta já começou,
encaminho com `next(erro)`; não tento enviar outro JSON, o que poderia provocar
`ERR_HTTP_HEADERS_SENT`. Existe um teste específico desse encaminhamento.

**Validação:**

| Requisição | Resultado verificado |
|---|---|
| `/usuarios/42` | 200, usuário Bruno |
| `/usuarios/999` | 404, JSON com os três campos |
| `/usuarios/erro` | 500, mensagem genérica; stack no log |
| `/erro-async` | Promise rejeitada chega ao handler, sem ficar pendurada |
| `/nao-registrada` | 404 no mesmo formato |

As respostas copiadas estão em [depois.txt](evidencias/lista3/depois.txt), linhas `EX8`.
O Express 5 encaminha automaticamente rejeições de Promises **retornadas** por rotas
`async`. No Express 4 eu precisaria encaminhar com `next(erro)` num `catch`.
Isso não torna um `throw` solto no `setTimeout` automaticamente tratável.

Um corpo padronizado ajuda quem usa a API: o cliente sabe onde procurar o código,
a mensagem e o horário, sem adivinhar o formato de cada rota.

## 9. RequestId — descobrir quais mensagens pertencem à mesma requisição

**Arquivos:** [src/requestContext.ts](src/requestContext.ts),
[src/logger.ts](src/logger.ts) e [src/requestLogger.ts](src/requestLogger.ts).

**Sintoma:** três requisições simultâneas misturavam seus logs. Só a mensagem inicial
tinha um contador; as mensagens de busca não tinham dono.
**Tipo:** falha de rastreamento e de propagação do contexto.
**Hipótese:** criar um número no middleware não faz esse número acompanhar o serviço.
**Reprodução:** a parte `EX9 ANTES` de [api-antes.txt](evidencias/lista3/api-antes.txt)
mostra inícios com números 2, 3 e 4 e buscas sem ID. Não consigo associar todas as linhas.

**Ferramenta e causa:** disparei três requisições com `Promise.all` e comparei os logs.
Um contador reinicia quando o programa reinicia; dois processos podem produzir o mesmo
número. Uma variável global com o “ID atual” também pode ser sobrescrita por outra requisição.

**Correção:** uso `randomUUID` e guardo o ID em `AsyncLocalStorage`, um contexto que
acompanha as tarefas assíncronas daquela requisição. Não preciso passar o ID em cada
parâmetro. O logger consulta esse contexto para acrescentá-lo automaticamente às mensagens.
Declarei o campo `requestId` de `Request` sem `any`.

Se o cliente enviar `X-Request-Id`, reaproveito um valor de até 100 caracteres com
letras, números, ponto, hífen ou sublinhado. Valor ausente ou fora desse formato gera
um UUID novo. Devolvo o ID no cabeçalho da resposta. IDs recebidos não são autenticação:
um cliente pode repetir o mesmo valor em várias chamadas; a distinção por UUID vale
para os IDs que geramos, com probabilidade de colisão extremamente baixa.

**Validação e arquivos para comparar:**

- [tres-requisicoes.jsonl](evidencias/lista3/tres-requisicoes.jsonl): logs reais misturados
  de três pedidos, cada um com seu ID estável.
- [uma-requisicao.jsonl](evidencias/lista3/uma-requisicao.jsonl): filtro de um dos IDs,
  com início → buscando pedido → pedido encontrado → conclusão.
- [depois.txt](evidencias/lista3/depois.txt): o ID `meu-teste-erro` permanece no cabeçalho,
  no início, na busca, no erro com stack e na conclusão. Há só **um registro do erro**;
  a conclusão é outra mensagem, sem repetir o stack.
- [pm2-dois-processos.txt](evidencias/lista3/pm2-dois-processos.txt): dois processos
  atenderam 12 pedidos; os 12 IDs foram distintos e cada sequência ficou no mesmo PID.

Posso repetir o teste manualmente com:

```bash
npm start
```

Em outro terminal:

```bash
curl -i -H 'X-Request-Id: meu-teste-erro' http://127.0.0.1:3001/pedidos/erro
```

Para o teste em dois processos, primeiro paro o servidor manual e uso:

```bash
npm run build
export PM2_HOME="$PWD/.pm2-lista3"
npx pm2 start ecosystem-lista3.config.js
npx pm2 logs api-lista3
```

Essa configuração usa a porta 3002. No outro terminal faço chamadas a `/pedidos/1`.
Ctrl+C sai dos logs; ao terminar, executo `npx pm2 delete api-lista3` e `npx pm2 kill`
no terminal com esse mesmo `PM2_HOME`. Os processos da verificação já foram encerrados.

**Para explicar ao professor:** passar por parâmetro é explícito, mas repete o dado
em todas as assinaturas. O contexto acompanha Promises e temporizadores criados dentro
de `run`, incluindo o trecho depois de `await`. Para outro serviço receber o mesmo ID,
preciso enviá-lo no cabeçalho da chamada HTTP; o contexto não atravessa a rede sozinho.
Há custo de gerar IDs, acompanhar contexto e escrever logs. Ele se justifica quando
preciso investigar caminhos concorrentes sem confundir as requisições.

## 10. Watch — desconto aplicado na hora errada

**Solução:** [src/exercicio10.ts](src/exercicio10.ts).
**Versão para investigar:** [investigacao/desconto-antes.ts](investigacao/desconto-antes.ts).

**Sintoma:** o total muda com a ordem dos mesmos itens.
**Tipo:** erro de lógica; desconto repetido sobre somas parciais.
**Hipótese:** o desconto deveria acontecer só depois de terminar a soma.
**Reprodução:** `npm run watch:antes`.
Esperava 350 menos 5% = **332,50**. Obtive **320,63** na ordem original.

Um detalhe que anotei: os valores dos itens do PDF são 100, 150 e 100.
Inverter essa sequência não muda os valores, então original e invertida dão 320,63
mesmo com o erro. Testei também a ordem 100, 100, 150: ela dá 332,50 na versão errada.
Não basta um único teste que por coincidência passe.

**Como acompanho no VS Code:** abro a pasta `Debugging`, escolho a configuração
“Exercício 10 - Watch (antes da correção)” e coloco breakpoint na linha do `if`.
No Watch, adiciono:

```text
total
applied
index
items[index].price * items[index].qty
items.reduce((soma, item) => soma + item.price * item.qty, 0)
```

Uso F10 (Step Over) para avançar. `reduce` nessa expressão apenas soma os itens;
a expressão não altera os dados. Também comparei com a soma só dos itens já percorridos.

**Evidência real:** [watch-antes.txt](evidencias/lista3/watch-antes.txt) foi produzida
com o **Node Inspector**, usando breakpoint, avaliação das expressões e Step Over.
Não é uma captura da interface gráfica do VS Code. Posso reproduzir com
`npm run build` e `node investigacao/watch.cjs`.

| Parada antes do `if` | index | total | applied | valor do item | soma bruta completa |
|---|---:|---:|---:|---:|---:|
| Primeira | 0 | 100 | 0 | 100 | 350 |
| Segunda | 1 | 250 | 0 | 150 | 350 |
| Terceira | 2 | 337,50 | 1 | 100 | 350 |

**Causa encontrada:** na segunda iteração, o `if` transforma 250 em 237,50 antes
de eu somar o último item. Na terceira parada o desvio já aparece: tenho 337,50
em vez da soma bruta 350. Aplico outro desconto e chego a 320,625, arredondado para 320,63.

**Correção:** tirei o desconto do laço. Somei tudo e apliquei 5% uma única vez se o
total for **maior que** 200. Exatamente 200 não recebe desconto, conforme a regra escrita.
O contador `applied` deixou de ser necessário na solução.

**Validação:** 180 → 180; 200 → 200; ordem original, invertida e terceira ordem → 332,50;
item único de 500 → 475; lista vazia → 0. Os testes estão em `verificar-lista3.ts`.

**Perguntas que anotei:**

- Variables mostra variáveis do escopo; Watch mostra as expressões que eu escolhi.
- Watch pode alterar o programa se eu escrever `applied++` ou chamar uma função que
  altera dados. Prefiro expressões que só consultam valores.
- Breakpoint condicional é útil para parar apenas num caso relevante. Por exemplo,
  `applied > 0` na condição para somente depois de já ter ocorrido desconto.
- Logpoint escreve uma mensagem ao atingir uma linha sem eu adicionar `console.log`
  ao código e sem precisar pausar. Serve para acompanhar várias passagens.
- Olhar só o resultado não mostra quando a conta estragou. Acompanhar as mudanças
  me permitiu localizar o primeiro desconto indevido.

## 11. Memória — por que nada era liberado?

**Solução:** [src/exercicio11.ts](src/exercicio11.ts).
**Medição separada:** [investigacao/memoria.ts](investigacao/memoria.ts).

**Sintoma:** o programa guarda cada vez mais dados conforme atende pedidos.
**Tipo:** retenção de memória sem limite, com acúmulo de temporizadores e callbacks.
**Hipótese:** ainda existem referências para os dados antigos, então a coleta de lixo
não pode liberá-los. Uma referência é uma ligação que permite encontrar aquele objeto.

**Reprodução:** depois de `npm run build`, executo cada cenário em um processo novo:

```bash
node --expose-gc dist/investigacao/memoria.js antes
node --expose-gc dist/investigacao/memoria.js sem-timer
node --expose-gc dist/investigacao/memoria.js corrigido
```

Meço no início e após completar 200, 400, ... 2000 pedidos. O exemplo do PDF mede
quando `i % 200 === 0`, incluindo o primeiro pedido; ajustei a medição para contar
pedidos completos, nos mesmos pontos das três versões. `--expose-gc` permite pedir
uma coleta com `global.gc()` antes de cada amostra. Não uso isso na API normal.

**Ferramentas:** `process.memoryUsage`, contagem das estruturas, heap reduzido e snapshots.
Converto bytes dividindo por `1024 * 1024`, então a unidade exata é **MiB**.

- `rss`: memória residente do processo inteiro, não só objetos JavaScript.
- `heapTotal`: espaço de heap reservado pelo V8; `heapUsed`: parte ocupada.
- `external`: memória externa associada a objetos JavaScript.
- `arrayBuffers`: inclui a memória dos Buffers e já faz parte de `external`;
  não somo as duas colunas como se fossem independentes.

**Causa encontrada:** `cache` mantém os buffers; `listeners` mantém funções e seus
IDs; os intervalos continuam registrados e seus callbacks acessam o cache pelo ID.
Não há limite nem expiração. Remover só o intervalo não libera os buffers que ainda
estão no cache, nem os callbacks da lista. Chamar GC não remove objetos ainda referenciados.

**Resultados reais:** na versão original, em 2000 pedidos havia 2000 entradas,
2000 callbacks e 2000 intervalos. `arrayBuffers` chegou a **1000,01 MiB**, enquanto
`heapUsed` ficou em **3,88 MiB**. O maior crescimento é externo ao heap!
A versão sem intervalo ainda reteve os mesmos 1000 MiB de buffers.
O heap pode oscilar entre amostras por causa do coletor; não exigi uma subida
perfeitamente contínua só porque a tabela do enunciado a sugere.

**Correção:** o cache agora guarda no máximo 20 buffers, remove o mais antigo quando
precisa abrir espaço e expira os dados com um único intervalo. Não guardo callbacks
que não serão reutilizados. `encerrar()` cancela o intervalo e limpa o cache.
Essa é uma regra simples de estudo: a expiração limpa o cache inteiro a cada segundo,
não mede um segundo individual por entrada.

**Validação:** o teste conferiu o limite durante 2000 inserções, esperou a expiração
e chamou o encerramento. Na medição corrigida, `heapUsed` ficou perto de 2,86 MiB
entre 200 e 1800 pedidos e terminou em 2,88 MiB; sempre havia no máximo 20 entradas.
Em 2000 pedidos, `arrayBuffers` ficou em **10,01 MiB**, correspondendo aos 20 buffers vivos.
Há oscilações maiores durante a coleta e a alocação; limite de dados retidos não
significa que RSS será exatamente 10 MiB ou cairá imediatamente. O RSS corrigido
ficou até maior que o original em algumas amostras: alocação e páginas físicas
não são a mesma coisa que o total de buffers logicamente reservado.

Compare as sequências em [memoria-antes.jsonl](evidencias/lista3/memoria-antes.jsonl),
[memoria-sem-timer.jsonl](evidencias/lista3/memoria-sem-timer.jsonl),
[memoria-corrigido.jsonl](evidencias/lista3/memoria-corrigido.jsonl) e
[comparacao-memoria.csv](evidencias/lista3/comparacao-memoria.csv).

| Pedidos | Heap antes (MiB) | Heap corrigido (MiB) | Buffers antes (MiB) | Buffers corrigidos (MiB) |
|---|---:|---:|---:|---:|
| 200 | 2,97 | 2,86 | 100,01 | 39,01 |
| 1000 | 3,31 | 2,86 | 500,01 | 38,51 |
| 2000 | 3,88 | 2,88 | 1000,01 | 10,01 |

Os buffers descartados nem sempre somem imediatamente da medição; por isso
também acompanho a quantidade de entradas vivas e a sequência completa de amostras.

**Heap reduzido:** com `--max-old-space-size=16`, a versão defeituosa terminou
normalmente, mesmo retendo 1 GiB de buffers. Isso ocorre porque a opção limita
o heap do V8, não toda a memória externa. Com **4 MiB**, o processo isolado abortou
por falta de heap depois da amostra de 1000 pedidos e antes da de 1200, com
`FATAL ERROR` e sinal SIGABRT (código -6 no Python que acompanhou o processo).
Não precisei aumentar o limite para esconder a retenção.

As saídas estão em [memoria-heap16.jsonl](evidencias/lista3/memoria-heap16.jsonl) e
[memoria-heap4.txt](evidencias/lista3/memoria-heap4.txt). O ponto de esgotamento depende
do Node e da máquina; não prometo que sempre cairá na mesma iteração.

**Desafio dos snapshots:** `node investigacao/snapshots.cjs` capturou duas fotografias
pelo Inspector, após 200 e 2000 pedidos. O resumo em [snapshots.txt](evidencias/lista3/snapshots.txt)
mostra objetos `Buffer` passando de 202 para 2002 e `Timeout` de 200 para 2000.
Os dois buffers extras são do processo além dos criados pelos pedidos.
Os arquivos completos ficaram numa pasta temporária indicada nesse resumo, fora do Git.
Posso carregar os `.heapsnapshot` na aba Memory do DevTools e comparar as referências;
não fiz uma inspeção visual dessa aba. O resumo foi extraído dos arquivos reais.
O script usa uma sessão interna do Inspector; não precisa abrir uma porta com `--inspect`.

**Para responder ao professor:**

- Uma medida alta sozinha não prova vazamento. Preciso comparar execuções ao longo
  da carga e observar o que continua retido depois de GC e do fim do trabalho.
- Consumo alto pode ser necessário para uma tarefa grande. Vazamento/retenção
  indevida é manter dados que já não deveriam continuar vivos.
- Temporizadores e listas de callbacks mantêm funções e o que elas referenciam.
  Mesmo sem executar o callback naquele instante, a referência pode reter objetos.
- Snapshots permitem comparar tipos, quantidades e caminhos de retenção;
  `memoryUsage` sozinho mostra tamanhos gerais, não quem segura cada objeto.
- Referências fracas podem ajudar a associar dados a objetos sem impedir sua coleta.
  Um `WeakMap` não aceita meus IDs string como chave e não garante limite de memória
  nem horário de limpeza. Aqui o limite explícito e o cancelamento resolvem a causa.

## O que foi verificado e onde ficou salvo

Passei na checagem de tipos, build, testes novos e testes anteriores. A API de teste
e os dois processos do PM2 foram encerrados. As evidências desta lista estão em
`evidencias/lista3`; os arquivos de investigação defeituosos não são importados pelo servidor.
Ainda preciso executar a parte visual no meu VS Code se quiser treinar pessoalmente
o painel Watch; o mecanismo de depuração já foi exercitado pelo Inspector.

Referências usadas para conferir os detalhes de comportamento:

- [Express: erros e rotas async](https://expressjs.com/en/guide/error-handling/)
- [Node: AsyncLocalStorage](https://nodejs.org/api/async_context.html)
- [Node: memória e rejeições não tratadas](https://nodejs.org/api/process.html)
