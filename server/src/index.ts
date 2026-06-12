import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withUser } from './auth';
import './db'; // initialize + seed database on boot
import { authRouter } from './routes/auth';
import { establishmentsRouter } from './routes/establishments';
import { usersRouter } from './routes/users';
import { postsRouter } from './routes/posts';
import { verificationRouter } from './routes/verification';
import { notificationsRouter } from './routes/notifications';
import { messagesRouter } from './routes/messages';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const app = express();

// In production (single-service deploy) the host provides PORT and the API serves
// the frontend from the same origin. In dev we use API_PORT (4000) so we never
// collide with the Vite dev/preview server, which the Vite proxy targets.
const PORT = isProd ? Number(process.env.PORT) || 4000 : Number(process.env.API_PORT) || 4000;

app.use(cors());
app.use(express.json());
app.use(withUser);

app.get('/api/health', (_req, res) => res.json({ ok: true, city: 'Asunción' }));
app.use('/api/auth', authRouter);
app.use('/api/establishments', establishmentsRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/verification', verificationRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/messages', messagesRouter);

// Single-service deploy: serve the built frontend and fall back to index.html for
// client-side routes (everything that isn't an /api request).
if (isProd) {
  const distDir = path.resolve(__dirname, '../../dist');
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[api] Conexão BR-PY rodando na porta ${PORT}${isProd ? ' (produção)' : ''}`);
});
