# 04 — Referência da API

Base: **`/api`** (em dev, o Vite faz proxy para `http://localhost:4000`).
Respostas em **JSON**. Erros seguem o formato `{ "error": "mensagem" }`.

## Autenticação

Endpoints protegidos exigem o header:

```
Authorization: Bearer <token>
```

O token (JWT, validade 7 dias) é obtido no login/registro. Middlewares:
`withUser` (popula `req.user` se houver token), `requireAuth` (401 se não autenticado),
`requireAdmin` (403 se não for admin).

---

## Saúde

### `GET /api/health`
Pública. Retorna `{ ok: true, city: "Asunción" }`.

---

## Auth — `/api/auth`

### `POST /api/auth/register`
Cria conta e retorna token + usuário.
**Body:** `{ name, email, password, role?, city?, neighborhood?, bio? }`
- `role` ∈ `newcomer|established|business_owner` (padrão `newcomer`)
- `city` validada contra a lista; inválida → `Asunción`
- `password` mínimo 6 caracteres
**201:** `{ token, user }` · **400/409:** erro de validação / e-mail já existe

### `POST /api/auth/login`
**Body:** `{ email, password }` → **200:** `{ token, user }` · **401:** credenciais inválidas

### `GET /api/auth/me` 🔒
Retorna o usuário autenticado. **200:** `{ user }`

O objeto `user`:
```json
{
  "id": 1, "name": "Ana Beatriz", "email": "ana@demo.com",
  "role": "established", "city": "Asunción", "neighborhood": "Villa Morra",
  "bio": "...", "verified": true, "verificationStatus": "verified",
  "isAdmin": true, "createdAt": "..."
}
```

---

## Estabelecimentos — `/api/establishments`

### `GET /api/establishments`
Lista com nota média e contagem de indicações. Ordena por nota desc.
**Query:** `city`, `category`, `neighborhood`, `q` (busca em nome/descrição/categoria)
**200:** `{ establishments: [...] }`

### `GET /api/establishments/categories`
Categorias distintas com contagem.
**Query:** `city` (opcional) → **200:** `{ categories: [{ category, count }] }`

### `GET /api/establishments/:id`
Detalhe + indicações.
**200:** `{ establishment, indications: [{ id, rating, comment, createdAt, user }] }` · **404**

### `POST /api/establishments` 🔒
Cadastra um estabelecimento na cidade informada.
**Body:** `{ name, category, description?, address?, neighborhood?, phone?, whatsapp?, city? }`
**201:** `{ establishment }` · **400**

### `POST /api/establishments/:id/indications` 🔒
Cria **ou atualiza** a indicação do usuário (1 por pessoa por estabelecimento).
Notifica o autor do estabelecimento em indicações novas.
**Body:** `{ rating (1–5), comment? }` → **201:** `{ ok: true }` · **400/404**

---

## Usuários — `/api/users`

### `GET /api/users/:id`
Perfil público + estabelecimentos cadastrados pela pessoa.
**200:** `{ user, contributions: [...] }` · **404**

### `PATCH /api/users/me` 🔒
Atualiza o próprio perfil. Campos omitidos são preservados.
**Body:** `{ name?, role?, city?, neighborhood?, bio? }` (`city` validada)
**200:** `{ user }`

---

## Feed da comunidade — `/api/posts`

### `GET /api/posts`
Lista posts (mais recentes primeiro) com autor e contagem de respostas.
**Query:** `city`, `category` → **200:** `{ posts: [...] }`

### `GET /api/posts/:id`
Post + respostas (cada resposta pode referenciar um estabelecimento).
**200:** `{ post, replies: [{ id, body, createdAt, user, establishment }] }` · **404**

### `POST /api/posts` 🔒
**Body:** `{ body, category?, city? }` → **201:** `{ post }` · **400**

### `POST /api/posts/:id/replies` 🔒
Responde a um post; pode anexar um estabelecimento. Notifica o autor do post.
**Body:** `{ body, establishmentId? }` → **201:** `{ ok: true }` · **400/404**

---

## Verificação de identidade — `/api/verification`

### `GET /api/verification/me` 🔒
Última solicitação do usuário (ou `null`). **200:** `{ request }`

### `POST /api/verification` 🔒
Envia solicitação; muda o status do usuário para `pending`; notifica admins.
**Body:** `{ docType, docNumber, fullLegalName, note? }`
**201:** `{ ok: true }` · **400/409** (já verificado ou já pendente)

### `GET /api/verification/pending` 🔒👑 (admin)
Fila de solicitações pendentes com dados do usuário. **200:** `{ requests: [...] }`

### `POST /api/verification/:id/review` 🔒👑 (admin)
Aprova ou recusa. Em aprovação: `verified=1`, `verification_status=verified`. Notifica o usuário.
**Body:** `{ decision: "approve"|"reject", note? }` → **200:** `{ ok: true }` · **400/404/409**

---

## Notificações — `/api/notifications`

### `GET /api/notifications` 🔒
Últimas 30 notificações + contagem de não lidas.
**200:** `{ notifications: [{ id, message, targetType, targetId, isRead, createdAt }], unreadCount }`

### `POST /api/notifications/read-all` 🔒
Marca todas como lidas. **200:** `{ ok: true }`

### `POST /api/notifications/:id/read` 🔒
Marca uma como lida. **200:** `{ ok: true }`

---

## Mensagens diretas — `/api/messages`

### `GET /api/messages/unread-count` 🔒
Total de mensagens não lidas (para o badge). **200:** `{ unreadCount }`

### `GET /api/messages/conversations` 🔒
Uma linha por pessoa com quem você conversou (último texto, horário, não lidas).
**200:** `{ conversations: [{ user, lastBody, lastAt, unread }] }`

### `GET /api/messages/with/:userId` 🔒
Thread completa com um usuário; marca as recebidas como lidas.
**200:** `{ user, messages: [{ id, body, createdAt, mine }] }` · **404**

### `POST /api/messages/with/:userId` 🔒
Envia uma mensagem.
**Body:** `{ body }` → **201:** `{ message }` · **400/404**

---

🔒 = requer autenticação · 👑 = requer admin
