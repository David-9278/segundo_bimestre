import "dotenv/config";
import { app } from "./app";

const porta = Number(process.env.PORT ?? 3000);

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET não definido. Copie .env.example para .env e preencha.");
  process.exit(1);
}

app.listen(porta, () => {
  console.log(`SubstituiJá rodando em http://localhost:${porta}`);
});
