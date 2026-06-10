import React, { useEffect, useState } from 'react';
import { estApi, type Establishment, type Indication } from '../api';
import { useAuth } from '../auth';
import Stars from './Stars';

interface Props {
  establishmentId: number;
  onBack: () => void;
  onShowToast: (msg: string) => void;
  onOpenConversation: (userId: number) => void;
}

export default function EstablishmentDetail({ establishmentId, onBack, onShowToast, onOpenConversation }: Props) {
  const { user } = useAuth();
  const [est, setEst] = useState<Establishment | null>(null);
  const [indications, setIndications] = useState<Indication[]>([]);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    estApi
      .get(establishmentId)
      .then((r) => {
        setEst(r.establishment);
        setIndications(r.indications);
        const mine = r.indications.find((i) => i.user.id === user?.id);
        if (mine) {
          setRating(mine.rating);
          setComment(mine.comment ?? '');
        }
      })
      .catch(() => setEst(null))
      .finally(() => setLoading(false));
  };

  useEffect(load, [establishmentId]);

  const submitIndication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      onShowToast('Escolha de 1 a 5 estrelas para avaliar.');
      return;
    }
    setSubmitting(true);
    try {
      await estApi.addIndication(establishmentId, { rating, comment: comment || undefined });
      onShowToast('Sua indicação foi registrada. Obrigado por ajudar a comunidade!');
      load();
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'Erro ao enviar.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400 text-sm">Carregando...</div>;
  if (!est) return <div className="text-center py-20 text-slate-400 text-sm">Estabelecimento não encontrado.</div>;

  const alreadyReviewed = indications.some((i) => i.user.id === user?.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-primary-navy text-sm font-semibold border border-slate-200 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 transition"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span> Voltar ao diretório
      </button>

      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-indigo-50 text-primary-navy text-xs font-bold rounded-lg">{est.category}</span>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">pin_drop</span>
            {est.neighborhood || est.city}
          </span>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">{est.name}</h1>

        <div className="flex items-center gap-3 mb-4">
          {est.avgRating != null ? (
            <>
              <Stars value={est.avgRating} size={20} />
              <span className="text-lg font-extrabold text-slate-800">{est.avgRating.toFixed(1)}</span>
              <span className="text-sm text-slate-400">
                ({est.indicationCount} {est.indicationCount === 1 ? 'indicação' : 'indicações'})
              </span>
            </>
          ) : (
            <span className="text-sm text-slate-400 italic">Ainda sem indicações — seja o primeiro.</span>
          )}
        </div>

        {est.description && <p className="text-slate-600 text-sm leading-relaxed mb-5">{est.description}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {est.address && <Info icon="location_on" label="Endereço" value={est.address} />}
          {est.phone && <Info icon="call" label="Telefone" value={est.phone} />}
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          {est.whatsapp && (
            <a
              href={`https://wa.me/${est.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#25D366] hover:brightness-105 text-white font-bold text-sm rounded-xl shadow transition"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span> Falar no WhatsApp
            </a>
          )}
          {est.createdByUserId && est.createdByUserId !== user?.id && (
            <button
              onClick={() => onOpenConversation(est.createdByUserId!)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-primary-navy font-bold text-sm rounded-xl transition"
            >
              <span className="material-symbols-outlined text-[18px]">forum</span> Falar com quem indicou
            </button>
          )}
        </div>
      </div>

      {/* Your indication */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-4">
          {alreadyReviewed ? 'Sua indicação' : 'Você recomenda este lugar?'}
        </h3>
        <form onSubmit={submitIndication} className="space-y-3">
          <Stars value={rating} size={32} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Conte como foi sua experiência (opcional)"
            className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-800 outline-none focus:ring-1 focus:ring-primary-navy transition"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-primary-navy hover:brightness-110 disabled:opacity-60 text-white font-bold text-sm rounded-xl cursor-pointer transition"
          >
            {submitting ? 'Enviando...' : alreadyReviewed ? 'Atualizar indicação' : 'Publicar indicação'}
          </button>
        </form>
      </div>

      {/* All indications */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
          Indicações da comunidade ({indications.length})
        </h3>
        {indications.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-4">Nenhuma indicação ainda.</p>
        ) : (
          indications.map((i) => (
            <div key={i.id} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-primary-navy text-white flex items-center justify-center font-bold text-xs">
                    {i.user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      {i.user.name}
                      {i.user.verified && (
                        <span className="material-symbols-outlined text-emerald-500 text-[14px]">verified</span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400">{new Date(i.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <Stars value={i.rating} size={15} />
              </div>
              {i.comment && <p className="text-sm text-slate-600 leading-relaxed pl-11">{i.comment}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 bg-slate-50 border border-slate-100 rounded-lg p-3">
      <span className="material-symbols-outlined text-primary-navy text-[20px]">{icon}</span>
      <div>
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  );
}
