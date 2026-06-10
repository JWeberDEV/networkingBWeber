import React, { useState } from 'react';
import { Post, ChatThread, ViewType } from '../types';
import { ASSETS, TRENDING_TOPICS } from '../data';

interface FeedViewProps {
  posts: Post[];
  userProfileName: string;
  userAvatar: string;
  onAddPost: (text: string, image?: string, tags?: string[]) => void;
  onToggleLike: (postId: string) => void;
  onNavigateToUser: (userId: string) => void;
  onNavigateToProject: (projectId: string) => void;
  onNavigateToView: (view: ViewType) => void;
  connections: { id: string; name: string; role: string; avatar: string; status: string }[];
  onConnect: (id: string) => void;
  searchQuery: string;
}

export default function FeedView({
  posts,
  userProfileName,
  userAvatar,
  onAddPost,
  onToggleLike,
  onNavigateToUser,
  onNavigateToProject,
  onNavigateToView,
  connections,
  onConnect,
  searchQuery
}: FeedViewProps) {
  const [newPostText, setNewPostText] = useState('');
  const [composerTagString, setComposerTagString] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [showTagInput, setShowTagInput] = useState(false);
  const [dummyImgUrl, setDummyImgUrl] = useState('');

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    // Parse hashtag tags from input or automatically detect from text
    const autoTags: string[] = [];
    const hashRegex = /#(\w+)/g;
    let match;
    while ((match = hashRegex.exec(newPostText)) !== null) {
      autoTags.push(match[1]);
    }

    if (composerTagString.trim()) {
      composerTagString.split(',').forEach(t => {
        const cleaned = t.trim().replace(/^#/, '');
        if (cleaned && !autoTags.includes(cleaned)) {
          autoTags.push(cleaned);
        }
      });
    }

    onAddPost(newPostText, dummyImgUrl || undefined, autoTags);
    setNewPostText('');
    setComposerTagString('');
    setDummyImgUrl('');
    setShowTagInput(false);
  };

  // Filter posts based on header searchQuery and hashtag click filter
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery
      ? post.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    const matchesTag = selectedTagFilter
      ? post.tags.some(t => t.toLowerCase() === selectedTagFilter.toLowerCase())
      : true;

    return matchesSearch && matchesTag;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
      {/* Central Feed Content */}
      <main className="md:col-span-8 lg:col-span-8 flex flex-col gap-6">
        
        {/* Active Tag Filter Indicator */}
        {selectedTagFilter && (
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex justify-between items-center animate-fadeIn">
            <span className="text-sm font-semibold text-primary-navy col-span-1">
              Filtrado por: <span className="text-secondary-orange">#{selectedTagFilter}</span>
            </span>
            <button 
              onClick={() => setSelectedTagFilter(null)}
              className="text-xs decoration-none bg-white py-1 px-2.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 cursor-pointer shadow-xs font-bold"
            >
              Limpar Filtro
            </button>
          </div>
        )}

        {/* Post Composer */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex gap-3 mb-3">
            <img 
              alt={userProfileName} 
              className="w-11 h-11 rounded-full border border-slate-200 object-cover" 
              src={userAvatar}
              referrerPolicy="no-referrer"
            />
            <div className="flex-1">
              <textarea 
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border-none focus:bg-slate-50/50 rounded-xl p-3 text-slate-800 text-sm placeholder-slate-400 focus:ring-1 focus:ring-primary-navy outline-none resize-none transition"
                placeholder="Começar uma publicação profissional sobre o mercado bilateral..."
              ></textarea>
            </div>
          </div>

          {showTagInput && (
            <div className="mb-3 px-12 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fadeIn">
              <div>
                <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Hashtags Extras (ex: Agro, Importação)</label>
                <input 
                  type="text" 
                  value={composerTagString}
                  onChange={(e) => setComposerTagString(e.target.value)}
                  placeholder="Tags separadas por vírgula"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">URL de Imagem Opcional</label>
                <input 
                  type="text" 
                  value={dummyImgUrl}
                  onChange={(e) => setDummyImgUrl(e.target.value)}
                  placeholder="https://exemplo.top/imagem.jpg"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2 outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between items-center border-t border-slate-100 pt-3">
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setShowTagInput(!showTagInput)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:bg-slate-50 rounded-lg transition text-xs font-semibold"
              >
                <span className="material-symbols-outlined text-primary-navy text-[18px]">image</span>
                <span>Mídia &amp; Tags</span>
              </button>
              <button 
                type="button"
                onClick={() => onNavigateToView('projetos')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:bg-slate-50 rounded-lg transition text-xs font-semibold"
              >
                <span className="material-symbols-outlined text-secondary-orange text-[18px]">event</span>
                <span>Evento</span>
              </button>
              <button 
                type="button"
                onClick={() => setShowTagInput(!showTagInput)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:bg-slate-50 rounded-lg transition text-xs font-semibold max-sm:hidden"
              >
                <span className="material-symbols-outlined text-amber-700 text-[18px]">article</span>
                <span>Escrever artigo</span>
              </button>
            </div>
            
            <button 
              onClick={handlePostSubmit}
              disabled={!newPostText.trim()}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer ${
                newPostText.trim() 
                  ? 'bg-secondary-orange hover:bg-secondary-orange/90 text-white' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Publicar
            </button>
          </div>
        </div>

        {/* Feed Posts */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-slate-300 text-[48px] mb-2">newspaper</span>
              <p className="text-slate-500 text-sm font-semibold">Nenhuma publicação encontrada para sua busca.</p>
              {selectedTagFilter && (
                <button 
                  onClick={() => setSelectedTagFilter(null)}
                  className="mt-3 text-xs bg-primary-navy text-white px-3 py-1.5 rounded-lg font-bold"
                >
                  Ver todas as publicações
                </button>
              )}
            </div>
          ) : (
            filteredPosts.map((post) => (
              <article key={post.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-xs hover:border-slate-300 transition duration-200">
                <div className="p-4 flex justify-between items-start">
                  <div className="flex gap-3">
                    <img 
                      alt={post.authorName} 
                      className="w-11 h-11 rounded-lg object-cover cursor-pointer hover:opacity-90" 
                      onClick={() => onNavigateToView('perfil')}
                      src={post.authorAvatar}
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 
                        className="text-sm font-bold text-slate-900 cursor-pointer hover:text-primary-navy leading-snug"
                        onClick={() => onNavigateToView('perfil')}
                      >
                        {post.authorName}
                      </h3>
                      <p className="text-xs text-slate-500">{post.authorRole}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-semibold">
                        {post.timeAgo} • <span className="material-symbols-outlined text-[12px]">public</span>
                      </p>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                    <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                  </button>
                </div>

                <div className="px-4 pb-4">
                  <p className="text-slate-700 text-sm whitespace-pre-line leading-relaxed mb-3">
                    {post.text}
                  </p>
                  
                  {/* Dynamic Hashtag links */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTagFilter(tag)}
                        className={`text-xs font-bold transition px-2 py-0.5 rounded-md hover:bg-indigo-50 ${
                          selectedTagFilter?.toLowerCase() === tag.toLowerCase()
                            ? 'text-secondary-orange bg-amber-50'
                            : 'text-primary-navy'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>

                  {post.image && (
                    <div className="mt-3 overflow-hidden rounded-xl border border-slate-100">
                      <img 
                        alt="Logistics context" 
                        className="w-full h-auto max-h-[360px] object-cover" 
                        referrerPolicy="no-referrer"
                        src={post.image} 
                      />
                    </div>
                  )}

                  {/* Highlights section matching dra beatriz document card */}
                  {post.id === 'post-2' && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border-l-4 border-secondary-orange">
                      <h4 className="font-bold text-slate-800 text-xs mb-1">Informativo Jurídico #022</h4>
                      <p className="text-xs text-slate-500 leading-relaxed mb-2">Clique para baixar o PDF completo com as novas regras da SET.</p>
                      <button 
                        onClick={() => onNavigateToView('mensagens')}
                        className="text-primary-navy text-[11px] font-bold tracking-wide hover:underline uppercase flex items-center gap-1 focus:outline-none"
                      >
                        <span className="material-symbols-outlined text-[14px]">download</span> Baixar PDF via Chat
                      </button>
                    </div>
                  )}
                </div>

                <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-slate-500 text-xs">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => onToggleLike(post.id)}
                      className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg transition-colors font-semibold outline-none cursor-pointer ${
                        post.userLiked 
                          ? 'text-secondary-orange bg-amber-50' 
                          : 'hover:text-secondary-orange hover:bg-slate-100'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                      <span>{post.likes}</span>
                    </button>
                    <button 
                      onClick={() => onNavigateToView('mensagens')}
                      className="flex items-center gap-1 py-1.5 px-2.5 hover:text-secondary-orange hover:bg-slate-100 rounded-lg transition font-semibold"
                    >
                      <span className="material-symbols-outlined text-[18px]">comment</span>
                      <span>{post.commentsCount}</span>
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => {
                        navigator.clipboard.writeText(`https://conexao.transfronteirica/posts/${post.id}`);
                        alert('Link do post copiado para a área de transferência!');
                    }}
                    className="flex items-center gap-1 py-1.5 px-2.5 hover:text-secondary-orange hover:bg-slate-100 rounded-lg transition font-semibold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">share</span>
                    <span className="max-sm:hidden">Compartilhar</span>
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </main>

      {/* Right Sidebar - Trending & Suggestions */}
      <aside className="md:col-span-4 flex flex-col gap-6">
        
        {/* Trending Topics */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
            Trending Topics
            <span className="material-symbols-outlined text-slate-400 text-[18px] cursor-help">info</span>
          </h4>
          <div className="space-y-3.5">
            {TRENDING_TOPICS.map((topic) => (
              <div 
                key={topic.id} 
                onClick={() => setSelectedTagFilter(topic.hashtag.replace('#', ''))}
                className="cursor-pointer group p-1.5 rounded-lg hover:bg-slate-50 transition"
              >
                <p className="text-xs font-bold text-slate-800 group-hover:text-secondary-orange transition">
                  {topic.hashtag}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{topic.count}</p>
              </div>
            ))}
          </div>
          <button 
            onClick={() => onNavigateToView('projetos')}
            className="w-full mt-4 text-secondary-orange font-bold text-xs text-center hover:underline focus:outline-none cursor-pointer"
          >
            Ver todos
          </button>
        </div>

        {/* Suggested Connections */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 mb-4">Sugestões de Rede</h4>
          <div className="space-y-4">
            {connections.map((conn) => (
              <div key={conn.id} className="flex items-center gap-3">
                <img 
                  alt={conn.name} 
                  className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                  src={conn.avatar}
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{conn.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{conn.role}</p>
                </div>
                <button 
                  onClick={() => onConnect(conn.id)}
                  disabled={conn.status !== 'Conectar'}
                  className={`border px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                    conn.status === 'Conectar'
                      ? 'border-secondary-orange text-secondary-orange hover:bg-secondary-orange hover:text-white cursor-pointer'
                      : 'border-slate-200 text-slate-400 cursor-default'
                  }`}
                >
                  {conn.status}
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={() => onNavigateToView('perfil')}
            className="w-full mt-4 text-secondary-orange font-bold text-xs text-center hover:underline focus:outline-none cursor-pointer"
          >
            Ver mais sugestões
          </button>
        </div>

        {/* Footer Links */}
        <footer className="px-2">
          <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
            <a className="hover:underline" href="#top">Sobre</a>
            <a className="hover:underline" href="#top">Acessibilidade</a>
            <a className="hover:underline" href="#top">Central de Ajuda</a>
            <a className="hover:underline" href="#top">Privacidade e Termos</a>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">© 2026 Conexão Transfronteiriça</p>
        </footer>
      </aside>
    </div>
  );
}
