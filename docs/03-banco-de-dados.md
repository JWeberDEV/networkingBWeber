# 03 — Banco de dados

Banco **SQLite** (via `node:sqlite`), arquivo único em `server/data/app.db`. O schema é criado
no boot (em `server/src/db.ts`), com migrações aditivas idempotentes e um seed inicial.

- `PRAGMA journal_mode = WAL`
- `PRAGMA foreign_keys = ON`

## Diagrama de relacionamentos

```
users 1───∞ establishments        (created_by_user_id / owner_user_id)
users 1───∞ indications ∞───1 establishments
users 1───∞ posts 1───∞ post_replies ∞───0..1 establishments
users 1───∞ verification_requests
users 1───∞ notifications
users 1───∞ messages (sender/recipient)
```

## Tabelas

### `users`
Membros da comunidade.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | INTEGER PK | |
| `name` | TEXT | |
| `email` | TEXT | único |
| `password_hash` | TEXT | bcrypt |
| `role` | TEXT | `newcomer` \| `established` \| `business_owner` |
| `city` | TEXT | cidade de moradia (validada contra a lista curada) |
| `neighborhood` | TEXT | opcional |
| `bio` | TEXT | opcional |
| `verified` | INTEGER | `0`/`1` — fonte do selo de confiança |
| `verification_status` | TEXT | `unverified` \| `pending` \| `verified` \| `rejected` |
| `is_admin` | INTEGER | `0`/`1` — acessa a fila de verificação |
| `created_at` | TEXT | `datetime('now')` |

### `establishments`
Itens do diretório (a “oferta”).

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | INTEGER PK | |
| `name` | TEXT | |
| `category` | TEXT | ex.: Contabilidade, Saúde, Educação… |
| `description` | TEXT | opcional |
| `address` / `neighborhood` | TEXT | opcionais |
| `city` | TEXT | cidade do estabelecimento |
| `phone` / `whatsapp` | TEXT | opcionais |
| `owner_user_id` | INTEGER FK→users | dono reivindicado (opcional) |
| `created_by_user_id` | INTEGER FK→users | quem cadastrou |
| `created_at` | TEXT | |

A **nota média** e a **contagem de indicações** são calculadas em tempo de consulta
(`AVG(rating)`, `COUNT`), não armazenadas.

### `indications`
Avaliações de estabelecimentos. **Uma por usuário por estabelecimento** (upsert).

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | INTEGER PK | |
| `establishment_id` | INTEGER FK | `ON DELETE CASCADE` |
| `user_id` | INTEGER FK | `ON DELETE CASCADE` |
| `rating` | INTEGER | `CHECK (rating BETWEEN 1 AND 5)` |
| `comment` | TEXT | opcional |
| `created_at` | TEXT | |
| | | `UNIQUE (establishment_id, user_id)` |

### `posts`
Publicações do feed da comunidade (perguntas/recados).

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | INTEGER PK | |
| `user_id` | INTEGER FK | autor |
| `category` | TEXT | opcional (ex.: Geral, Educação…) |
| `body` | TEXT | |
| `city` | TEXT | cidade do post (feed por cidade) |
| `created_at` | TEXT | |

### `post_replies`
Respostas a um post. Uma resposta pode **apontar para um estabelecimento** do diretório.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | INTEGER PK | |
| `post_id` | INTEGER FK | `ON DELETE CASCADE` |
| `user_id` | INTEGER FK | autor da resposta |
| `establishment_id` | INTEGER FK | opcional, `ON DELETE SET NULL` |
| `body` | TEXT | |
| `created_at` | TEXT | |

### `verification_requests`
Solicitações de verificação de identidade.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | INTEGER PK | |
| `user_id` | INTEGER FK | solicitante |
| `doc_type` | TEXT | CPF, Cédula, Passaporte, RNE, RUC/CNPJ |
| `doc_number` | TEXT | |
| `full_legal_name` | TEXT | |
| `note` | TEXT | opcional (do solicitante) |
| `status` | TEXT | `pending` \| `approved` \| `rejected` |
| `review_note` | TEXT | nota do revisor (opcional) |
| `created_at` / `reviewed_at` | TEXT | |

### `notifications`
Notificações in-app.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | INTEGER PK | |
| `user_id` | INTEGER FK | destinatário |
| `message` | TEXT | texto já renderizado |
| `target_type` | TEXT | `post` \| `establishment` \| `profile` \| `admin` \| null |
| `target_id` | INTEGER | id do alvo (quando aplicável) |
| `is_read` | INTEGER | `0`/`1` |
| `created_at` | TEXT | |

Índice: `idx_notifications_user (user_id, is_read)`.

### `messages`
Mensagens diretas 1:1.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | INTEGER PK | |
| `sender_id` | INTEGER FK | |
| `recipient_id` | INTEGER FK | |
| `body` | TEXT | |
| `is_read` | INTEGER | `0`/`1` (marcada ao abrir a conversa) |
| `created_at` | TEXT | |

Índices: `idx_messages_pair (sender_id, recipient_id)`, `idx_messages_inbox (recipient_id, is_read)`.

## Migrações

A função `migrate()` (em `db.ts`) roda no boot e é **idempotente**:
- Adiciona colunas via `ALTER TABLE ... ADD COLUMN` **somente se** ainda não existirem
  (`verification_status`, `is_admin` em `users`; `city` em `posts`).
- Cria tabelas novas com `CREATE TABLE IF NOT EXISTS` (`verification_requests`, `notifications`,
  `messages`).

Ou seja, é seguro tanto em banco novo quanto em banco já existente.

## Seed

Executado **apenas quando o banco está vazio** (sem usuários). Cria:

- **3 usuários** verificados (`ana@demo.com`, `rafael@demo.com`, `carla@demo.com`, senha `demo1234`);
  a Ana é **admin**.
- **12 estabelecimentos** de Asunción (serviços essenciais para recém-chegados).
- **2 indicações** por estabelecimento.
- **4 posts** no feed (com respostas que apontam para estabelecimentos).
- Uma **conversa** de exemplo e **notificações** correspondentes.

Para recriar do zero: apague `server/data/app.db*` e reinicie a API.
