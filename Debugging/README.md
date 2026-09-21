# Debug e logs: aprender investigando

Esta pasta continua o repositório após as aulas 3 e 4. Os seis exercícios das
duas listas estão resolvidos aqui. Os slides de teoria serviram de apoio;
as atividades soltas dos slides não são exercícios adicionais desta entrega.
Mantivemos funções, `if`, `for` e dados em memória para facilitar o estudo.

Comece pelo exercício 1. Antes de executar cada exemplo, tente adivinhar o resultado.
Depois compare sua resposta com a saída. Não precisa entender os seis de uma vez.

## Preparar e executar

Abra **esta pasta `Debugging`** no VS Code. No terminal dela:

```bash
npm install
npm run ex1
npm run ex2
npm run ex3
npm run ex4
```

`npm` executa os atalhos de `package.json`. `ts-node` permite executar nossos
arquivos TypeScript. `npm run check` confere os tipos; `npm run build` gera
JavaScript em `dist`; `npm test` verifica os cenários usando comparações simples.

Para os exercícios de API:

```bash
npm start
```

Em outro terminal, experimente:

```bash
curl -i http://127.0.0.1:3001/health
curl -i http://127.0.0.1:3001/rota-inexistente
curl -i http://127.0.0.1:3001/usuarios/42
curl -i http://127.0.0.1:3001/erro
curl -i http://127.0.0.1:3001/lento
curl -i http://127.0.0.1:3001/crash
```

`curl` faz uma requisição; `-i` mostra também o status e os cabeçalhos.
Pare o servidor com Ctrl+C antes de usar o PM2 na mesma porta.

## 1. Compra com desconto — `src/exercicio1.ts`

**Sintoma:** a compra `[40, 60]` retorna `NaN`, que significa “não é um número”.
**Reprodução:** `npm run antes` executa uma cópia investigativa do código errado.
Esperávamos 90; obtivemos `NaN`. A saída real está em [antes.txt](evidencias/antes.txt).

**Hipótese:** o laço está tentando somar um preço que não existe.
**Ferramentas:** `console.log` mostra os valores e `console.trace` mostra as chamadas.
O registro observado foi:

```text
{ index: 0, preco: 40, subtotal: 0 }
{ index: 1, preco: 60, subtotal: 40 }
{ index: 2, preco: undefined, subtotal: 100 }
Exercício 1, resultado: NaN
```

**Causa e correção:** uma lista com dois preços tem posições 0 e 1.
`index <= prices.length` deixa chegar à posição 2. Trocamos por `<`.
Somar `undefined` estraga o subtotal. Havia ainda dois erros escondidos atrás desse:
`> 100` excluía exatamente 100, então usamos `>= 100`; `subtotal * 0.1` calculava
somente o desconto, então devolvemos `subtotal - desconto`.

**Validação:** `[20,30] → 50`, `[40,60] → 90`, `[80,40] → 108`, `[] → 0`.
Os quatro casos passaram em `npm test`. Os logs temporários ficaram somente
na reprodução em `investigacao/`, fora da função corrigida.

Leia `subtotal += prices[index]` como “some este preço ao subtotal”.
Para conferir que entendeu: quanto deve dar uma compra `[70, 30]`? **90**.

## 2. Divisão e try/catch — `src/exercicio2.ts`

**Sintoma:** dividir por zero produz `Infinity`; acessar campos de `undefined`
pode lançar `TypeError`. **Reprodução:** o original faz apenas a divisão.
Em [antes.txt](evidencias/antes.txt), `10 / 0` produziu `Infinity`.
Esperamos rejeitar a entrada, sem fingir que existe um resultado válido.

**Hipótese:** falta conferir o que chegou antes de usar os dados.
**Ferramentas:** verificações de tipo, `Number.isFinite`, `try/catch` e `AppError`.
**Causa:** uma interface TypeScript não valida dados durante a execução.

**Correção, passo a passo:**

1. `unknown` significa “ainda não sei o que recebi”. Conferimos objeto, campos e números.
2. `Number.isFinite` rejeita `NaN` e `Infinity`.
3. O denominador não pode ser zero. Também conferimos se o resultado transbordou para infinito.
4. `throw new AppError(...)` interrompe a operação com um erro esperado.
5. `catch` recebe o erro como `unknown`. `instanceof AppError` identifica os erros conhecidos.

`AppError` herda de `Error`, acrescentando `statusCode`. `super(message)` inicializa
a parte herdada. Neste exercício de terminal, 400 e 500 são códigos apresentados;
não há uma resposta HTTP real.

**Validação:** divisão válida, zero, `undefined`, `null`, campos ausentes, texto,
`NaN`, `Infinity` e resultado infinito estão verificados em `npm test`.
`npm run ex2` também simula uma falha inesperada na leitura de um campo.
Veja [divisao.txt](evidencias/divisao.txt): o log interno vai para `stderr`, e o
usuário recebe mensagem genérica. Como ambos aparecem no terminal, você vê os dois;
numa API o stack ficaria apenas no servidor.

JavaScript não lança uma exceção automaticamente em `10 / 0`.
`any` deixaria acessar qualquer coisa sem conferir; `unknown` exige essa conferência.
O `catch` não imprime resultado de sucesso quando houve falha.

## 3. Parcelas e breakpoint — `src/exercicio3.ts`

**Sintoma:** solicitamos três parcelas, recebemos duas.
**Reprodução:** o laço original vai de 1 enquanto `number < 3`.
Saída real original: `[33.33, 33.33]`, em [antes.txt](evidencias/antes.txt).
**Hipótese:** a última repetição está sendo excluída.
**Ferramenta:** breakpoint, que pausa o programa para observar seus valores.
**Causa e correção:** começando em 1, usamos `number <= quantity` para incluir 3.

Para acompanhar no VS Code:

1. Abra a pasta `Debugging` para o editor encontrar `.vscode/launch.json`.
2. Abra `src/exercicio3.ts` e clique à esquerda da linha `installments.push(...)`.
3. Abra “Run and Debug”, selecione “Debug TypeScript” e pressione F5.
4. Adicione `installments.length` ao painel Watch.
5. Use F10 (Step Over) para executar as linhas e acompanhe o array crescendo.

`-r ts-node/register` carrega o suporte a TypeScript no Node antes do arquivo.
O debugger foi verificado aqui pelo **Node Inspector no JavaScript compilado**;
a interface gráfica do VS Code não foi operada. Os valores reais antes do `push`
estão em [breakpoint.txt](evidencias/breakpoint.txt):

| Repetição | number | quantity | installmentValue | installments.length |
|---|---:|---:|---:|---:|
| 1 | 1 | 3 | 33.33 | 0 |
| 2 | 2 | 3 | 33.33 | 1 |
| 3 | 3 | 3 | 33.33 | 2 |

**Validação:** 100 em 3 parcelas gera três valores; em 1 gera `[100]`;
em 4 gera `[25,25,25,25]`. Todos passaram.

O desafio extra está separado em `parcelasComAjuste`: três valores de 33,33 somam
99,99. Trabalhamos em centavos inteiros, dividimos arredondando para baixo e
deixamos a sobra na última: `[33.33, 33.33, 33.34]`. É uma regra de estudo para
valores pequenos, não uma implementação financeira completa.

**Perguntas:** Step Into entra na função chamada; Step Over executa a linha sem
entrar; Step Out termina a função atual e volta a quem chamou. Watch acompanha
expressões. Call Stack mostra `buildInstallments` e quem a chamou (no teste,
o script de inspeção; na execução normal, o arquivo do exercício).
O breakpoint permite olhar e avançar sem inserir vários logs. Arredondamento
precisa de regra para não perder ou criar centavos no total.

## 4. Logs estruturados — `src/logger.ts` e `src/exercicio4.ts`

**Sintoma:** nenhuma mensagem de início e fim aparece com nível `error`.
**Reprodução:** `npm run antes`; [antes.txt](evidencias/antes.txt) contém as marcas
antes e depois, sem nenhuma linha do logger entre elas.
**Esperado:** início, eventual erro e fim; sem dados sensíveis.
**Hipótese:** o filtro do logger bloqueia as mensagens `info`.
**Ferramenta:** Winston, com saídas em JSON.

**Causas e correções:**

- O nível fixo `error` bloqueava `info`. Agora usamos `LOG_LEVEL`, com padrão `info`.
- Um erro interrompia a função antes do fim. `finally` garante a tentativa de registrar o fim.
- Concatenar o pedido inteiro expunha dados. Registramos apenas `orderId`, separado da mensagem.
- Registrar somente a mensagem perdia a origem do erro. Passamos o `Error` ao Winston,
  com `format.errors({ stack: true })`, e relançamos a falha com `throw`.

`logger.child({ orderId })` apenas acrescenta o ID ao registro daquele erro.
`timestamp()` fornece a data em um campo próprio; `json()` organiza os campos.
O pedido simulado contém uma senha fictícia, mas o objeto completo nunca é logado.

**Validação:** [depois.txt](evidencias/depois.txt) contém início/fim do pedido 1 e
início/erro com stack/fim do pedido inexistente. [nivel-error.txt](evidencias/nivel-error.txt)
contém somente o erro, gerado com:

```bash
LOG_LEVEL=error npm run ex4 -- inexistente
```

Esse comando termina com código 1 porque o pedido falhou. No nível `error`, a
chamada de fim continua ocorrendo no código, mas `info` é filtrado intencionalmente.
Para observar início e fim, use o padrão `info`.

O nível da mensagem diz sua gravidade; o do logger define o que será exibido.
O objeto Error carrega o stack, além da mensagem. JSON facilita processar logs em
produção; em desenvolvimento pode-se usar formatação legível. Aqui usamos JSON nos
dois ambientes para simplificar. Data em campo separado facilita ordenar e filtrar.
Detalhes técnicos ficam no log; o usuário recebe somente informação adequada sobre a falha.

## 5. Middleware — `src/requestLogger.ts` e `src/server.ts`

Middleware é uma função no caminho entre receber uma requisição e responder.
`next()` permite seguir para a próxima etapa.

**Sintoma:** a rota inexistente tem status 200 no log, mas devolve 404; `/health`
nem passa pelo logger original. **Reprodução:** `npm run antes`.
**Esperado:** registrar o status final e o tempo gasto. **Hipótese:** estamos
registrando antes da resposta e instalando o middleware depois de uma rota.
**Evidência:** [antes.txt](evidencias/antes.txt) mostra `status: 200` e o status real 404.
Para permitir a reprodução em TypeScript, somente a subtração de datas foi adaptada
com `getTime()`; o erro de momento e ordem foi preservado.

**Correção:** registrar no evento `finish`, usar `process.hrtime.bigint()` para
medir intervalos e colocar o logger antes das rotas. A diferença é convertida de
nanossegundos para milissegundos. `Date.now()` mede o relógio do sistema, que pode
ser ajustado; `hrtime` é apropriado para medir tempo decorrido.

Ordem no servidor: logger → leitor de JSON → rotas → resposta 404 → tratador de erros.
O tratamento guarda o erro em `res.locals`; o log de conclusão o inclui uma única vez.
Um identificador `requestId` aparece no log e no cabeçalho `X-Request-Id` da resposta.
Ele permite relacionar registros da mesma requisição quando acrescentarmos outros logs.

Usamos `req.route?.path`: `/usuarios/:id` agrupa diferentes usuários.
`req.path` conteria `/usuarios/42`; `req.originalUrl` incluiria também a query string.
Para rotas inexistentes usamos um rótulo fixo. Isso evita armazenar caminhos e
parâmetros arbitrários. O corpo e os cabeçalhos não são registrados.

**Validação:** [depois.txt](evidencias/depois.txt) contém os cinco cenários:
`/health → 200`, rota inexistente `→ 404`, `/usuarios/42 → /usuarios/:id`,
`/erro → 500` com stack em uma única linha, `/lento → aproximadamente 200 ms`.

`close` pode indicar cancelamento; só registramos cancelamento se a resposta não
terminou, evitando duplicar o evento `finish`. Nesse caso não afirmamos que houve
um status HTTP entregue ao cliente: `statusCode` fica `null`.

Um campo de duração numérico permite calcular médias sem remover “ms” de textos.
Logar antes de `next()` mede apenas a entrada, sem o trabalho da rota. Corpos podem
conter senhas e outros dados pessoais. O middleware de erros fica por último para
receber falhas das etapas anteriores.

## 6. PM2 — `ecosystem.config.js`

PM2 cuida do processo Node: pode iniciar, observar e reiniciar o programa.
Instalamos localmente no projeto e usamos `npx pm2`, sem instalação global.

**Sintoma:** `/crash` responde `{ "ok": true }`, mas o processo cai 100 ms depois.
**Hipótese:** a exceção dentro de `setTimeout` escapa do fluxo da rota.
**Ferramentas:** PM2 list, logs, describe, monit e contador de reinícios.
**Reprodução:** o arquivo `investigacao/crash-antes.ts` preserva o erro original.

No terminal da pasta `Debugging`:

```bash
npm run build
export PM2_HOME="$PWD/.pm2"
npx pm2 --version
npx pm2 start dist/investigacao/crash-antes.js --name api --restart-delay 500
npx pm2 flush api
npx pm2 list
curl -i http://127.0.0.1:3001/crash
npx pm2 list
npx pm2 logs api --err --lines 100
```

Espere cerca de dois segundos entre o curl e o segundo list para ver o reinício.
`pm2 logs` acompanha continuamente; Ctrl+C sai da visualização, sem parar a API.
`npx pm2 describe api` mostra os caminhos dos logs. `npx pm2 monit` abre o painel;
chame `/crash` em outro terminal enquanto ele está aberto.

**Causa:** o callback do temporizador roda depois que a função da rota terminou.
O Express não recebe automaticamente essa exceção. Um `try/catch` fora do callback
também não a captura. A resposta de sucesso já tinha sido enviada.

**Correção:** no `src/server.ts`, esperamos a tarefa e capturamos a falha **dentro**
do callback, encaminhando-a com `next(erro)`. A falha simulada continua existindo
para estudo, mas agora resulta em 500, sem sucesso falso nem queda do processo.

Para executar a versão corrigida:

```bash
npx pm2 delete api
npx pm2 start ecosystem.config.js
npx pm2 flush api
npx pm2 list
curl -i http://127.0.0.1:3001/crash
curl -i http://127.0.0.1:3001/crash
npx pm2 list
npx pm2 logs api --lines 30 --nostream
```

**Validação real:** [pm2.txt](evidencias/pm2.txt) guarda os comandos, as tabelas,
o stack e as métricas. Antes da correção o contador passou de 0 a 1. Depois,
duas chamadas retornaram 500 mantendo o contador em 0. A captura do painel está
em [pm2-monit.txt](evidencias/pm2-monit.txt), com códigos de controle do terminal.
No painel, a memória começou em aproximadamente 60 MB, o uptime avançou de 1 s
para 2 s e apareceu o stack “falha ao processar a fila”. Após a queda, o painel
atualizou o contador para 1 e o uptime para 0. Nas amostras de `jlist` antes e
depois, a CPU estava em 0%; isso é uma amostra momentânea, não prova de ausência
de atividade durante o intervalo. O PID mudou de 15502 para 15550.
Não confundimos reinícios manuais feitos depois com falhas espontâneas.

O ecosystem aponta para JavaScript compilado; não precisa de interpretador ts-node.
Se não fizer o build e o arquivo não existir, o PM2 não consegue iniciar esse script.
`PORT` está explícita; o original dependia de uma variável externa. Em vez de
adivinhar uma porta quando ela falta, nossa versão usa 3001 como padrão.
`max_restarts` limita reinícios **instáveis consecutivos**, definidos por `min_uptime`;
não é um limite vitalício de reinícios.

**Perguntas e desafio extra:**

- **fork e cluster:** fork inicia um processo independente; cluster permite múltiplos
  workers atendendo a mesma porta. Usamos um processo em fork por simplicidade.
- **Saída zero:** por padrão, PM2 também reinicia processos que terminam normalmente;
  `stop_exit_codes` permite mudar isso. `pm2 stop` é uma parada solicitada ao gerenciador.
- **Reinício automático:** pode fazer o endpoint voltar rápido e esconder que há
  falhas repetidas. Por isso conferimos o contador e o stack, não só “online”.
- **Logs:** por padrão ficam em `~/.pm2/logs`. Nosso `PM2_HOME` isola os testes em
  `Debugging/.pm2/logs`; `out_file` e `error_file` no ecosystem também podem mudar os destinos.
- **restart, reload e delete:** restart reinicia; reload permite troca gradual em
  cluster, mas em fork resulta em reinício; delete remove o processo da lista.
  Executamos restart e reload em fork: ambos trocaram o PID e aumentaram o contador,
  conforme as métricas capturadas. Não demonstramos disponibilidade contínua em cluster.
- **Encerramento:** tratamos SIGINT/SIGTERM e chamamos `servidor.close()` antes de sair.
  O log “Encerrando servidor” aparece nos reinícios. Há um limite de três segundos
  para não esperar indefinidamente; o PM2 espera quatro segundos antes de forçar a saída.
- **Sem duplicação:** Winston escreve no console e o PM2 captura essa saída.
  Não adicionamos transporte de arquivo nem logamos novamente a mesma exceção.
- **uncaughtException/unhandledRejection:** sinalizam falhas que escaparam do tratamento.
  Continuar após erro fatal pode manter estado inconsistente. Registre, encerre de
  forma controlada e deixe o gerenciador reiniciar; não instale um handler vazio
  para fazer o problema desaparecer. A solução deste exercício trata a causa local.

Ao terminar seus próprios testes:

```bash
npx pm2 delete api
npx pm2 kill
```

Use esses comandos no terminal com o `PM2_HOME` isolado acima. Os processos usados
na verificação desta entrega já foram encerrados.

## Evidências e referências

Os arquivos de `evidencias/` são saídas reais; IDs, datas e tempos mudam a cada execução.
Os arquivos de `investigacao/` guardam versões defeituosas para comparação e não são
o servidor final. A configuração padrão do PM2 executa somente `dist/src/server.js`.

Referências consultadas para as configurações:

- [ts-node: carregar com register](https://github.com/TypeStrong/ts-node#node-flags-and-other-tools)
- [Winston: níveis e formatos](https://github.com/winstonjs/winston)
- [PM2: ecosystem](https://pm2.keymetrics.io/docs/usage/application-declaration/)
- [PM2: encerramento controlado](https://pm2.keymetrics.io/docs/usage/signals-clean-restart/)
- [PM2: fork e cluster](https://pm2.keymetrics.io/docs/faq/)
