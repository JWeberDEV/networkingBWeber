import React, { useEffect, useState } from 'react';
import { postApi, ROLE_LABELS, type Post } from '../api';

interface Props {
  onOpenPost: (id: number) => void;
  onShowToast: (msg: string) => void;
  refreshKey: number;
  city: string;
  onChanged: () => void;
}

export const POST_CATEGORIES = [
  'Geral',
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
];

export function timeAgo(iso: string): string {
  // SQLite stores 'YYYY-MM-DD HH:MM:SS' in UTC.
  const then = new Date(iso.replace(' ', 'T') + 'Z').getTime();
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export default function CommunityFeed({ onOpenPost, onShowToast, refreshKey, city, onChanged }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState('Todas');
  const [loading, setLoading] = useState(true);

  const [body, setBody] = useState('');
  const [category, setCategory] = useState('Geral');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    setLoading(true);
    postApi
      .list(city, filter)
      .then((r) => setPosts(r.posts))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [filter, refreshKey, city]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    try {
      await postApi.create({ body, category, city });
      setBody('');
      setCategory('Geral');
      onChanged();
      onShowToast('Sua pergunta foi publicada na comunidade!');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'Erro ao publicar.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Comunidade</h1>
        <p className="text-slate-500 text-sm">Pergunte, recomende e ajude quem está chegando em {city}.</p>
      </div>

      {/* Composer */}
      <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Pergunte algo à comunidade... ex: alguém indica um bom contador que fale português?"
          className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-800 outline-none focus:ring-1 focus:ring-primary-navy transition resize-none"
        />
        <div className="flex items-center justify-between gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-primary-navy"
          >
            {POST_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={posting || !body.trim()}
            className="px-5 py-2 bg-secondary-orange hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition"
          >
            {posting ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {['Todas', ...POST_CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition ${
              filter === c ? 'bg-primary-navy text-white border-primary-navy' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Carregando...</div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-slate-300 text-[48px]">forum</span>
          <p className="text-slate-500 text-sm font-semibold mt-2">Nenhuma publicação ainda.</p>
          <p className="text-slate-400 text-xs mt-1">Seja o primeiro a perguntar algo!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <button
              key={p.id}
              onClick={() => onOpenPost(p.id)}
              className="w-full text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-primary-navy/40 hover:shadow-sm transition"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-full bg-primary-navy text-white flex items-center justify-center font-bold text-xs">
                  {p.author.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    {p.author.name}
                    {p.author.verified && <span className="material-symbols-outlined text-emerald-500 text-[14px]">verified</span>}
                  </p>
                  <p className="text-[10px] text-slate-400">{ROLE_LABELS[p.author.role]} • {timeAgo(p.createdAt)}</p>
                </div>
                {p.category && (
                  <span className="ml-auto px-2 py-0.5 bg-indigo-50 text-primary-navy text-[10px] font-bold rounded-md shrink-0">
                    {p.category}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{p.body}</p>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                {p.replyCount} {p.replyCount === 1 ? 'resposta' : 'respostas'}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
