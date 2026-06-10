import React, { useEffect, useRef, useState } from 'react';
import { messageApi, type ChatMessage, type Conversation } from '../api';
import { timeAgo } from './CommunityFeed';

interface Props {
  initialUserId: number | null;
  onShowToast: (msg: string) => void;
  onChanged: () => void;
}

const initials = (name: string) => name.split(' ').map((n) => n[0]).slice(0, 2).join('');

export default function MessagesView({ initialUserId, onShowToast, onChanged }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(initialUserId);
  const [other, setOther] = useState<{ id: number; name: string; verified: boolean } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialUserId) setActiveId(initialUserId);
  }, [initialUserId]);

  const loadConversations = () =>
    messageApi.conversations().then((r) => setConversations(r.conversations)).catch(() => {});

  const loadThread = (uid: number) =>
    messageApi
      .thread(uid)
      .then((r) => {
        setOther(r.user);
        setMessages(r.messages);
      })
      .catch(() => {});

  useEffect(() => {
    loadConversations();
  }, []);

  // Load + poll the active thread; refresh the conversation list alongside.
  useEffect(() => {
    if (activeId == null) return;
    loadThread(activeId);
    const t = setInterval(() => {
      loadThread(activeId);
      loadConversations();
      onChanged();
    }, 5000);
    return () => clearInterval(t);
  }, [activeId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || activeId == null) return;
    setSending(true);
    try {
      const { message } = await messageApi.send(activeId, input);
      setMessages((m) => [...m, message]);
      setInput('');
      loadConversations();
      onChanged();
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'Erro ao enviar.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-4">Mensagens</h1>

      <div className="flex rounded-2xl border border-slate-200 bg-white overflow-hidden h-[calc(100vh-13rem)] lg:h-[calc(100vh-12rem)]">
        {/* Conversation list */}
        <aside
          className={`w-full lg:w-80 border-r border-slate-200 flex-col shrink-0 overflow-y-auto ${
            activeId == null ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              <span className="material-symbols-outlined text-[40px] text-slate-300">chat</span>
              <p className="mt-2">Nenhuma conversa ainda.</p>
              <p className="text-xs mt-1">Fale com alguém pelo perfil de um post ou estabelecimento.</p>
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.user.id}
                onClick={() => setActiveId(c.user.id)}
                className={`flex items-center gap-3 p-4 border-b border-slate-50 text-left hover:bg-slate-50 transition ${
                  activeId === c.user.id ? 'bg-indigo-50/50' : ''
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-primary-navy text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {initials(c.user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-bold text-slate-800 truncate">{c.user.name}</p>
                    {c.user.verified && <span className="material-symbols-outlined text-emerald-500 text-[13px]">verified</span>}
                    {c.lastAt && <span className="ml-auto text-[10px] text-slate-400 shrink-0">{timeAgo(c.lastAt)}</span>}
                  </div>
                  <p className={`text-xs truncate ${c.unread ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
                    {c.lastBody}
                  </p>
                </div>
                {c.unread > 0 && (
                  <span className="ml-1 min-w-[18px] h-[18px] px-1 bg-secondary-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                    {c.unread}
                  </span>
                )}
              </button>
            ))
          )}
        </aside>

        {/* Thread */}
        <section className={`flex-1 flex-col min-w-0 ${activeId == null ? 'hidden lg:flex' : 'flex'}`}>
          {activeId == null ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              <div className="text-center">
                <span className="material-symbols-outlined text-[48px] text-slate-300">forum</span>
                <p className="mt-2">Selecione uma conversa</p>
              </div>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="h-14 px-4 border-b border-slate-200 flex items-center gap-3 shrink-0">
                <button onClick={() => setActiveId(null)} className="lg:hidden p-1 -ml-1 text-slate-500">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="w-9 h-9 rounded-full bg-primary-navy text-white flex items-center justify-center font-bold text-xs">
                  {other ? initials(other.name) : ''}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate flex items-center gap-1">
                    {other?.name}
                    {other?.verified && <span className="material-symbols-outlined text-emerald-500 text-[14px]">verified</span>}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50">
                {messages.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs py-8">
                    Nenhuma mensagem ainda. Diga olá! 👋
                  </p>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                          m.mine
                            ? 'bg-primary-navy text-white rounded-br-sm'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap break-words">{m.body}</p>
                        <p className={`text-[9px] mt-1 ${m.mine ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {timeAgo(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={endRef} />
              </div>

              {/* Composer */}
              <form onSubmit={send} className="p-3 border-t border-slate-200 flex items-end gap-2 shrink-0">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send(e);
                    }
                  }}
                  rows={1}
                  placeholder="Escreva uma mensagem..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-1 focus:ring-primary-navy resize-none max-h-28"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="w-10 h-10 flex items-center justify-center bg-secondary-orange hover:brightness-110 disabled:opacity-50 text-white rounded-xl shrink-0 transition"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
