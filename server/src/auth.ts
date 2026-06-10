import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const TOKEN_TTL = '7d';

export interface AuthUser {
  id: number;
  email: string;
}

export function signToken(user: AuthUser): string {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export interface AuthedRequest extends Request {
  user?: AuthUser;
}

/** Populates req.user when a valid Bearer token is present; never blocks. */
export function withUser(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.slice(7), JWT_SECRET) as unknown as { sub: number; email: string };
      req.user = { id: payload.sub, email: payload.email };
    } catch {
      /* invalid/expired token -> treated as anonymous */
    }
  }
  next();
}

/** Blocks the request with 401 when no authenticated user is present. */
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Autenticação necessária.' });
    return;
  }
  next();
}

/** Blocks the request unless the authenticated user is an admin/reviewer. */
export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Autenticação necessária.' });
    return;
  }
  const row = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(req.user.id) as
    | { is_admin: number }
    | undefined;
  if (!row || !row.is_admin) {
    res.status(403).json({ error: 'Acesso restrito a revisores.' });
    return;
  }
  next();
}
