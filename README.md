# SubstituiJá — API Express

Plataforma SubstituiJá: modelo de dados Prisma, entidades de domínio, DAOs e a
API HTTP com Express (autenticação, vagas, solicitações de substituição e
avaliações).

## Tecnologias

- Node.js e TypeScript
- Express 5 (API REST) e tsx (execução do TypeScript)
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
npm run dev
```

Com o servidor no ar, abra `http://localhost:3000`: o front é servido pelo próprio
Express e conversa com a API.

Preencha `JWT_SECRET` no `.env` antes de subir o servidor. A API sobe em
`http://localhost:3000` (ou na `PORT` definida) e as rotas ficam sob `/api`.

O arquivo `.env` define a conexão local:

```env
DATABASE_URL="file:./dev.db"
PORT=3000
JWT_SECRET="troque-por-um-segredo-longo-e-aleatorio"
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
  config/           # Prisma Client e adapter SQLite
  dominio/          # Entidades e regras de negócio
  persistencia/     # DAOs que acessam o banco via Prisma
  controladores/    # Regras de cada endpoint (usam domínio + DAOs)
  middlewares/      # Autenticação por token e tratamento de erros
  rotas/            # Mapa de rotas da API
  utils/            # Hash de senha, token assinado e erros HTTP
  app.ts            # Configuração do Express
  server.ts         # Inicialização do servidor
public/
  index.html        # Front (HTML + Tailwind) ligado à API via fetch
generated/prisma/   # Cliente gerado localmente (ignorado pelo Git)
```

## Autenticação

`POST /api/auth/login` devolve um `token`. Nas rotas protegidas envie:

```text
Authorization: Bearer <token>
```

## Rotas

| Método | Rota | Quem | O que faz |
| --- | --- | --- | --- |
| POST | `/api/auth/empresas` | público | Cadastra empresa |
| POST | `/api/auth/profissionais` | público | Cadastra profissional |
| POST | `/api/auth/login` | público | Login (`email`, `senha`, `tipo`: EMPRESA ou PROFISSIONAL) |
| GET | `/api/empresas/me` | empresa | Dados da empresa logada |
| GET | `/api/profissionais/me` | profissional | Dados do profissional logado |
| PATCH | `/api/profissionais/me` | profissional | Atualiza perfil e disponibilidade |
| GET | `/api/profissionais?categoria=&funcao=` | empresa | Lista profissionais disponíveis por categoria e/ou função |
| GET | `/api/vagas?busca=` | público | Pesquisa vagas abertas |
| GET | `/api/vagas/:id` | público | Detalhe da vaga |
| GET | `/api/vagas/minhas` | empresa | Vagas da empresa |
| POST | `/api/vagas` | empresa | Cria vaga |
| PUT | `/api/vagas/:id` | empresa dona | Edita vaga aberta |
| PATCH | `/api/vagas/:id/status` | empresa dona | Conclui (`concluida`) ou cancela (`cancelada`) |
| DELETE | `/api/vagas/:id` | empresa dona | Remove vaga |
| POST | `/api/vagas/:id/solicitacoes` | empresa dona | Envia convite aos profissionais escolhidos em `profissionalIds` (sem IDs, tenta até 3 compatíveis) |
| GET | `/api/vagas/:id/solicitacoes` | empresa dona | Acompanha respostas e identifica profissionais convidados |
| GET | `/api/solicitacoes/minhas?status=` | profissional | Solicitações recebidas |
| PATCH | `/api/solicitacoes/:id/aceitar` | profissional | Confirma participação; vaga vira `preenchida` e os demais convites pendentes expiram |
| PATCH | `/api/solicitacoes/:id/recusar` | profissional | Recusa |
| POST | `/api/vagas/:id/avaliacoes` | empresa ou profissional da vaga | Avalia (`nota` 1-5, `comentario`) após a vaga concluída |
| GET | `/api/vagas/:id/avaliacoes` | empresa ou profissional da vaga | Lista avaliações |

## Front

`public/index.html` usa `fetch` nas rotas acima. O token fica em `localStorage`.

- **Busca e categorias:** a busca pública lista vagas via `GET /api/vagas`; para empresas autenticadas, os cartões filtram profissionais disponíveis por categoria via `GET /api/profissionais?categoria=`. Profissionais escolhem a categoria no cadastro e podem alterá-la no painel; perfis antigos sem categoria continuam usando a função como sugestão.
- **Cadastro e login:** o formulário muda conforme o perfil (CNPJ para empresa; CPF, categoria, função e experiência para profissional).
- **Solicitar Substituto:** exige conta de empresa; publica a vaga com categoria e permite convidar automaticamente até três profissionais disponíveis daquela categoria ou escolher pessoas manualmente. Profissionais veem a categoria no próprio painel e em cada convite recebido.
- **Meu painel (empresa):** acompanha o nome e o estado de cada convite. Quando um profissional aceita, a vaga fica preenchida e a empresa vê a confirmação. Depois do trabalho, a empresa conclui a vaga e pode avaliar especificamente o profissional contratado; a nota média dele é atualizada junto da avaliação.
- **Meu painel (profissional):** mostra os dados do convite, incluindo a empresa, e permite aceitar para confirmar a participação ou recusar. Ao aceitar, sua disponibilidade é pausada enquanto a vaga estiver em andamento e volta ao ser concluída ou cancelada. Convites são recebidos no painel; não há envio real de e-mail/notificação externa.
- **Avaliações:** após a empresa concluir uma vaga preenchida, empresa e profissional podem deixar uma nota de 1 a 5 e comentário opcional. Cada parte pode avaliar uma vez por vaga.

Esta entrega não inclui testes automatizados.
