# 08 — Roadmap

## ✅ Pronto (MVP atual)

- **Autenticação** — cadastro, login, sessão por JWT, papéis e admin.
- **Diretório de confiança** — busca, filtro por categoria, ordenação por nota, por cidade.
- **Indicações** — avaliação 1–5★, 1 por pessoa (upsert), nota média e contagem.
- **Cadastro de estabelecimento** — contribuição da comunidade (a “oferta”).
- **Feed da comunidade** — posts e respostas, com a ponte **feed → diretório**.
- **Verificação de identidade** — submissão → fila de admin → selo de confiança.
- **Notificações in-app** — sino, contador, dropdown, navegação por alvo.
- **Mensagens diretas** — chat 1:1 com lista de conversas e não lidas.
- **Multi-cidade** — lista curada, conteúdo por cidade, troca de cidade (badge e perfil).
- **Responsividade** — mobile-first com barra inferior + FAB; layout completo no desktop.

## 🔜 Próximos candidatos

- **Perfis públicos** — clicar num nome (autor de post, de indicação, contato) e ver o perfil
  e as contribuições da pessoa antes de interagir. Hoje só existe o perfil próprio
  (o backend `GET /api/users/:id` já entrega os dados).
- **Camada B2B** — editais/oportunidades de comércio bilateral BR–PY sobre a base de confiança
  já engajada (a monetização da estratégia “venha pela comunidade, fique pela rede de negócios”).
- **Notificações de mensagens** — hoje DMs usam só o badge; integrar ao sino se fizer sentido.

## 🧭 Melhorias técnicas (quando crescer)

- **Tempo real** — trocar o polling por WebSocket/SSE para mensagens e notificações.
- **E-mail/push** — notificações fora do app (boas-vindas, verificação aprovada, etc.).
- **Verificação assistida** — apoio à revisão (upload de imagem do documento, OCR, etc.);
  hoje é manual e baseada em dados digitados.
- **Banco** — migrar de SQLite para Postgres caso volume/concorrência exijam.
- **Testes automatizados** — não há suíte de testes ainda.
- **Limpeza** — remover o código legado do protótipo (ver doc 05).
- **i18n** — o protótipo tinha PT/ES; o app atual é em português. Reavaliar espanhol conforme o
  público paraguaio crescer.

## 📌 Princípio que guia o roadmap

**Densidade antes de amplitude.** Encher Asunción (estabelecimentos ativos, gente respondendo no
feed, verificações acontecendo) antes de abrir novas cidades ou a camada B2B. A fundação técnica
já suporta a expansão; a decisão de expandir é de produto, não de engenharia.
