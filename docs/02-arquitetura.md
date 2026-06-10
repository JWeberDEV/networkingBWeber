# 02 — Arquitetura

## Visão geral

Aplicação **full-stack** com frontend SPA em React e uma API REST em Express, conversando por
HTTP/JSON. Em desenvolvimento, o Vite faz **proxy** de `/api` para o backend.

```
┌─────────────────────────┐         /api/*  (proxy Vite)        ┌──────────────────────────┐
│  Frontend (Vite :3000)   │  ───────────────────────────────▶  │   API Express (:4000)     │
│  React 19 + TS + Tailwind│  ◀───────────────────────────────  │   TypeScript via tsx       │
│  JWT no localStorage     │            JSON                      │   node:sqlite (app.db)     │
└─────────────────────────┘                                     └──────────────────────────┘
```

## Stack

### Frontend
- **React 19** + **TypeScript**
- **Vite 6** (dev server + build)
- **Tailwind CSS v4** (via plugin `@tailwindcss/vite`; tema em `src/index.css`)
- **Material Symbols** (ícones via web font, carregada no `index.html`)
- Estado de autenticação via **React Context** (`src/auth.tsx`)

### Backend
- **Express 4** + **TypeScript**, executado com **`tsx`** (sem passo de build)
- **`node:sqlite`** — SQLite **nativo do Node 22+** (flag `--experimental-sqlite`). Sem módulos
  nativos para compilar.
- **`jsonwebtoken`** (JWT) + **`bcryptjs`** (hash de senha)
- **`cors`**, **`dotenv`**

> **Por que `node:sqlite`?** Evita dependências nativas (como `better-sqlite3`), que exigem
> toolchain de compilação no Windows. O banco é um único arquivo (`server/data/app.db`).

## Estrutura de pastas

```
server/src/
  index.ts                # cria o app Express, monta middlewares e rotas, escuta a porta
  db.ts                   # abre o SQLite, cria schema, roda migrações e seed; exporta createNotification()
  auth.ts                 # signToken, withUser, requireAuth, requireAdmin
  cities.ts               # lista curada de cidades + validação
  routes/
    auth.ts               # registro, login, /me
    establishments.ts     # diretório, categorias, detalhe, criação, indicações
    users.ts              # perfil público, atualização do próprio perfil
    posts.ts              # feed da comunidade (posts e respostas)
    verification.ts       # verificação de identidade + fila de admin
    notifications.ts      # notificações in-app
    messages.ts           # mensagens diretas 1:1

src/
  main.tsx                # ponto de entrada; envolve App no <AuthProvider>
  App.tsx                 # shell: header, navegação, gate de login, cidade ativa
  api.ts                  # cliente HTTP tipado + constantes (CITIES, ROLE_LABELS)
  auth.tsx                # AuthProvider/useAuth (login, registro, sessão, perfil)
  index.css               # Tailwind + tema + animações
  components/             # telas e componentes (ver doc 05)
```

## Fluxo de dados

1. O frontend chama `src/api.ts`, que faz `fetch('/api/...')` com o header
   `Authorization: Bearer <token>` quando há sessão.
2. O Vite encaminha `/api` para `http://localhost:4000` (config em `vite.config.ts`).
3. No Express, o middleware `withUser` decodifica o JWT (se houver) e popula `req.user`.
   `requireAuth`/`requireAdmin` protegem rotas.
4. As rotas leem/escrevem no SQLite via `db` (statements preparados) e respondem JSON.

## Autenticação

- **Login/registro** retornam um **JWT** (validade de 7 dias), guardado em `localStorage`
  (`conexao_token`).
- No boot, o `AuthProvider` chama `GET /api/auth/me` para restaurar a sessão. Só descarta o
  token em **401 real** (token inválido) — falhas de rede mantêm a sessão.
- Papéis: usuários comuns e **admins** (`is_admin`), que acessam a fila de verificação.

## Multi-cidade

- Lista **curada** em `server/src/cities.ts` (espelhada em `src/api.ts` como `CITIES`).
- `users`, `establishments` e `posts` carregam uma coluna `city`.
- Diretório, categorias e feed são filtrados por `?city=`.
- A **cidade ativa** vive no `App.tsx` (persistida em `localStorage` como `conexao_city`;
  padrão = cidade de cadastro do usuário) e pode ser trocada pelo badge do diretório.

## Decisões e “pegadinhas” importantes

- **Porta da API = `API_PORT` (padrão 4000), não `PORT`.** Ambientes de preview injetam
  `PORT=3000`, o que faria a API colidir com o Vite. Por isso o backend usa `API_PORT`.
- **O backend não tem hot-reload** (`tsx` roda sem watch). Após editar qualquer arquivo em
  `server/**`, é preciso **reiniciar a API**.
- **Banco em arquivo** (`server/data/app.db`, ignorado no git). Apagá-lo recria o schema e o
  seed na próxima subida.
- **Migrações aditivas** (`migrate()` em `db.ts`) usam `ALTER TABLE ... ADD COLUMN` apenas se a
  coluna não existir — seguro rodar em bancos já existentes.

Veja o [Guia de desenvolvimento](07-desenvolvimento.md) para comandos do dia a dia.
