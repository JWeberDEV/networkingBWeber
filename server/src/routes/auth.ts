import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { signToken, requireAuth, type AuthedRequest } from '../auth';
import { isValidCity, DEFAULT_CITY } from '../cities';

export const authRouter = Router();

const ROLES = ['newcomer', 'established', 'business_owner'];

interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  city: string;
  neighborhood: string | null;
  bio: string | null;
  verified: number;
  verification_status: string;
  is_admin: number;
  created_at: string;
}

function publicUser(u: UserRow) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
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

authRouter.post('/register', (req, res) => {
  const { name, email, password, role, neighborhood, bio, city } = req.body ?? {};

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
  }
  if (!String(email).includes('@')) {
    return res.status(400).json({ error: 'E-mail inválido.' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'A senha deve ter ao menos 6 caracteres.' });
  }
  const safeRole = ROLES.includes(role) ? role : 'newcomer';
  const safeCity = isValidCity(city) ? city : DEFAULT_CITY;

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(String(email).toLowerCase());
  if (exists) {
    return res.status(409).json({ error: 'Já existe uma conta com este e-mail.' });
  }

  const hash = bcrypt.hashSync(String(password), 10);
  const info = db
    .prepare(
      `INSERT INTO users (name, email, password_hash, role, city, neighborhood, bio)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(String(name).trim(), String(email).toLowerCase(), hash, safeRole, safeCity, neighborhood ?? null, bio ?? null);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(info.lastInsertRowid)) as unknown as UserRow;
  const token = signToken({ id: user.id, email: user.email });
  res.status(201).json({ token, user: publicUser(user) });
});

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Informe e-mail e senha.' });
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase()) as unknown as UserRow | undefined;
  if (!user || !bcrypt.compareSync(String(password), user.password_hash)) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }
  const token = signToken({ id: user.id, email: user.email });
  res.json({ token, user: publicUser(user) });
});

authRouter.get('/me', requireAuth, (req: AuthedRequest, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id) as unknown as UserRow | undefined;
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  res.json({ user: publicUser(user) });
});
