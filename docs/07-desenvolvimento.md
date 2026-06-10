# 07 — Guia de desenvolvimento

## Pré-requisitos

- **Node.js 22+** (necessário para o módulo `node:sqlite`)
- **Yarn** (o projeto usa `yarn.lock`)

## Setup

```bash
yarn install
yarn dev:all
```

- API em `http://localhost:4000`, frontend em `http://localhost:3000`.
- O banco é criado e populado automaticamente na primeira execução.
- Login de demo: `ana@demo.com` / `demo1234` (admin).

## Scripts

| Script | O que faz |
|---|---|
| `yarn dev:all` | API + frontend juntos (via `concurrently`) |
| `yarn dev` | Apenas o frontend (Vite, porta 3000) |
| `yarn server` | Apenas a API (`node --experimental-sqlite --import tsx server/src/index.ts`) |
| `yarn build` | Build de produção do frontend |
| `yarn preview` | Servir o build de produção |
| `yarn lint` | Checagem de tipos (`tsc --noEmit`) — cobre frontend **e** backend |

## Variáveis de ambiente (opcionais)

Lidas via `dotenv` (crie um `.env` se quiser sobrescrever):

| Variável | Padrão | Uso |
|---|---|---|
| `API_PORT` | `4000` | Porta da API. **Não** use `PORT` (pode colidir com o Vite). |
| `JWT_SECRET` | `dev-secret-change-me` | Segredo de assinatura do JWT. **Troque em produção.** |

## Pegadinhas importantes

### ⚠️ O backend NÃO tem hot-reload
`yarn server` roda o `tsx` **sem watch**. Depois de editar **qualquer** arquivo em `server/**`,
**reinicie a API** — senão o código novo não roda. (O frontend, via Vite, recarrega normalmente.)

### ⚠️ Porta da API é `API_PORT`, não `PORT`
Ambientes de preview costumam injetar `PORT=3000`, o que faria a API competir com o Vite. Por
isso o backend usa `API_PORT` (padrão 4000) e o Vite faz proxy de `/api` para essa porta.

### ⚠️ Acentos em testes via terminal
Ao testar cidades acentuadas (ex.: `Encarnación`) por `curl` no shell, a normalização Unicode
pode diferir da constante `CITIES` e dar **falso negativo**. O caminho real do app (mesma
constante no front e no back) funciona corretamente — prefira testar pela interface.

## Tarefas comuns

### Resetar o banco (recriar schema + seed)
```bash
# pare a API, então:
rm server/data/app.db*     # PowerShell: Remove-Item server\data\app.db* -Force
# suba a API de novo (yarn dev:all / yarn server)
```

### Adicionar uma nova cidade
A cidade precisa estar nas **duas** listas (validação no back, UI no front):

1. `server/src/cities.ts` → adicione à constante `CITIES`.
2. `src/api.ts` → adicione à constante `CITIES` (mesmo texto, atenção aos acentos).
3. Reinicie a API. A cidade aparece nos seletores; começa **sem conteúdo** (expansão orgânica).

### Tornar um usuário admin
Não há UI para isso (intencional). Via seed (`db.ts`) ou direto no banco:
```sql
UPDATE users SET is_admin = 1 WHERE email = 'fulano@exemplo.com';
```

### Adicionar um endpoint
1. Crie/edite um arquivo em `server/src/routes/`.
2. Monte o router em `server/src/index.ts` (`app.use('/api/...', router)`).
3. Adicione a função correspondente em `src/api.ts`.
4. **Reinicie a API.**

## Build de produção (notas)

- `yarn build` gera o frontend em `dist/`.
- A API roda com `tsx` em produção também (ou pode ser transpilada). Configure `API_PORT` e um
  `JWT_SECRET` forte. Sirva o `dist/` por um servidor estático/*reverse proxy* apontando `/api`
  para a API.
- O banco SQLite é um arquivo — garanta persistência do diretório `server/data/`.
