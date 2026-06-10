import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { withUser } from './auth';
import './db'; // initialize + seed database on boot
import { authRouter } from './routes/auth';
import { establishmentsRouter } from './routes/establishments';
import { usersRouter } from './routes/users';
import { postsRouter } from './routes/posts';
import { verificationRouter } from './routes/verification';
import { notificationsRouter } from './routes/notifications';
import { messagesRouter } from './routes/messages';

const app = express();
// Use a dedicated var so we never collide with the web server's PORT (the Vite
// dev/preview port). The Vite proxy in vite.config.ts targets this same port.
const PORT = Number(process.env.API_PORT) || 4000;

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

app.listen(PORT, () => {
  console.log(`[api] Conexão BR-PY rodando em http://localhost:${PORT}`);
});
