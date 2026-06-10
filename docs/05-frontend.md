# 05 — Frontend

SPA em **React 19 + TypeScript**, estilizada com **Tailwind CSS v4**. Sem router externo: a
navegação é controlada por estado no `App.tsx`.

## Pontos de entrada

- **`src/main.tsx`** — monta o React e envolve tudo no `<AuthProvider>`.
- **`src/App.tsx`** — o “shell”: header, navegação, gate de login, cidade ativa, toasts e o
  switch de telas (`view`).

## Estado de autenticação — `src/auth.tsx`

`AuthProvider` + hook `useAuth()`. Expõe:

| Campo | Descrição |
|---|---|
| `user` | usuário atual (ou `null`) |
| `loading` | enquanto restaura a sessão no boot |
| `login(email, password)` | autentica e guarda o token |
| `register(payload)` | cria conta e autentica |
| `logout()` | limpa token e sessão |
| `updateProfile(data)` | atualiza o próprio perfil (`PATCH /me`) |
| `refreshUser()` | recarrega o usuário (`GET /me`) |

No boot, chama `GET /api/auth/me`; só descarta o token em **401** (falha de rede mantém a sessão).

## Cliente de API — `src/api.ts`

Wrapper tipado sobre `fetch`. Funções agrupadas: `authApi`, `estApi`, `userApi`, `postApi`,
`verificationApi`, `notificationApi`, `messageApi`. Também exporta constantes/tipos:
`CITIES`, `DEFAULT_CITY`, `ROLE_LABELS`, `Role`, e as interfaces (`User`, `Establishment`,
`Indication`, `Post`, `Notification`, `Conversation`, etc.).

- Token lido de `localStorage` (`conexao_token`) e enviado como `Bearer`.
- Erros viram `ApiError` com `.status` (usado para tratar 401).

## Navegação

`App.tsx` mantém `view` (`'directory' | 'detail' | 'profile' | 'feed' | 'post' | 'admin' | 'messages'`)
e ids selecionados. A navegação muda conforme o tamanho da tela:

- **Desktop (≥ lg):** navegação **inline no topo** + botão “Indicar”.
- **Mobile/tablet (< lg):** **barra inferior** (Diretório, Comunidade, Mensagens, Perfil,
  [Verificações se admin]) + **FAB** laranja de “Indicar” no diretório.

A **cidade ativa** vive no `App.tsx` (persistida em `localStorage`); `applyCity`/`changeCity`
propagam para diretório e feed.

## Componentes (telas)

| Arquivo | Papel |
|---|---|
| `AuthView.tsx` | Login e cadastro (com papel, cidade e bairro) |
| `DirectoryView.tsx` | Diretório: hero, **seletor de cidade**, busca, chips de categoria, cards |
| `EstablishmentDetail.tsx` | Ficha do estabelecimento, indicações, avaliar, WhatsApp, “falar com quem indicou” |
| `AddEstablishmentModal.tsx` | Modal para cadastrar estabelecimento (na cidade ativa) |
| `CommunityFeed.tsx` | Feed: compositor, filtro por categoria, lista de posts (por cidade) |
| `PostDetail.tsx` | Post + respostas; responder anexando estabelecimento; mensagem ao autor |
| `MyProfile.tsx` | Perfil próprio: status de verificação, edição (inclui **cidade**), contribuições |
| `VerificationModal.tsx` | Envio da solicitação de verificação |
| `AdminVerifications.tsx` | Fila de análise (admin): aprovar/recusar |
| `NotificationBell.tsx` | Sino no header: contador, dropdown, polling, navegação ao clicar |
| `MessagesView.tsx` | Mensagens: lista de conversas + thread (duas colunas no desktop) |
| `Stars.tsx` | Estrelas (exibição e input) reutilizável |

> **Helpers reaproveitados:** `timeAgo()` e `POST_CATEGORIES` ficam em `CommunityFeed.tsx` e são
> importados por outros componentes.

## Atualização em tempo (quase) real

Sem WebSocket; usa **polling**:
- Sino de notificações: a cada **20s**.
- Badge de mensagens não lidas (no `App`): a cada **15s**.
- Thread de mensagens aberta: a cada **5s**.

## Estilo

- Tema (cores, fontes) definido em `src/index.css` via `@theme` do Tailwind v4
  (`primary-navy`, `secondary-orange`, etc.).
- Ícones: **Material Symbols** (classe `material-symbols-outlined`).
- Animações utilitárias (`animate-fadeIn`, `animate-scaleUp`) e `line-clamp-2` definidas no CSS.

## Código legado (não usado)

Do protótipo inicial, ainda no disco mas **fora de uso**: `FeedView.tsx`, `ProfileView.tsx`,
`ProjectDetailsView.tsx`, `RegistrationView.tsx`, `src/data.ts`, `src/types.ts`. Mantidos para
referência/reaproveitamento; podem ser removidos com segurança.
