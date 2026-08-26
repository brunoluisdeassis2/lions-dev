# Aula 4 - Lista de países

Esta é uma aplicação pequena feita com HTML, CSS e TypeScript. Ela busca países na REST Countries, mostra os países e permite pesquisar por nome ou filtrar por região.

## Como executar

Na primeira vez, abra o terminal dentro da pasta `Aula4` e execute:

```bash
npm install
npm start
```

Depois, abra `http://localhost:3000` no navegador.

Nas próximas vezes, basta executar:

```bash
npm start
```

Para desligar o servidor, pressione `Ctrl + C` no terminal.

## Arquivos do projeto

- `index.html`: contém os textos, a busca, o filtro e o espaço da lista.
- `style.css`: define as cores, os tamanhos e as posições.
- `app.ts`: contém a lógica TypeScript. Este é o arquivo que você deve estudar e alterar.
- `app.js`: é criado automaticamente a partir de `app.ts`, porque o navegador não executa TypeScript diretamente.
- `package.json`: guarda os comandos e as ferramentas do projeto.
- `tsconfig.json`: guarda as configurações do TypeScript.
- `node_modules`: guarda as ferramentas instaladas. Você não precisa alterar essa pasta.

## Como a aplicação funciona

1. O navegador abre o `index.html`.
2. O HTML carrega o `app.js` criado a partir do `app.ts`.
3. A classe `ServicoPaises` busca os países.
4. A função `mostrarPaises` cria um cartão para cada país.
5. Ao digitar ou escolher uma região, `filtrarPaises` cria uma lista filtrada.
6. A tela passa a mostrar somente os resultados encontrados.

## Conceitos de TypeScript praticados

- `interface Pais`: define quais informações existem em um país.
- `Pais[]`: significa uma lista de países.
- `class ServicoPaises`: reúne a ação de buscar países.
- `Promise<Pais[]>`: uma operação que entregará uma lista de países depois.
- `string`: representa um texto.
- `void`: indica que uma função não devolve um valor.
