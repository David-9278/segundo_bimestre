# SubstituiJá — domínio e persistência

Entrega parcial da plataforma SubstituiJá, limitada ao modelo de dados Prisma,
às entidades de domínio e aos DAOs. A aplicação HTTP com Express ainda não faz
parte desta entrega.

## Tecnologias

- Node.js e TypeScript
- Prisma ORM 7
- SQLite com o adapter `better-sqlite3`

## Requisitos

- Node.js 20.19 ou superior
- npm

## Instalação e banco de dados

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run db:generate
npm run typecheck
```

O arquivo `.env` define a conexão local:

```env
DATABASE_URL="file:./dev.db"
```

As migrações estão versionadas em `prisma/migrations`. O cliente Prisma é
gerado localmente em `generated/prisma` e não precisa ser enviado ao GitHub.
Se o schema mudar, crie uma nova migração com:

```bash
npx prisma migrate dev --name nome_da_migracao
```

## Organização

```text
prisma/
  migrations/       # Migrações versionadas
  schema.prisma     # Modelos e relações
src/
  config/
    database.ts     # Prisma Client e adapter SQLite
  dominio/          # Entidades e regras de negócio
  persistencia/     # DAOs que acessam o banco via Prisma
generated/prisma/   # Cliente gerado localmente (ignorado pelo Git)
```

Esta entrega ainda não inclui servidor web, rotas, controllers, interface ou
testes automatizados.
