import React, { useEffect, useState } from 'react';
import { ROLE_LABELS, verificationApi, type Role, type VerificationRequest } from '../api';

interface Props {
  onShowToast: (msg: string) => void;
}

export default function AdminVerifications({ onShowToast }: Props) {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});

  const load = () => {
    setLoading(true);
    verificationApi
      .pending()
      .then((r) => setRequests(r.requests))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const review = async (id: number, decision: 'approve' | 'reject') => {
    setBusyId(id);
    try {
      await verificationApi.review(id, { decision, note: notes[id] || undefined });
      onShowToast(decision === 'approve' ? 'Usuário verificado com sucesso!' : 'Solicitação recusada.');
      setRequests((rs) => rs.filter((r) => r.id !== id));
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'Erro ao revisar.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-orange">shield_person</span>
            Verificações pendentes
          </h1>
          <p className="text-slate-500 text-sm">Confira os documentos e aprove os membros da comunidade.</p>
        </div>
        <button onClick={load} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500" title="Atualizar">
          <span className="material-symbols-outlined text-[20px]">refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Carregando...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-emerald-400 text-[48px]">task_alt</span>
          <p className="text-slate-500 text-sm font-semibold mt-2">Nenhuma solicitação pendente.</p>
          <p className="text-slate-400 text-xs mt-1">Tudo em dia por aqui.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary-navy text-white flex items-center justify-center font-bold text-sm">
                  {r.user?.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{r.user?.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {r.user && ROLE_LABELS[r.user.role as Role]} • {r.user?.email}
                  </p>
                </div>
                <span className="ml-auto px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full">
                  Em análise
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <Field label="Nome legal" value={r.fullLegalName} />
                <Field label="Documento" value={`${r.docType}: ${r.docNumber}`} />
                {r.user?.neighborhood && <Field label="Bairro" value={r.user.neighborhood} />}
                <Field label="Enviado em" value={new Date(r.createdAt.replace(' ', 'T') + 'Z').toLocaleString('pt-BR')} />
              </div>

              {r.note && (
                <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-2.5 italic">
                  "{r.note}"
                </p>
              )}

              <input
                value={notes[r.id] ?? ''}
                onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                placeholder="Nota da revisão (opcional, ex: motivo da recusa)"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none focus:ring-1 focus:ring-primary-navy"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => review(r.id, 'approve')}
                  disabled={busyId === r.id}
                  className="flex-1 py-2.5 bg-emerald-600 hover:brightness-110 disabled:opacity-60 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span> Aprovar
                </button>
                <button
                  onClick={() => review(r.id, 'reject')}
                  disabled={busyId === r.id}
                  className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-secondary-red disabled:opacity-60 text-slate-600 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span> Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">{label}</p>
      <p className="text-xs font-semibold text-slate-700 mt-0.5">{value}</p>
    </div>
  );
}
