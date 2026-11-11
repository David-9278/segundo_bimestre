// config/database.ts
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL não definida. Usando fallback file:./dev.db");
}

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter, log: ['query'] });
export { prisma };
