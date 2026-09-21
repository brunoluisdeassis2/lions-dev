// Apenas para reproduzir a queda original sob PM2.
import express from "express";
const app = express();
app.get("/crash", (_req, res) => {
  setTimeout(() => { throw new Error("falha ao processar a fila"); }, 100);
  res.json({ ok: true });
});
app.listen(Number(process.env.PORT || 3001), "127.0.0.1");
