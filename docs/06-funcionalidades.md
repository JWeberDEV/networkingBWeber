# 06 — Funcionalidades em detalhe

Como cada recurso funciona de ponta a ponta.

## 1. Cadastro, login e sessão

- Tela única (`AuthView`) alterna entre **login** e **cadastro**.
- No cadastro, a pessoa escolhe **papel** (chegando / estabelecido / dono de negócio),
  **cidade** (lista curada) e **bairro** (opcional).
- O token JWT fica no `localStorage`; a sessão é restaurada no boot via `GET /me`.
- Novos usuários entram como **não verificados**.

## 2. Diretório de confiança

- Tela inicial (`DirectoryView`): hero com **seletor de cidade**, **busca** (debounce) e
  **chips de categoria** (com contagem por cidade).
- Cards mostram categoria, **nota média** (estrelas), bairro e número de indicações.
- Ordenação por nota desc; resultado filtrado por cidade + categoria + busca.
- Lista de categorias e itens vêm de `GET /establishments` e `/categories` (com `?city=`).

## 3. Indicações (avaliações)

- Na ficha (`EstablishmentDetail`): nota média, lista de indicações e formulário para avaliar.
- **1 indicação por pessoa por estabelecimento** — reavaliar **atualiza** a anterior (upsert no
  backend com `ON CONFLICT`).
- Uma indicação **nova** gera **notificação** para quem cadastrou o estabelecimento.
- Atalhos de contato: **WhatsApp** (link `wa.me`) e **“falar com quem indicou”** (abre conversa).

## 4. Cadastrar estabelecimento (a “oferta” da comunidade)

- Qualquer membro adiciona um estabelecimento pelo **modal** (`AddEstablishmentModal`),
  sempre na **cidade ativa** (mostrada no topo do modal).
- Aparece imediatamente no diretório e nas contribuições do perfil.

## 5. Feed da comunidade

- `CommunityFeed`: compositor (“pergunte algo…”), filtro por categoria e lista de posts
  **da cidade ativa**.
- `PostDetail`: post + respostas. Ao responder, é possível **anexar um estabelecimento** do
  diretório — a resposta vira um card clicável que leva à ficha.
- **A ponte feed → diretório:** transforma a pergunta solta (que no WhatsApp se perderia) em
  uma indicação **permanente e buscável**.
- Responder gera **notificação** ao autor do post. Há também botão para **enviar mensagem** ao autor.

## 6. Verificação de identidade

Fluxo de confiança com **revisão manual**:

1. Membro não verificado vê um **banner** no perfil e envia documento (`VerificationModal`):
   nome legal, tipo de documento (CPF, Cédula, Passaporte, RNE, RUC/CNPJ), número e observação.
2. Status vira **`pending`**; os **admins** recebem notificação.
3. O admin abre a aba **Verificações** (`AdminVerifications`), confere os dados e
   **aprova/recusa** (com nota opcional).
4. Em aprovação: o usuário fica **`verified`** e o **selo verde** passa a aparecer em todo o app
   (perfil, indicações, posts, conversas). Em recusa: status `rejected`, com motivo e opção de
   reenviar.

Estados refletidos no perfil: *Não verificado → Em análise → Verificado / Recusado*.

## 7. Notificações

- **In-app**, persistidas no banco; sino no header com **contador** e **dropdown** (polling 20s).
- Clicar numa notificação **marca como lida** e **navega** para o alvo (post, estabelecimento,
  perfil ou fila de admin). Há “marcar todas como lidas”.
- **Gatilhos:** resposta ao seu post; indicação no seu estabelecimento; verificação
  aprovada/recusada (para você); nova solicitação de verificação (para admins).

## 8. Mensagens diretas

- Chat **1:1** (`MessagesView`): lista de conversas (com badge de não lidas por conversa) +
  thread com balões e compositor.
- **Duas colunas no desktop**, **uma coluna no mobile** (lista → thread com voltar).
- Badge de não lidas na navegação (polling 15s); thread aberta atualiza a cada 5s; abrir a
  conversa marca as recebidas como lidas.
- **Pontos de entrada:** “enviar mensagem” no detalhe de um post (autor) e “falar com quem
  indicou” na ficha de um estabelecimento.

## 9. Multi-cidade

- **Lista curada** (`cities.ts` / `CITIES`): Asunción, Ciudad del Este, Encarnación,
  Hernandarias, Pedro Juan Caballero, Salto del Guairá. **Não** é texto livre.
- Diretório, categorias e feed são **escopados por cidade**.
- **Cidade ativa**: padrão = cidade de cadastro; trocável pelo **badge** do diretório; persistida
  no navegador.
- **Mudar de cidade no perfil**: o formulário de edição tem seletor de cidade; ao salvar uma
  cidade nova, a cidade ativa também muda.
- Só Asunción tem conteúdo semeado; as demais começam vazias (expansão orgânica).

## 10. Responsividade

- **Mobile-first.** Abaixo de `lg`: header enxuto + **barra de navegação inferior** + **FAB**.
  A partir de `lg`: navegação inline no topo.
- Telas, modais e o dropdown de notificações foram ajustados para não estourar em telas pequenas.
