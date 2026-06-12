# 09 — Deploy (serviço único)

Estratégia: **um único serviço Node**. O Express serve o **build do frontend** (`dist/`) e a
**API** (`/api/...`) na **mesma origem**, com o banco **SQLite** em disco. Como o cliente de API
usa caminho relativo (`/api`), não há configuração de CORS/URL no frontend.

> **Por que não a Vercel?** O modelo serverless da Vercel tem filesystem efêmero/somente-leitura,
> incompatível com o SQLite em arquivo deste projeto. Veja a discussão no histórico — a opção
> escolhida (serviço único com disco) é a mais simples e fiel ao código atual.

## Como funciona em produção

Com `NODE_ENV=production`, o `server/src/index.ts`:

1. Escuta na porta do host (`PORT`).
2. Serve os arquivos estáticos de `dist/`.
3. Faz **SPA fallback**: qualquer rota que **não** comece com `/api` devolve `index.html`.
4. Cria/semeia o banco em `DATA_DIR` (ou `server/data` por padrão).

Localmente dá para simular:

```bash
yarn build
NODE_ENV=production PORT=5000 yarn start   # depois acesse http://localhost:5000
```

## Variáveis de ambiente

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `PORT` | injetada pelo host | `4000` | Porta do serviço (em produção). |
| `JWT_SECRET` | **sim (produção)** | `dev-secret-change-me` | Segredo de assinatura do JWT. **Troque!** |
| `DATA_DIR` | recomendada p/ persistência | `server/data` | Onde fica o `app.db` (aponte para um volume). |
| `NODE_VERSION` / `.node-version` | — | `22` | Node **22+** é necessário (`node:sqlite`). |

> Não defina `NODE_ENV=production` na fase de **instalação** do host — isso faria o gerenciador
> pular as `devDependencies` (vite, tailwind, typescript) e **quebrar o build**. O script `start`
> já define `NODE_ENV=production` apenas em tempo de execução (via `cross-env`).

## Render (recomendado)

O repositório já inclui um **`render.yaml`** (Blueprint).

**Via Blueprint (1 clique):**
1. Suba o projeto para um repositório no GitHub.
2. No [Render](https://render.com): **New ▸ Blueprint**, conecte o repositório.
3. O Render lê o `render.yaml`, cria o serviço, gera o `JWT_SECRET` e faz o deploy.

**Configuração manual (sem Blueprint):**
- **Build Command:** `yarn install && yarn build`
- **Start Command:** `yarn start`
- **Health Check Path:** `/api/health`
- **Env:** `NODE_VERSION=22`, `JWT_SECRET=<um segredo forte>`

### Persistência no Render
O plano **free não tem disco persistente** → o SQLite é **efêmero**: a cada deploy/restart o banco
volta ao **estado semeado**. Para uma **demo**, isso é ótimo (sempre limpo e populado).
Para **persistir** dados de visitantes: use um plano pago, adicione um **disco** montado em `/data`
e defina `DATA_DIR=/data` (há um bloco comentado no `render.yaml`).

> O plano free também **hiberna** após ~15 min sem acesso; a primeira requisição depois disso
> demora alguns segundos para "acordar".

## Railway / Fly.io / outros (via Docker)

O repositório inclui um **`Dockerfile`** portável.

- **Railway:** New Project ▸ Deploy from repo. O Railway detecta o `Dockerfile`. Para persistir,
  adicione um **Volume** e defina `DATA_DIR` para o caminho do volume.
- **Fly.io:** `fly launch` (detecta o `Dockerfile`) ▸ `fly volumes create data` ▸ monte o volume
  e defina `DATA_DIR`.
- Em todos: defina `JWT_SECRET`. A porta vem do host (`PORT`); o app escuta nela automaticamente.

## Checklist pós-deploy

- [ ] `GET /api/health` responde `{ ok: true }`.
- [ ] A home carrega e o login com `ana@demo.com` / `demo1234` funciona.
- [ ] Recarregar numa rota interna (ex.: já logado) não dá 404 (SPA fallback OK).
- [ ] `JWT_SECRET` definido (não usar o padrão de dev).
- [ ] (Se quiser persistência) `DATA_DIR` apontando para um volume.

## Notas

- O banco é **semeado automaticamente** quando está vazio (3 usuários demo, 12 estabelecimentos,
  feed e conversa de exemplo).
- O backend roda TypeScript via `tsx` (sem passo de transpilação) — por isso `tsx` está em
  `dependencies`, não em `devDependencies`.
