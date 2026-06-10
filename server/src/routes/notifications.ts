import { Router } from 'express';
import { db } from '../db';
import { requireAuth, type AuthedRequest } from '../auth';

export const notificationsRouter = Router();

interface NotificationRow {
  id: number;
  message: string;
  target_type: string | null;
  target_id: number | null;
  is_read: number;
  created_at: string;
}

function shape(n: NotificationRow) {
  return {
    id: n.id,
    message: n.message,
    targetType: n.target_type,
    targetId: n.target_id,
    isRead: !!n.is_read,
    createdAt: n.created_at,
  };
}

// GET /api/notifications -> recent notifications + unread count
notificationsRouter.get('/', requireAuth, (req: AuthedRequest, res) => {
  const rows = db
    .prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30')
    .all(req.user!.id) as unknown as NotificationRow[];
  const unread = db
    .prepare('SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND is_read = 0')
    .get(req.user!.id) as { c: number };
  res.json({ notifications: rows.map(shape), unreadCount: unread.c });
});

// POST /api/notifications/read-all -> mark all as read
notificationsRouter.post('/read-all', requireAuth, (req: AuthedRequest, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0').run(req.user!.id);
  res.json({ ok: true });
});

// POST /api/notifications/:id/read -> mark one as read
notificationsRouter.post('/:id/read', requireAuth, (req: AuthedRequest, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(
    Number(req.params.id),
    req.user!.id,
  );
  res.json({ ok: true });
});
