# 📖 Documentação — Conexão BR-PY

Documentação completa do sistema. Comece pela visão geral e siga conforme a necessidade.

| # | Documento | Conteúdo |
|---|---|---|
| 01 | [Visão geral & estratégia](01-visao-geral.md) | O que é, para quem, e a estratégia de produto |
| 02 | [Arquitetura](02-arquitetura.md) | Stack, estrutura de pastas, fluxo de dados, decisões técnicas |
| 03 | [Banco de dados](03-banco-de-dados.md) | Tabelas, colunas, relacionamentos, migrações e seed |
| 04 | [Referência da API](04-api.md) | Todos os endpoints, parâmetros e respostas |
| 05 | [Frontend](05-frontend.md) | Componentes, contexto de auth, cliente de API, navegação |
| 06 | [Funcionalidades em detalhe](06-funcionalidades.md) | Como cada recurso funciona, ponta a ponta |
| 07 | [Guia de desenvolvimento](07-desenvolvimento.md) | Setup, scripts, banco, “pegadinhas” e tarefas comuns |
| 08 | [Roadmap](08-roadmap.md) | O que está pronto, o que foi adiado e próximos passos |

## Resumo de 30 segundos

**Conexão BR-PY** é uma plataforma da comunidade brasileira no Paraguai: um **diretório de
estabelecimentos/serviços de confiança** com indicações, somado a **feed da comunidade**,
**mensagens diretas**, **verificação de identidade** e **notificações** — tudo com suporte a
**múltiplas cidades** (lançamento focado em Asunción).

- **Frontend:** React 19 + Vite + TypeScript + Tailwind v4
- **Backend:** Express + TypeScript + `node:sqlite` + JWT
- **Rodar:** `yarn install && yarn dev:all` → http://localhost:3000
- **Demo:** `ana@demo.com` / `demo1234`
