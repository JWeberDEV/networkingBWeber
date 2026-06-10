import { Router } from 'express';
import { db } from '../db';
import { requireAuth, type AuthedRequest } from '../auth';

export const messagesRouter = Router();

// GET /api/messages/unread-count -> total unread messages (for the nav badge)
messagesRouter.get('/unread-count', requireAuth, (req: AuthedRequest, res) => {
  const row = db
    .prepare('SELECT COUNT(*) AS c FROM messages WHERE recipient_id = ? AND is_read = 0')
    .get(req.user!.id) as { c: number };
  res.json({ unreadCount: row.c });
});

// GET /api/messages/conversations -> one row per person you've talked to
messagesRouter.get('/conversations', requireAuth, (req: AuthedRequest, res) => {
  const uid = req.user!.id;
  const rows = db
    .prepare(
      `SELECT u.id AS other_id, u.name AS other_name, u.verified AS other_verified,
              (SELECT body FROM messages m
                 WHERE (m.sender_id = ? AND m.recipient_id = u.id)
                    OR (m.sender_id = u.id AND m.recipient_id = ?)
                 ORDER BY m.created_at DESC LIMIT 1) AS last_body,
              (SELECT created_at FROM messages m
                 WHERE (m.sender_id = ? AND m.recipient_id = u.id)
                    OR (m.sender_id = u.id AND m.recipient_id = ?)
                 ORDER BY m.created_at DESC LIMIT 1) AS last_at,
              (SELECT COUNT(*) FROM messages m
                 WHERE m.sender_id = u.id AND m.recipient_id = ? AND m.is_read = 0) AS unread
       FROM users u
       WHERE u.id IN (
         SELECT recipient_id FROM messages WHERE sender_id = ?
         UNION
         SELECT sender_id FROM messages WHERE recipient_id = ?
       )
       ORDER BY last_at DESC`,
    )
    .all(uid, uid, uid, uid, uid, uid, uid) as unknown as Array<{
    other_id: number; other_name: string; other_verified: number;
    last_body: string | null; last_at: string | null; unread: number;
  }>;

  res.json({
    conversations: rows.map((r) => ({
      user: { id: r.other_id, name: r.other_name, verified: !!r.other_verified },
      lastBody: r.last_body,
      lastAt: r.last_at,
      unread: r.unread,
    })),
  });
});

// GET /api/messages/with/:userId -> full thread (and mark incoming as read)
messagesRouter.get('/with/:userId', requireAuth, (req: AuthedRequest, res) => {
  const uid = req.user!.id;
  const otherId = Number(req.params.userId);
  const other = db
    .prepare('SELECT id, name, verified, role FROM users WHERE id = ?')
    .get(otherId) as { id: number; name: string; verified: number; role: string } | undefined;
  if (!other) return res.status(404).json({ error: 'Usuário não encontrado.' });

  const rows = db
    .prepare(
      `SELECT id, sender_id, body, created_at FROM messages
       WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
       ORDER BY created_at ASC`,
    )
    .all(uid, otherId, otherId, uid) as unknown as Array<{
    id: number; sender_id: number; body: string; created_at: string;
  }>;

  db.prepare('UPDATE messages SET is_read = 1 WHERE sender_id = ? AND recipient_id = ? AND is_read = 0').run(otherId, uid);

  res.json({
    user: { id: other.id, name: other.name, verified: !!other.verified, role: other.role },
    messages: rows.map((m) => ({ id: m.id, body: m.body, createdAt: m.created_at, mine: m.sender_id === uid })),
  });
});

// POST /api/messages/with/:userId -> send a message
messagesRouter.post('/with/:userId', requireAuth, (req: AuthedRequest, res) => {
  const uid = req.user!.id;
  const otherId = Number(req.params.userId);
  const { body } = req.body ?? {};
  if (!body?.trim()) return res.status(400).json({ error: 'Escreva uma mensagem.' });
  if (otherId === uid) return res.status(400).json({ error: 'Você não pode enviar mensagem para si mesmo.' });

  const other = db.prepare('SELECT id FROM users WHERE id = ?').get(otherId);
  if (!other) return res.status(404).json({ error: 'Usuário não encontrado.' });

  const info = db
    .prepare('INSERT INTO messages (sender_id, recipient_id, body) VALUES (?, ?, ?)')
    .run(uid, otherId, String(body).trim());
  res.status(201).json({
    message: { id: Number(info.lastInsertRowid), body: String(body).trim(), createdAt: new Date().toISOString(), mine: true },
  });
});
