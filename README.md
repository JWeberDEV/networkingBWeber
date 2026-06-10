<div align="center">

# 🌎 Conexão BR-PY

### A comunidade brasileira no Paraguai, em um só lugar.

Um diretório de **estabelecimentos e serviços de confiança**, com indicações feitas por
brasileiros que já vivem no Paraguai — mais comunidade, mensagens e verificação de identidade.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-node%3Asqlite-003B57?logo=sqlite&logoColor=white)

</div>

---

## 💡 Sobre o projeto

A maioria das comunidades de brasileiros no Paraguai vive espalhada em grupos de
Facebook e WhatsApp — desorganizados, sem confiança verificável e sem permanência
(a informação útil some no scroll). O **Conexão BR-PY** resolve isso sendo o
**mapa de confiança** da comunidade:

> **Venha pela comunidade, fique pela rede de negócios.**

A estratégia é **hiperlocal primeiro**: começar denso em **uma cidade** (Asunción) e
expandir de forma controlada. Sobre essa base de confiança, no futuro entra a camada
B2B de comércio bilateral Brasil–Paraguai.

## ✨ Funcionalidades

| | Funcionalidade | Descrição |
|---|---|---|
| 🧭 | **Diretório de confiança** | Estabelecimentos e serviços por categoria, com busca e nota média |
| ⭐ | **Indicações** | Avaliações (1–5 ★) da comunidade; 1 por pessoa por lugar |
| 💬 | **Feed da comunidade** | Pedidos de indicação e recomendações — respostas podem **apontar para o diretório** |
| 🪪 | **Verificação de identidade** | Envio de documento → fila de análise do admin → selo de confiança |
| 🔔 | **Notificações** | Avisos in-app (respostas, indicações, verificação) com sino e contador |
| ✉️ | **Mensagens diretas** | Chat 1:1 entre membros |
| 🏙️ | **Multi-cidade** | Lista curada de cidades; cada uma com seu diretório e feed |
| 📱 | **Responsivo** | Mobile-first com barra de navegação inferior; layout completo no desktop |

## 🛠️ Stack

- **Frontend:** React 19 · Vite 6 · TypeScript · Tailwind CSS v4 · Material Symbols
- **Backend:** Express 4 · TypeScript (via `tsx`) · `node:sqlite` (SQLite nativo do Node) · JWT · bcrypt
- **Sem dependências nativas** — builda e roda no Windows/macOS/Linux sem compilar nada.

## 🚀 Começando

**Pré-requisitos:** Node.js **22+** (usa o módulo `node:sqlite`).

```bash
# 1. Instalar dependências
yarn install

# 2. Subir API (porta 4000) + frontend (porta 3000) juntos
yarn dev:all
```

Abra **http://localhost:3000**. O banco é criado e populado automaticamente na primeira
execução, com 12 estabelecimentos de Asunción.

### 🔑 Conta de demonstração

| E-mail | Senha | Papel |
|---|---|---|
| `ana@demo.com` | `demo1234` | Admin (revisa verificações) |
| `rafael@demo.com` | `demo1234` | Membro |
| `carla@demo.com` | `demo1234` | Membro |

## 📂 Estrutura

```
.
├── server/src/          # API Express
│   ├── db.ts            # schema, migrações e seed (SQLite)
│   ├── auth.ts          # JWT, bcrypt e middlewares
│   ├── cities.ts        # lista curada de cidades
│   └── routes/          # auth, establishments, users, posts, verification, notifications, messages
├── src/                 # Frontend React
│   ├── api.ts           # cliente HTTP da API
│   ├── auth.tsx         # contexto de autenticação
│   ├── App.tsx          # shell, navegação e gate de login
│   └── components/      # telas e componentes de UI
├── docs/                # 📖 documentação completa
└── README.md
```

## 📖 Documentação

A documentação detalhada está na pasta [`docs/`](docs/):

- [Visão geral & estratégia](docs/01-visao-geral.md)
- [Arquitetura](docs/02-arquitetura.md)
- [Banco de dados](docs/03-banco-de-dados.md)
- [Referência da API](docs/04-api.md)
- [Frontend](docs/05-frontend.md)
- [Funcionalidades em detalhe](docs/06-funcionalidades.md)
- [Guia de desenvolvimento](docs/07-desenvolvimento.md)
- [Roadmap](docs/08-roadmap.md)

## 📜 Scripts

| Script | O que faz |
|---|---|
| `yarn dev:all` | API + frontend juntos (desenvolvimento) |
| `yarn dev` | Apenas o frontend (Vite) |
| `yarn server` | Apenas a API |
| `yarn build` | Build de produção do frontend |
| `yarn lint` | Checagem de tipos (`tsc --noEmit`) |

---

<!-- gravatar -->

<div align="center">
<sub>Feito para aproximar brasileiros e paraguaios. 🇧🇷🤝🇵🇾</sub>
</div>
