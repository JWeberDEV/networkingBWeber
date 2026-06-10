import React, { useEffect, useState } from 'react';
import { useAuth } from './auth';
import { ROLE_LABELS, messageApi, DEFAULT_CITY } from './api';
import AuthView from './components/AuthView';
import DirectoryView from './components/DirectoryView';
import EstablishmentDetail from './components/EstablishmentDetail';
import MyProfile from './components/MyProfile';
import AddEstablishmentModal from './components/AddEstablishmentModal';
import CommunityFeed from './components/CommunityFeed';
import PostDetail from './components/PostDetail';
import AdminVerifications from './components/AdminVerifications';
import NotificationBell from './components/NotificationBell';
import MessagesView from './components/MessagesView';
import type { Notification } from './api';

type View = 'directory' | 'detail' | 'profile' | 'feed' | 'post' | 'admin' | 'messages';

export default function App() {
  const { user, loading, logout } = useAuth();
  const [view, setView] = useState<View>('directory');
  const [selectedEstId, setSelectedEstId] = useState<number | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [selectedConvUserId, setSelectedConvUserId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [feedKey, setFeedKey] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [messagesUnread, setMessagesUnread] = useState(0);
  const [city, setCityState] = useState<string>(() => localStorage.getItem('conexao_city') || DEFAULT_CITY);

  // Default the active city to the user's own city on first login (no stored choice yet).
  useEffect(() => {
    if (user && !localStorage.getItem('conexao_city')) setCityState(user.city);
  }, [user]);

  // Set the active city (persist + force the city-scoped views to refetch).
  const applyCity = (c: string) => {
    setCityState(c);
    localStorage.setItem('conexao_city', c);
    setRefreshKey((k) => k + 1);
    setFeedKey((k) => k + 1);
  };

  // Used by the directory badge: switch city and land on the directory.
  const changeCity = (c: string) => {
    applyCity(c);
    setView('directory');
  };

  const loadMessagesUnread = () =>
    messageApi.unreadCount().then((r) => setMessagesUnread(r.unreadCount)).catch(() => {});

  // Poll the unread-message count for the nav badge.
  useEffect(() => {
    if (!user) return;
    loadMessagesUnread();
    const t = setInterval(loadMessagesUnread, 15000);
    return () => clearInterval(t);
  }, [user]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const openEstablishment = (id: number) => {
    setSelectedEstId(id);
    setView('detail');
  };

  const openPost = (id: number) => {
    setSelectedPostId(id);
    setView('post');
  };

  const openConversation = (userId: number) => {
    setSelectedConvUserId(userId);
    setView('messages');
  };

  const handleNotificationNav = (targetType: Notification['targetType'], targetId: number | null) => {
    if (targetType === 'post' && targetId != null) openPost(targetId);
    else if (targetType === 'establishment' && targetId != null) openEstablishment(targetId);
    else if (targetType === 'admin') setView('admin');
    else if (targetType === 'profile') setView('profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 text-sm">
        Carregando...
      </div>
    );
  }

  if (!user) return <AuthView />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] p-4 bg-primary-navy text-white rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn max-w-md w-11/12">
          <span className="material-symbols-outlined text-secondary-orange shrink-0">verified_user</span>
          <span className="text-xs md:text-sm font-bold leading-normal">{toast}</span>
        </div>
      )}

      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <button
          onClick={() => setView('directory')}
          className="flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-secondary-orange text-[28px]">diversity_3</span>
          <span className="font-extrabold text-sm text-slate-900 tracking-tight hidden sm:block">Conexão BR-PY</span>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full hidden md:block">
            {city}
          </span>
        </button>

        <div className="flex items-center gap-1.5">
          {/* Desktop inline navigation (mobile uses the bottom bar) */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <NavBtn active={view === 'directory' || view === 'detail'} onClick={() => setView('directory')} icon="explore" label="Diretório" />
            <NavBtn active={view === 'feed' || view === 'post'} onClick={() => setView('feed')} icon="forum" label="Comunidade" />
            <NavBtn active={view === 'messages'} onClick={() => { setSelectedConvUserId(null); setView('messages'); }} icon="chat" label="Mensagens" badge={messagesUnread} />
            <NavBtn active={view === 'profile'} onClick={() => setView('profile')} icon="account_circle" label="Meu perfil" />
            {user.isAdmin && (
              <NavBtn active={view === 'admin'} onClick={() => setView('admin')} icon="shield_person" label="Verificações" />
            )}
            <button
              onClick={() => setShowAdd(true)}
              className="ml-1 flex items-center gap-1.5 px-3 py-2 bg-secondary-orange hover:brightness-110 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Indicar</span>
            </button>
          </nav>

          <NotificationBell onNavigate={handleNotificationNav} />

          <div className="hidden md:flex items-center gap-2 ml-1 pl-3 border-l border-slate-200">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800 leading-none">{user.name.split(' ')[0]}</p>
              <p className="text-[10px] text-slate-400">{ROLE_LABELS[user.role]}</p>
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
          <button onClick={logout} className="md:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-500" title="Sair">
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
        {view === 'directory' && (
          <DirectoryView
            onOpenEstablishment={openEstablishment}
            refreshKey={refreshKey}
            city={city}
            onChangeCity={changeCity}
          />
        )}
        {view === 'detail' && selectedEstId != null && (
          <EstablishmentDetail
            establishmentId={selectedEstId}
            onBack={() => setView('directory')}
            onShowToast={showToast}
            onOpenConversation={openConversation}
          />
        )}
        {view === 'profile' && (
          <MyProfile onOpenEstablishment={openEstablishment} onShowToast={showToast} onActiveCityChange={applyCity} />
        )}
        {view === 'feed' && (
          <CommunityFeed
            onOpenPost={openPost}
            onShowToast={showToast}
            refreshKey={feedKey}
            city={city}
            onChanged={() => setFeedKey((k) => k + 1)}
          />
        )}
        {view === 'post' && selectedPostId != null && (
          <PostDetail
            postId={selectedPostId}
            onBack={() => setView('feed')}
            onOpenEstablishment={openEstablishment}
            onOpenConversation={openConversation}
            onShowToast={showToast}
            onChanged={() => setFeedKey((k) => k + 1)}
          />
        )}
        {view === 'admin' && user.isAdmin && <AdminVerifications onShowToast={showToast} />}
        {view === 'messages' && (
          <MessagesView
            initialUserId={selectedConvUserId}
            onShowToast={showToast}
            onChanged={loadMessagesUnread}
          />
        )}
      </main>

      {/* Floating "Indicar" action (mobile) */}
      {view === 'directory' && (
        <button
          onClick={() => setShowAdd(true)}
          className="lg:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-secondary-orange text-white shadow-lg flex items-center justify-center active:scale-95 transition"
          title="Indicar estabelecimento"
        >
          <span className="material-symbols-outlined text-[28px]">add</span>
        </button>
      )}

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 flex justify-around items-stretch h-16 pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_3px_rgba(0,0,0,0.04)]">
        <BottomNavBtn active={view === 'directory' || view === 'detail'} onClick={() => setView('directory')} icon="explore" label="Diretório" />
        <BottomNavBtn active={view === 'feed' || view === 'post'} onClick={() => setView('feed')} icon="forum" label="Comunidade" />
        <BottomNavBtn active={view === 'messages'} onClick={() => { setSelectedConvUserId(null); setView('messages'); }} icon="chat" label="Mensagens" badge={messagesUnread} />
        <BottomNavBtn active={view === 'profile'} onClick={() => setView('profile')} icon="account_circle" label="Perfil" />
        {user.isAdmin && (
          <BottomNavBtn active={view === 'admin'} onClick={() => setView('admin')} icon="shield_person" label="Verif." />
        )}
      </nav>

      {showAdd && (
        <AddEstablishmentModal
          city={city}
          onClose={() => setShowAdd(false)}
          onCreated={(e) => {
            setShowAdd(false);
            setRefreshKey((k) => k + 1);
            showToast(`"${e.name}" adicionado ao diretório!`);
            openEstablishment(e.id);
          }}
        />
      )}
    </div>
  );
}

function NavBtn({ active, onClick, icon, label, badge }: { active: boolean; onClick: () => void; icon: string; label: string; badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
        active ? 'bg-indigo-50 text-primary-navy' : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      <span>{label}</span>
      {!!badge && badge > 0 && (
        <span className="min-w-[16px] h-4 px-1 bg-secondary-orange text-white text-[9px] font-bold rounded-full flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}

function BottomNavBtn({
  active,
  onClick,
  icon,
  label,
  accent,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  accent?: boolean;
  badge?: number;
}) {
  const color = accent ? 'text-secondary-orange' : active ? 'text-primary-navy' : 'text-slate-400';
  return (
    <button onClick={onClick} className="flex-1 flex flex-col items-center justify-center gap-0.5 active:bg-slate-50 transition">
      <span className="relative">
        <span
          className={`material-symbols-outlined text-[24px] ${color}`}
          style={accent || active ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {icon}
        </span>
        {!!badge && badge > 0 && (
          <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 bg-secondary-orange text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </span>
      <span className={`text-[10px] font-bold ${color}`}>{label}</span>
    </button>
  );
}
