// Minhas configurações para o PM2: ele lê este objeto para saber como iniciar a API.
// module.exports disponibiliza o objeto para quem carregar este arquivo.
module.exports = {
  // apps é a lista de aplicações. Neste exercício, coloquei só uma.
  apps: [{
    // Escolho o nome que aparece em comandos como npx pm2 logs api.
    name: "api",
    // __dirname é a pasta deste arquivo. Peço ao PM2 para executar o programa a partir dela.
    cwd: __dirname,
    // Aponto para o JavaScript gerado pelo TypeScript.
    // Preciso rodar npm run build antes, para esse arquivo existir.
    script: "dist/src/server.js",
    // Inicio apenas uma cópia da aplicação para facilitar o estudo.
    instances: 1,
    // fork executa a aplicação como um processo independente; não estou usando vários workers.
    exec_mode: "fork",
    // Peço ao PM2 que considere estável uma execução que permaneça ligada por cinco segundos.
    min_uptime: "5s",
    // Limito a três os reinícios instáveis consecutivos, antes de atingir min_uptime.
    // Não é um limite de todos os reinícios que a aplicação terá na vida.
    max_restarts: 3,
    // Espero 500 milissegundos antes de tentar reiniciar após uma queda.
    restart_delay: 500,
    // Dou até quatro segundos para a aplicação encerrar antes de o PM2 forçar a parada.
    kill_timeout: 4000,
    // Passo configurações ao programa: ambiente de desenvolvimento, porta 3001 e logs em info.
    env: { NODE_ENV: "development", PORT: 3001, LOG_LEVEL: "info" },
  }],
};
