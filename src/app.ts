import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { rotaNaoEncontrada, tratarErros } from "./middlewares/tratarErros";
import { rotas } from "./rotas";

const pastaPublica = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");

export const app = express();

app.use(express.json());

app.get("/saude", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", rotas);
app.use(express.static(pastaPublica));

app.use(rotaNaoEncontrada);
app.use(tratarErros);
