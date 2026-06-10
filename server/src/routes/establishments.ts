import { Router } from 'express';
import { db, createNotification } from '../db';
import { requireAuth, type AuthedRequest } from '../auth';
import { isValidCity, DEFAULT_CITY } from '../cities';

export const establishmentsRouter = Router();

interface EstRow {
  id: number;
  name: string;
  category: string;
  description: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string;
  phone: string | null;
  whatsapp: string | null;
  owner_user_id: number | null;
  created_by_user_id: number | null;
  created_at: string;
  avg_rating: number | null;
  indication_count: number;
}

function shapeEst(e: EstRow) {
  return {
    id: e.id,
    name: e.name,
    category: e.category,
    description: e.description,
    address: e.address,
    neighborhood: e.neighborhood,
    city: e.city,
    phone: e.phone,
    whatsapp: e.whatsapp,
    ownerUserId: e.owner_user_id,
    createdByUserId: e.created_by_user_id,
    createdAt: e.created_at,
    avgRating: e.avg_rating ? Math.round(e.avg_rating * 10) / 10 : null,
    indicationCount: e.indication_count,
  };
}

const SELECT_WITH_STATS = `
  SELECT e.*,
         AVG(i.rating)  AS avg_rating,
         COUNT(i.id)    AS indication_count
  FROM establishments e
  LEFT JOIN indications i ON i.establishment_id = e.id
`;

// GET /api/establishments?q=&category=&neighborhood=
establishmentsRouter.get('/', (req, res) => {
  const { q, category, neighborhood, city } = req.query;
  const where: string[] = [];
  const params: string[] = [];

  if (city) {
    where.push('e.city = ?');
    params.push(String(city));
  }
  if (category && category !== 'Todas') {
    where.push('e.category = ?');
    params.push(String(category));
  }
  if (neighborhood) {
    where.push('e.neighborhood = ?');
    params.push(String(neighborhood));
  }
  if (q) {
    where.push('(e.name LIKE ? OR e.description LIKE ? OR e.category LIKE ?)');
    const like = `%${String(q)}%`;
    params.push(like, like, like);
  }

  const sql =
    SELECT_WITH_STATS +
    (where.length ? ` WHERE ${where.join(' AND ')}` : '') +
    ' GROUP BY e.id ORDER BY avg_rating DESC NULLS LAST, indication_count DESC, e.name ASC';

  const rows = db.prepare(sql).all(...params) as unknown as EstRow[];
  res.json({ establishments: rows.map(shapeEst) });
});

// GET /api/establishments/categories?city=  -> distinct categories with counts
establishmentsRouter.get('/categories', (req, res) => {
  const { city } = req.query;
  const where = city ? ' WHERE city = ?' : '';
  const params = city ? [String(city)] : [];
  const rows = db
    .prepare(`SELECT category, COUNT(*) AS count FROM establishments${where} GROUP BY category ORDER BY count DESC`)
    .all(...params) as Array<{ category: string; count: number }>;
  res.json({ categories: rows });
});

// GET /api/establishments/:id  -> establishment + its indications
establishmentsRouter.get('/:id', (req, res) => {
  const row = db.prepare(SELECT_WITH_STATS + ' WHERE e.id = ? GROUP BY e.id').get(Number(req.params.id)) as unknown as
    | EstRow
    | undefined;
  if (!row) return res.status(404).json({ error: 'Estabelecimento não encontrado.' });

  const indications = db
    .prepare(
      `SELECT i.id, i.rating, i.comment, i.created_at, u.id AS user_id, u.name AS user_name, u.verified AS user_verified
       FROM indications i JOIN users u ON u.id = i.user_id
       WHERE i.establishment_id = ?
       ORDER BY i.created_at DESC`,
    )
    .all(Number(req.params.id)) as Array<{
    id: number; rating: number; comment: string | null; created_at: string;
    user_id: number; user_name: string; user_verified: number;
  }>;

  res.json({
    establishment: shapeEst(row),
    indications: indications.map((i) => ({
      id: i.id,
      rating: i.rating,
      comment: i.comment,
      createdAt: i.created_at,
      user: { id: i.user_id, name: i.user_name, verified: !!i.user_verified },
    })),
  });
});

// POST /api/establishments  (auth) -> community-contributed listing
establishmentsRouter.post('/', requireAuth, (req: AuthedRequest, res) => {
  const { name, category, description, address, neighborhood, phone, whatsapp, city } = req.body ?? {};
  if (!name?.trim() || !category?.trim()) {
    return res.status(400).json({ error: 'Nome e categoria são obrigatórios.' });
  }
  const safeCity = isValidCity(city) ? city : DEFAULT_CITY;
  const info = db
    .prepare(
      `INSERT INTO establishments (name, category, description, address, neighborhood, city, phone, whatsapp, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      String(name).trim(),
      String(category).trim(),
      description ?? null,
      address ?? null,
      neighborhood ?? null,
      safeCity,
      phone ?? null,
      whatsapp ?? null,
      req.user!.id,
    );
  const row = db.prepare(SELECT_WITH_STATS + ' WHERE e.id = ? GROUP BY e.id').get(Number(info.lastInsertRowid)) as unknown as EstRow;
  res.status(201).json({ establishment: shapeEst(row) });
});

// POST /api/establishments/:id/indications  (auth) -> add/update your indication
establishmentsRouter.post('/:id/indications', requireAuth, (req: AuthedRequest, res) => {
  const estId = Number(req.params.id);
  const { rating, comment } = req.body ?? {};
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) {
    return res.status(400).json({ error: 'A avaliação deve ser de 1 a 5 estrelas.' });
  }
  const est = db.prepare('SELECT id, name, created_by_user_id FROM establishments WHERE id = ?').get(estId) as
    | { id: number; name: string; created_by_user_id: number | null }
    | undefined;
  if (!est) return res.status(404).json({ error: 'Estabelecimento não encontrado.' });

  // Did this user already review this place? (decides whether to notify)
  const existing = db
    .prepare('SELECT id FROM indications WHERE establishment_id = ? AND user_id = ?')
    .get(estId, req.user!.id);

  // One indication per user per establishment: insert or update.
  db.prepare(
    `INSERT INTO indications (establishment_id, user_id, rating, comment)
     VALUES (?, ?, ?, ?)
     ON CONFLICT (establishment_id, user_id)
     DO UPDATE SET rating = excluded.rating, comment = excluded.comment, created_at = datetime('now')`,
  ).run(estId, req.user!.id, r, comment ?? null);

  // Notify the contributor on a *new* indication (not an edit), unless it's their own.
  if (!existing && est.created_by_user_id && est.created_by_user_id !== req.user!.id) {
    const actor = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user!.id) as { name: string } | undefined;
    createNotification(
      est.created_by_user_id,
      `${actor?.name ?? 'Alguém'} indicou seu estabelecimento "${est.name}".`,
      'establishment',
      estId,
    );
  }

  res.status(201).json({ ok: true });
});
