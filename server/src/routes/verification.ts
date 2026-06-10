import { Router } from 'express';
import { db, createNotification } from '../db';
import { requireAuth, requireAdmin, type AuthedRequest } from '../auth';

export const verificationRouter = Router();

const DOC_TYPES = ['CPF', 'Cédula Paraguaia', 'Passaporte', 'RNE / Carteira de Residência', 'RUC / CNPJ'];

interface RequestRow {
  id: number;
  user_id: number;
  doc_type: string;
  doc_number: string;
  full_legal_name: string;
  note: string | null;
  status: string;
  review_note: string | null;
  created_at: string;
  reviewed_at: string | null;
}

function shape(r: RequestRow) {
  return {
    id: r.id,
    userId: r.user_id,
    docType: r.doc_type,
    docNumber: r.doc_number,
    fullLegalName: r.full_legal_name,
    note: r.note,
    status: r.status,
    reviewNote: r.review_note,
    createdAt: r.created_at,
    reviewedAt: r.reviewed_at,
  };
}

// GET /api/verification/me -> the current user's latest request (if any)
verificationRouter.get('/me', requireAuth, (req: AuthedRequest, res) => {
  const row = db
    .prepare('SELECT * FROM verification_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1')
    .get(req.user!.id) as unknown as RequestRow | undefined;
  res.json({ request: row ? shape(row) : null });
});

// POST /api/verification -> submit a verification request
verificationRouter.post('/', requireAuth, (req: AuthedRequest, res) => {
  const { docType, docNumber, fullLegalName, note } = req.body ?? {};
  if (!DOC_TYPES.includes(docType)) {
    return res.status(400).json({ error: 'Selecione um tipo de documento válido.' });
  }
  if (!docNumber?.trim() || !fullLegalName?.trim()) {
    return res.status(400).json({ error: 'Informe o número do documento e o nome completo.' });
  }

  const user = db.prepare('SELECT verification_status FROM users WHERE id = ?').get(req.user!.id) as
    | { verification_status: string }
    | undefined;
  if (user?.verification_status === 'verified') {
    return res.status(409).json({ error: 'Sua conta já está verificada.' });
  }
  if (user?.verification_status === 'pending') {
    return res.status(409).json({ error: 'Você já tem uma solicitação em análise.' });
  }

  db.prepare(
    `INSERT INTO verification_requests (user_id, doc_type, doc_number, full_legal_name, note)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(req.user!.id, docType, String(docNumber).trim(), String(fullLegalName).trim(), note?.trim() || null);
  db.prepare("UPDATE users SET verification_status = 'pending' WHERE id = ?").run(req.user!.id);

  // Let the reviewers know there's something in the queue.
  const actor = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user!.id) as { name: string } | undefined;
  const admins = db.prepare('SELECT id FROM users WHERE is_admin = 1').all() as unknown as Array<{ id: number }>;
  for (const a of admins) {
    createNotification(a.id, `${actor?.name ?? 'Um membro'} enviou uma solicitação de verificação.`, 'admin', null);
  }

  res.status(201).json({ ok: true });
});

// GET /api/verification/pending  (admin) -> review queue
verificationRouter.get('/pending', requireAdmin, (_req, res) => {
  const rows = db
    .prepare(
      `SELECT vr.*, u.name AS user_name, u.email AS user_email, u.role AS user_role,
              u.neighborhood AS user_neighborhood
       FROM verification_requests vr JOIN users u ON u.id = vr.user_id
       WHERE vr.status = 'pending'
       ORDER BY vr.created_at ASC`,
    )
    .all() as unknown as Array<RequestRow & { user_name: string; user_email: string; user_role: string; user_neighborhood: string | null }>;

  res.json({
    requests: rows.map((r) => ({
      ...shape(r),
      user: { id: r.user_id, name: r.user_name, email: r.user_email, role: r.user_role, neighborhood: r.user_neighborhood },
    })),
  });
});

// POST /api/verification/:id/review  (admin) -> approve or reject
verificationRouter.post('/:id/review', requireAdmin, (req: AuthedRequest, res) => {
  const { decision, note } = req.body ?? {};
  if (decision !== 'approve' && decision !== 'reject') {
    return res.status(400).json({ error: 'Decisão inválida.' });
  }
  const reqRow = db.prepare('SELECT * FROM verification_requests WHERE id = ?').get(Number(req.params.id)) as
    | unknown as RequestRow | undefined;
  if (!reqRow) return res.status(404).json({ error: 'Solicitação não encontrada.' });
  if (reqRow.status !== 'pending') {
    return res.status(409).json({ error: 'Esta solicitação já foi revisada.' });
  }

  const newStatus = decision === 'approve' ? 'approved' : 'rejected';
  db.prepare("UPDATE verification_requests SET status = ?, review_note = ?, reviewed_at = datetime('now') WHERE id = ?")
    .run(newStatus, note?.trim() || null, reqRow.id);

  if (decision === 'approve') {
    db.prepare("UPDATE users SET verified = 1, verification_status = 'verified' WHERE id = ?").run(reqRow.user_id);
    createNotification(reqRow.user_id, 'Sua identidade foi verificada! Você agora exibe o selo de confiança. ✓', 'profile', null);
  } else {
    db.prepare("UPDATE users SET verified = 0, verification_status = 'rejected' WHERE id = ?").run(reqRow.user_id);
    createNotification(
      reqRow.user_id,
      `Sua verificação foi recusada.${note?.trim() ? ` Motivo: ${note.trim()}` : ' Confira seus dados e tente novamente.'}`,
      'profile',
      null,
    );
  }

  res.json({ ok: true });
});
