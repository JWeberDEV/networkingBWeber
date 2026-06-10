import React, { useEffect, useState } from 'react';
import { userApi, verificationApi, CITIES, ROLE_LABELS, type Contribution, type Role, type VerificationRequest } from '../api';
import { useAuth } from '../auth';
import Stars from './Stars';
import VerificationModal from './VerificationModal';

interface Props {
  onOpenEstablishment: (id: number) => void;
  onShowToast: (msg: string) => void;
  onActiveCityChange: (city: string) => void;
}

export default function MyProfile({ onOpenEstablishment, onShowToast, onActiveCityChange }: Props) {
  const { user, updateProfile, refreshUser } = useAuth();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [role, setRole] = useState<Role>(user?.role ?? 'newcomer');
  const [city, setCity] = useState(user?.city ?? CITIES[0]);
  const [neighborhood, setNeighborhood] = useState(user?.neighborhood ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [saving, setSaving] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [vreq, setVreq] = useState<VerificationRequest | null>(null);

  useEffect(() => {
    if (!user) return;
    userApi.get(user.id).then((r) => setContributions(r.contributions)).catch(() => {});
    verificationApi.me().then((r) => setVreq(r.request)).catch(() => {});
  }, [user]);

  if (!user) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cityChanged = city !== user?.city;
      await updateProfile({ name, role, city, neighborhood, bio });
      setEditing(false);
      if (cityChanged) {
        onActiveCityChange(city);
        onShowToast(`Perfil atualizado! Sua cidade agora é ${city}.`);
      } else {
        onShowToast('Perfil atualizado com sucesso!');
      }
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const initials = user.name.split(' ').map((n) => n[0]).slice(0, 2).join('');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-primary-navy to-secondary-orange" />
        <div className="px-6 md:px-8 pb-6 -mt-12">
          <div className="flex items-end justify-between gap-4">
            <div className="w-24 h-24 rounded-2xl bg-primary-navy text-white flex items-center justify-center text-2xl font-extrabold border-4 border-white shadow">
              {initials}
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span> Editar perfil
              </button>
            )}
          </div>

          {!editing ? (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-slate-900">{user.name}</h2>
                <StatusChip status={user.verificationStatus} />
              </div>
              <p className="text-sm font-semibold text-secondary-orange">{ROLE_LABELS[user.role]}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">pin_drop</span>
                {user.neighborhood ? `${user.neighborhood}, ` : ''}{user.city}
              </p>
              {user.bio && <p className="text-sm text-slate-600 leading-relaxed pt-2 max-w-2xl">{user.bio}</p>}
            </div>
          ) : (
            <form onSubmit={save} className="mt-4 space-y-3">
              <input className={inp} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`px-2 py-2 rounded-lg text-[11px] font-bold border-2 transition ${
                      role === r ? 'border-primary-navy bg-indigo-50/40 text-primary-navy' : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    {ROLE_LABELS[r]}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Cidade</label>
                <select className={inp} value={city} onChange={(e) => setCity(e.target.value)}>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <input className={inp} value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Bairro" />
              <textarea className={inp} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Conte um pouco sobre você" />
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="px-4 py-2 bg-secondary-orange text-white text-xs font-bold rounded-lg disabled:opacity-60">
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Verification banner */}
      {user.verificationStatus !== 'verified' && (
        <div
          className={`rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center gap-4 ${
            user.verificationStatus === 'pending'
              ? 'bg-amber-50 border-amber-200'
              : user.verificationStatus === 'rejected'
              ? 'bg-red-50 border-red-200'
              : 'bg-indigo-50 border-indigo-100'
          }`}
        >
          <span className={`material-symbols-outlined text-[32px] shrink-0 ${
            user.verificationStatus === 'pending' ? 'text-amber-600'
            : user.verificationStatus === 'rejected' ? 'text-secondary-red'
            : 'text-primary-navy'
          }`}>
            {user.verificationStatus === 'pending' ? 'hourglass_top' : 'verified_user'}
          </span>
          <div className="flex-1 min-w-0">
            {user.verificationStatus === 'pending' ? (
              <>
                <h4 className="font-bold text-sm text-amber-900">Verificação em análise</h4>
                <p className="text-xs text-amber-800 mt-0.5">Recebemos seus dados. Avisaremos assim que a revisão terminar.</p>
              </>
            ) : user.verificationStatus === 'rejected' ? (
              <>
                <h4 className="font-bold text-sm text-secondary-red">Verificação recusada</h4>
                <p className="text-xs text-red-800 mt-0.5">
                  {vreq?.reviewNote ? `Motivo: ${vreq.reviewNote}` : 'Confira seus dados e tente novamente.'}
                </p>
              </>
            ) : (
              <>
                <h4 className="font-bold text-sm text-primary-navy">Verifique sua identidade</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Membros verificados passam mais confiança e suas indicações têm mais peso na comunidade.
                </p>
              </>
            )}
          </div>
          {user.verificationStatus !== 'pending' && (
            <button
              onClick={() => setShowVerify(true)}
              className="shrink-0 px-4 py-2.5 bg-primary-navy hover:brightness-110 text-white text-xs font-bold rounded-xl transition"
            >
              {user.verificationStatus === 'rejected' ? 'Reenviar' : 'Verificar agora'}
            </button>
          )}
        </div>
      )}

      {/* Contributions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-4">
          Estabelecimentos que você indicou ({contributions.length})
        </h3>
        {contributions.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-4">
            Você ainda não adicionou nenhum estabelecimento. Compartilhe um serviço de confiança com a comunidade!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contributions.map((c) => (
              <button
                key={c.id}
                onClick={() => onOpenEstablishment(c.id)}
                className="text-left p-4 border border-slate-200 rounded-xl hover:border-primary-navy/40 hover:bg-slate-50 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 bg-indigo-50 text-primary-navy text-[10px] font-bold rounded-md">{c.category}</span>
                  {c.avgRating != null && (
                    <div className="flex items-center gap-1">
                      <Stars value={c.avgRating} size={13} />
                      <span className="text-[11px] font-bold text-slate-600">{c.avgRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <p className="font-bold text-sm text-slate-900">{c.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{c.neighborhood || 'Asunción'}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {showVerify && (
        <VerificationModal
          onClose={() => setShowVerify(false)}
          onSubmitted={async () => {
            setShowVerify(false);
            await refreshUser();
            verificationApi.me().then((r) => setVreq(r.request)).catch(() => {});
            onShowToast('Solicitação enviada! Sua identidade está em análise.');
          }}
        />
      )}
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-150">
        <span className="material-symbols-outlined text-[12px]">verified</span> Verificado
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
        Em análise
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-secondary-red border border-red-200">
        Recusado
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
      Não verificado
    </span>
  );
}

const inp =
  'w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:ring-1 focus:ring-primary-navy transition';
