import React, { useEffect, useState } from 'react';
import { estApi, postApi, type Establishment, type Post, type PostReply } from '../api';
import { useAuth } from '../auth';
import { timeAgo } from './CommunityFeed';

interface Props {
  postId: number;
  onBack: () => void;
  onOpenEstablishment: (id: number) => void;
  onOpenConversation: (userId: number) => void;
  onShowToast: (msg: string) => void;
  onChanged: () => void;
}

export default function PostDetail({ postId, onBack, onOpenEstablishment, onOpenConversation, onShowToast, onChanged }: Props) {
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<PostReply[]>([]);
  const [loading, setLoading] = useState(true);

  const [body, setBody] = useState('');
  const [establishmentId, setEstablishmentId] = useState('');
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    postApi
      .get(postId)
      .then((r) => {
        setPost(r.post);
        setReplies(r.replies);
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  };

  useEffect(load, [postId]);
  useEffect(() => {
    estApi.list().then((r) => setEstablishments(r.establishments)).catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await postApi.addReply(postId, {
        body,
        establishmentId: establishmentId ? Number(establishmentId) : undefined,
      });
      setBody('');
      setEstablishmentId('');
      onShowToast('Resposta publicada. Obrigado por ajudar!');
      load();
      onChanged();
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'Erro ao responder.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400 text-sm">Carregando...</div>;
  if (!post) return <div className="text-center py-20 text-slate-400 text-sm">Publicação não encontrada.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-primary-navy text-sm font-semibold border border-slate-200 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 transition"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span> Voltar à comunidade
      </button>

      {/* Post */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary-navy text-white flex items-center justify-center font-bold text-sm">
            {post.author.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 flex items-center gap-1">
              {post.author.name}
              {post.author.verified && <span className="material-symbols-outlined text-emerald-500 text-[15px]">verified</span>}
            </p>
            <p className="text-[11px] text-slate-400">{timeAgo(post.createdAt)}</p>
          </div>
          {post.category && (
            <span className="ml-auto px-2.5 py-1 bg-indigo-50 text-primary-navy text-[11px] font-bold rounded-md">{post.category}</span>
          )}
        </div>
        <p className="text-slate-800 leading-relaxed">{post.body}</p>
        {user && post.author.id !== user.id && (
          <button
            onClick={() => onOpenConversation(post.author.id)}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-primary-navy text-xs font-bold rounded-lg transition"
          >
            <span className="material-symbols-outlined text-[16px]">chat</span>
            Enviar mensagem a {post.author.name.split(' ')[0]}
          </button>
        )}
      </div>

      {/* Reply composer */}
      <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">Responder</h3>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Compartilhe sua experiência ou indicação..."
          className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-800 outline-none focus:ring-1 focus:ring-primary-navy resize-none transition"
        />
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="material-symbols-outlined text-secondary-orange text-[18px]">storefront</span>
            <select
              value={establishmentId}
              onChange={(e) => setEstablishmentId(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 px-2 py-2 rounded-lg outline-none focus:ring-1 focus:ring-primary-navy"
            >
              <option value="">Indicar um estabelecimento (opcional)</option>
              {establishments.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="px-5 py-2 bg-primary-navy hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition shrink-0"
          >
            {submitting ? 'Enviando...' : 'Responder'}
          </button>
        </div>
      </form>

      {/* Replies */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
          Respostas ({replies.length})
        </h3>
        {replies.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-2">Ainda sem respostas. Seja o primeiro a ajudar!</p>
        ) : (
          replies.map((r) => (
            <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                  {r.user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  {r.user.name}
                  {r.user.verified && <span className="material-symbols-outlined text-emerald-500 text-[13px]">verified</span>}
                </p>
                <span className="text-[10px] text-slate-400 ml-auto">{timeAgo(r.createdAt)}</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{r.body}</p>

              {r.establishment && (
                <button
                  onClick={() => onOpenEstablishment(r.establishment!.id)}
                  className="mt-3 w-full text-left flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 rounded-xl transition group"
                >
                  <span className="material-symbols-outlined text-secondary-orange">storefront</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-primary-navy truncate">
                      {r.establishment.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {r.establishment.category} • {r.establishment.neighborhood || 'Asunción'}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 ml-auto text-[18px]">arrow_forward</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
