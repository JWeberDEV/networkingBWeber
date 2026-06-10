import { Router } from 'express';
import { db } from '../db';
import { requireAuth, type AuthedRequest } from '../auth';
import { isValidCity } from '../cities';

export const usersRouter = Router();

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  city: string;
  neighborhood: string | null;
  bio: string | null;
  verified: number;
  verification_status: string;
  is_admin: number;
  created_at: string;
}

function publicUser(u: UserRow, includeEmail = false) {
  return {
    id: u.id,
    name: u.name,
    ...(includeEmail ? { email: u.email } : {}),
    role: u.role,
    city: u.city,
    neighborhood: u.neighborhood,
    bio: u.bio,
    verified: !!u.verified,
    verificationStatus: u.verification_status,
    isAdmin: !!u.is_admin,
    createdAt: u.created_at,
  };
}

// GET /api/users/:id  -> public profile + establishments they added
usersRouter.get('/:id', (req, res) => {
  const user = db
    .prepare('SELECT id, name, email, role, city, neighborhood, bio, verified, verification_status, is_admin, created_at FROM users WHERE id = ?')
    .get(Number(req.params.id)) as unknown as UserRow | undefined;
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

  const added = db
    .prepare(
      `SELECT e.id, e.name, e.category, e.neighborhood,
              AVG(i.rating) AS avg_rating, COUNT(i.id) AS indication_count
       FROM establishments e
       LEFT JOIN indications i ON i.establishment_id = e.id
       WHERE e.created_by_user_id = ?
       GROUP BY e.id ORDER BY e.created_at DESC`,
    )
    .all(user.id) as Array<{ id: number; name: string; category: string; neighborhood: string | null; avg_rating: number | null; indication_count: number }>;

  res.json({
    user: publicUser(user),
    contributions: added.map((e) => ({
      id: e.id,
      name: e.name,
      category: e.category,
      neighborhood: e.neighborhood,
      avgRating: e.avg_rating ? Math.round(e.avg_rating * 10) / 10 : null,
      indicationCount: e.indication_count,
    })),
  });
});

// PATCH /api/users/me  -> update own profile
usersRouter.patch('/me', requireAuth, (req: AuthedRequest, res) => {
  const { name, role, neighborhood, bio, city } = req.body ?? {};
  const roles = ['newcomer', 'established', 'business_owner'];
  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id) as unknown as UserRow;

  db.prepare(
    `UPDATE users SET name = ?, role = ?, city = ?, neighborhood = ?, bio = ? WHERE id = ?`,
  ).run(
    name?.trim() || current.name,
    roles.includes(role) ? role : current.role,
    isValidCity(city) ? city : current.city,
    neighborhood ?? current.neighborhood,
    bio ?? current.bio,
    req.user!.id,
  );

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id) as unknown as UserRow;
  res.json({ user: publicUser(updated, true) });
});
