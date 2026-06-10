import React, { useState } from 'react';
import { estApi, type Establishment, type EstablishmentInput } from '../api';

const CATEGORIES = [
  'Documentação & Migração',
  'Contabilidade',
  'Imobiliária & Moradia',
  'Saúde',
  'Educação',
  'Automotivo',
  'Câmbio & Finanças',
  'Alimentação',
  'Serviços Jurídicos',
  'Comércio & Compras',
  'Outros',
];

interface Props {
  city: string;
  onClose: () => void;
  onCreated: (e: Establishment) => void;
}

export default function AddEstablishmentModal({ city, onClose, onCreated }: Props) {
  const [form, setForm] = useState<EstablishmentInput>({ name: '', category: CATEGORIES[0] });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k: keyof EstablishmentInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Informe o nome do estabelecimento.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const { establishment } = await estApi.create({ ...form, city });
      onCreated(establishment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col animate-scaleUp">
        <div className="p-5 bg-primary-navy text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-orange">add_business</span>
            <h4 className="font-extrabold text-sm">Indicar um estabelecimento</h4>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white font-bold">✕</button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4 overflow-y-auto">
          <p className="text-xs text-slate-500 leading-relaxed">
            Conhece um serviço de confiança? Adicione-o ao mapa da comunidade para ajudar outros brasileiros.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary-navy bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
            <span className="material-symbols-outlined text-[15px]">pin_drop</span>
            Adicionando em {city}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-secondary-red text-secondary-red text-xs font-medium rounded-r-lg">
              {error}
            </div>
          )}

          <L label="Nome *">
            <input className={inp} value={form.name} onChange={set('name')} placeholder="Ex: Contadora Patrícia Benítez" />
          </L>
          <L label="Categoria *">
            <select className={inp} value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </L>
          <L label="Descrição">
            <textarea className={inp} rows={3} value={form.description ?? ''} onChange={set('description')} placeholder="O que faz, por que confiar, atende em português?" />
          </L>
          <div className="grid grid-cols-2 gap-3">
            <L label="Bairro">
              <input className={inp} value={form.neighborhood ?? ''} onChange={set('neighborhood')} placeholder="Villa Morra" />
            </L>
            <L label="Telefone">
              <input className={inp} value={form.phone ?? ''} onChange={set('phone')} placeholder="+595 21 ..." />
            </L>
          </div>
          <L label="Endereço">
            <input className={inp} value={form.address ?? ''} onChange={set('address')} placeholder="Av. ..." />
          </L>
          <L label="WhatsApp">
            <input className={inp} value={form.whatsapp ?? ''} onChange={set('whatsapp')} placeholder="+595 9..." />
          </L>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 bg-secondary-orange hover:brightness-110 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow cursor-pointer transition"
          >
            {busy ? 'Salvando...' : 'Adicionar ao diretório'}
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
