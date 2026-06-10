import { Router } from 'express';
import { db, createNotification } from '../db';
import { requireAuth, type AuthedRequest } from '../auth';
import { isValidCity, DEFAULT_CITY } from '../cities';

export const postsRouter = Router();

interface PostRow {
  id: number;
  category: string | null;
  body: string;
  created_at: string;
  user_id: number;
  user_name: string;
  user_verified: number;
  user_role: string;
  reply_count: number;
}

function shapePost(p: PostRow) {
  return {
    id: p.id,
    category: p.category,
    body: p.body,
    createdAt: p.created_at,
    replyCount: p.reply_count,
    author: { id: p.user_id, name: p.user_name, verified: !!p.user_verified, role: p.user_role },
  };
}

const SELECT_POST = `
  SELECT p.id, p.category, p.body, p.created_at,
         u.id AS user_id, u.name AS user_name, u.verified AS user_verified, u.role AS user_role,
         (SELECT COUNT(*) FROM post_replies r WHERE r.post_id = p.id) AS reply_count
  FROM posts p JOIN users u ON u.id = p.user_id
`;

// GET /api/posts?category=&city=
postsRouter.get('/', (req, res) => {
  const { category, city } = req.query;
  const conds: string[] = [];
  const params: string[] = [];
  if (city) {
    conds.push('p.city = ?');
    params.push(String(city));
  }
  if (category && category !== 'Todas') {
    conds.push('p.category = ?');
    params.push(String(category));
  }
  const where = conds.length ? ` WHERE ${conds.join(' AND ')}` : '';
  const rows = db.prepare(`${SELECT_POST}${where} ORDER BY p.created_at DESC`).all(...params) as unknown as PostRow[];
  res.json({ posts: rows.map(shapePost) });
});

// GET /api/posts/:id  -> post + replies (replies may reference an establishment)
postsRouter.get('/:id', (req, res) => {
  const post = db.prepare(`${SELECT_POST} WHERE p.id = ?`).get(Number(req.params.id)) as unknown as PostRow | undefined;
  if (!post) return res.status(404).json({ error: 'Publicação não encontrada.' });

  const replies = db
    .prepare(
      `SELECT r.id, r.body, r.created_at,
              u.id AS user_id, u.name AS user_name, u.verified AS user_verified,
              e.id AS est_id, e.name AS est_name, e.category AS est_category, e.neighborhood AS est_neighborhood
       FROM post_replies r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN establishments e ON e.id = r.establishment_id
       WHERE r.post_id = ?
       ORDER BY r.created_at ASC`,
    )
    .all(Number(req.params.id)) as unknown as Array<{
    id: number; body: string; created_at: string;
    user_id: number; user_name: string; user_verified: number;
    est_id: number | null; est_name: string | null; est_category: string | null; est_neighborhood: string | null;
  }>;

  res.json({
    post: shapePost(post),
    replies: replies.map((r) => ({
      id: r.id,
      body: r.body,
      createdAt: r.created_at,
      user: { id: r.user_id, name: r.user_name, verified: !!r.user_verified },
      establishment: r.est_id
        ? { id: r.est_id, name: r.est_name, category: r.est_category, neighborhood: r.est_neighborhood }
        : null,
    })),
  });
});

// POST /api/posts  (auth)
postsRouter.post('/', requireAuth, (req: AuthedRequest, res) => {
  const { body, category, city } = req.body ?? {};
  if (!body?.trim()) return res.status(400).json({ error: 'Escreva sua pergunta ou recado.' });
  const safeCity = isValidCity(city) ? city : DEFAULT_CITY;
  const info = db
    .prepare(`INSERT INTO posts (user_id, category, body, city) VALUES (?, ?, ?, ?)`)
    .run(req.user!.id, category?.trim() || null, String(body).trim(), safeCity);
  const post = db.prepare(`${SELECT_POST} WHERE p.id = ?`).get(Number(info.lastInsertRowid)) as unknown as PostRow;
  res.status(201).json({ post: shapePost(post) });
});

// POST /api/posts/:id/replies  (auth) -> optionally attach an establishment
postsRouter.post('/:id/replies', requireAuth, (req: AuthedRequest, res) => {
  const postId = Number(req.params.id);
  const { body, establishmentId } = req.body ?? {};
  if (!body?.trim()) return res.status(400).json({ error: 'Escreva uma resposta.' });

  const post = db.prepare('SELECT id, user_id FROM posts WHERE id = ?').get(postId) as
    | { id: number; user_id: number }
    | undefined;
  if (!post) return res.status(404).json({ error: 'Publicação não encontrada.' });

  let estId: number | null = null;
  if (establishmentId != null) {
    const est = db.prepare('SELECT id FROM establishments WHERE id = ?').get(Number(establishmentId));
    if (est) estId = Number(establishmentId);
  }

  db.prepare(`INSERT INTO post_replies (post_id, user_id, establishment_id, body) VALUES (?, ?, ?, ?)`).run(
    postId,
    req.user!.id,
    estId,
    String(body).trim(),
  );

  // Notify the post author (unless replying to themselves).
  if (post.user_id !== req.user!.id) {
    const actor = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user!.id) as { name: string } | undefined;
    createNotification(post.user_id, `${actor?.name ?? 'Alguém'} respondeu sua pergunta na comunidade.`, 'post', postId);
  }

  res.status(201).json({ ok: true });
});
