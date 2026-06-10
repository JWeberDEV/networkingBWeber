import React, { useEffect, useMemo, useState } from 'react';
import { estApi, CITIES, type CategoryCount, type Establishment } from '../api';
import Stars from './Stars';

interface Props {
  onOpenEstablishment: (id: number) => void;
  /** bumped by the parent after a new establishment is created, to force a refresh */
  refreshKey: number;
  city: string;
  onChangeCity: (city: string) => void;
}

export default function DirectoryView({ onOpenEstablishment, refreshKey, city, onChangeCity }: Props) {
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [loading, setLoading] = useState(true);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  // Reset the category filter when the city changes (categories differ per city).
  useEffect(() => {
    setActiveCategory('Todas');
  }, [city]);

  useEffect(() => {
    estApi.categories(city).then((r) => setCategories(r.categories)).catch(() => {});
  }, [refreshKey, city]);

  useEffect(() => {
    setLoading(true);
    estApi
      .list({ q: debounced, category: activeCategory, city })
      .then((r) => setEstablishments(r.establishments))
      .catch(() => setEstablishments([]))
      .finally(() => setLoading(false));
  }, [debounced, activeCategory, refreshKey, city]);

  const totalCount = useMemo(() => categories.reduce((s, c) => s + c.count, 0), [categories]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-navy to-[#0c2459] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-secondary-orange/20 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 pl-3 pr-1.5 py-1 rounded-full text-[11px] font-bold mb-3 relative transition" title="Trocar de cidade">
            <span className="material-symbols-outlined text-[14px]">pin_drop</span>
            <select
              value={city}
              onChange={(e) => onChangeCity(e.target.value)}
              className="appearance-none bg-transparent text-white font-bold text-[11px] pr-4 outline-none cursor-pointer"
            >
              {CITIES.map((c) => (
                <option key={c} value={c} className="text-slate-800">
                  {c}, Paraguai
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined text-[16px] absolute right-1 pointer-events-none">expand_more</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">Indicações de confiança da comunidade</h1>
          <p className="text-indigo-200 text-sm max-w-xl">
            {totalCount} estabelecimentos e serviços indicados por brasileiros que já estão aqui.
          </p>

          {/* Search */}
          <div className="mt-5 relative max-w-xl">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por contador, médico, imobiliária..."
              className="w-full bg-white text-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm outline-none shadow-lg focus:ring-2 focus:ring-secondary-orange"
            />
          </div>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <Chip active={activeCategory === 'Todas'} onClick={() => setActiveCategory('Todas')}>
          Todas
        </Chip>
        {categories.map((c) => (
          <Chip key={c.category} active={activeCategory === c.category} onClick={() => setActiveCategory(c.category)}>
            {c.category} <span className="opacity-60">({c.count})</span>
          </Chip>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Carregando indicações...</div>
      ) : establishments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-slate-300 text-[48px]">storefront</span>
          <p className="text-slate-500 text-sm font-semibold mt-2">Nenhum estabelecimento em {city} ainda.</p>
          <p className="text-slate-400 text-xs mt-1">Que tal ser o primeiro a indicar um aqui?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {establishments.map((e) => (
            <button
              key={e.id}
              onClick={() => onOpenEstablishment(e.id)}
              className="text-left bg-white border border-slate-200 rounded-xl p-5 hover:border-primary-navy/40 hover:shadow-md transition group flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 bg-indigo-50 text-primary-navy text-[10px] font-bold rounded-md">
                  {e.category}
                </span>
                {e.avgRating != null && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Stars value={e.avgRating} size={14} />
                    <span className="text-xs font-bold text-slate-700">{e.avgRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-primary-navy leading-snug mb-1">
                {e.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1">{e.description}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                  {e.neighborhood || e.city}
                </span>
                <span>
                  {e.indicationCount} {e.indicationCount === 1 ? 'indicação' : 'indicações'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition border ${
        active
          ? 'bg-primary-navy text-white border-primary-navy'
          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
      }`}
    >
      {children}
    </button>
  );
}
