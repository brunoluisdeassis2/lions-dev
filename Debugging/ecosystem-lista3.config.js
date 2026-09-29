// Uso dois processos só no teste do exercício 9, para verificar os IDs entre processos.
// Antes de iniciar, executo npm run build para gerar o arquivo JavaScript.
module.exports = {
  apps: [{
    name: "api-lista3",
    cwd: __dirname,
    script: "dist/src/server.js",
    instances: 2,
    exec_mode: "cluster",
    env: { PORT: 3002, LOG_LEVEL: "info", NODE_ENV: "development" },
  }],
};
