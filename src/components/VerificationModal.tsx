import React, { useState } from 'react';
import { DOC_TYPES, verificationApi } from '../api';

interface Props {
  onClose: () => void;
  onSubmitted: () => void;
}

export default function VerificationModal({ onClose, onSubmitted }: Props) {
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [docNumber, setDocNumber] = useState('');
  const [fullLegalName, setFullLegalName] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber.trim() || !fullLegalName.trim()) {
      setError('Preencha o número do documento e o nome completo.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await verificationApi.submit({ docType, docNumber, fullLegalName, note: note || undefined });
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar.');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] flex flex-col animate-scaleUp">
        <div className="p-5 bg-primary-navy text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400">verified_user</span>
            <h4 className="font-extrabold text-sm">Verificar identidade</h4>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white font-bold">✕</button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4 overflow-y-auto">
          <p className="text-xs text-slate-500 leading-relaxed">
            A verificação aumenta a confiança da comunidade nas suas indicações. Seus dados são usados
            apenas para conferência e revisados manualmente pela nossa equipe.
          </p>

          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-secondary-red text-secondary-red text-xs font-medium rounded-r-lg">
              {error}
            </div>
          )}

          <L label="Nome completo (como no documento) *">
            <input className={inp} value={fullLegalName} onChange={(e) => setFullLegalName(e.target.value)} placeholder="Ex: João da Silva Santos" />
          </L>
          <L label="Tipo de documento *">
            <select className={inp} value={docType} onChange={(e) => setDocType(e.target.value)}>
              {DOC_TYPES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </L>
          <L label="Número do documento *">
            <input className={inp} value={docNumber} onChange={(e) => setDocNumber(e.target.value)} placeholder="000.000.000-00" />
          </L>
          <L label="Observação (opcional)">
            <textarea className={inp} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Algo que ajude na conferência" />
          </L>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 bg-secondary-orange hover:brightness-110 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow cursor-pointer transition"
          >
            {busy ? 'Enviando...' : 'Enviar para análise'}
          </button>
        </form>
      </div>
    </div>
  );
}

const inp =
  'w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:ring-1 focus:ring-primary-navy transition';

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">{label}</label>
      {children}
    </div>
  );
}
