import React, { useState } from 'react';
import { useAuth } from '../auth';
import { ROLE_LABELS, CITIES, DEFAULT_CITY, type Role } from '../api';

export default function AuthView() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('newcomer');
  const [city, setCity] = useState(DEFAULT_CITY);
  const [neighborhood, setNeighborhood] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ name, email, password, role, city, neighborhood: neighborhood || undefined });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex flex-col md:flex-row min-h-screen">
      {/* Left brand panel */}
      <section className="hidden md:flex md:w-5/12 lg:w-1/2 relative bg-primary-navy p-12 flex-col justify-between overflow-hidden text-white">
        <div className="z-10 mt-6">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-secondary-orange text-[36px]">diversity_3</span>
            <span className="font-extrabold text-lg tracking-tight">Conexão BR-PY</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
            A comunidade brasileira no Paraguai, em um só lugar.
          </h1>
          <p className="text-lg text-indigo-200 max-w-md leading-relaxed">
            Encontre estabelecimentos e serviços de confiança, com indicações de quem já está aqui.
          </p>
        </div>
        <div className="z-10 space-y-3">
          {[
            ['verified_user', 'Indicações de pessoas verificadas'],
            ['storefront', 'Serviços essenciais para quem chega'],
            ['handshake', 'Conexões com intenção de negócio'],
          ].map(([icon, label]) => (
            <div key={label} className="flex items-center gap-3 text-indigo-100">
              <span className="material-symbols-outlined text-secondary-orange">{icon}</span>
              <span className="text-sm font-semibold">{label}</span>
            </div>
          ))}
        </div>
        <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-secondary-orange/20 blur-3xl" />
      </section>

      {/* Right form */}
      <section className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-[440px]">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined text-secondary-orange text-[28px]">diversity_3</span>
            <span className="font-extrabold text-base text-slate-900">Conexão BR-PY</span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-1 tracking-tight">
            {mode === 'login' ? 'Bem-vindo de volta' : 'Criar sua conta'}
          </h2>
          <p className="text-slate-500 font-medium mb-8 text-sm">
            {mode === 'login'
              ? 'Entre para ver as indicações da comunidade.'
              : 'Junte-se aos brasileiros no Paraguai.'}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-secondary-red text-secondary-red text-sm font-medium rounded-r-lg">
                {error}
              </div>
            )}

            {mode === 'register' && (
              <>
                <Field label="Nome completo">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className={inputCls}
                  />
                </Field>

                <div>
                  <label className={labelCls}>Seu momento no Paraguai</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setRole(r)}
                        className={`px-2 py-2.5 rounded-xl text-[11px] font-bold border-2 transition ${
                          role === r
                            ? 'border-primary-navy bg-indigo-50/40 text-primary-navy'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {ROLE_LABELS[r]}
                      </button>
                    ))}
                  </div>
                </div>

                <Field label="Sua cidade no Paraguai">
                  <select value={city} onChange={(e) => setCity(e.target.value)} className={inputCls}>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>

                <Field label={`Bairro em ${city} (opcional)`}>
                  <input
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Ex: Villa Morra"
                    className={inputCls}
                  />
                </Field>
              </>
            )}

            <Field label="E-mail">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className={inputCls}
              />
            </Field>

            <Field label="Senha">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
              />
            </Field>

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-secondary-orange hover:brightness-110 disabled:opacity-60 text-white font-bold text-sm py-3.5 rounded-xl shadow-md active:scale-[0.99] transition cursor-pointer"
            >
              {busy ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 text-sm pt-6">
            <span className="text-slate-500">{mode === 'login' ? 'Ainda não tem conta?' : 'Já tem conta?'}</span>
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="font-bold text-primary-navy hover:underline"
            >
              {mode === 'login' ? 'Cadastre-se' : 'Fazer login'}
            </button>
          </div>

          {mode === 'login' && (
            <p className="mt-6 text-center text-[11px] text-slate-400">
              Demo: <span className="font-semibold">ana@demo.com</span> / <span className="font-semibold">demo1234</span>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

const inputCls =
  'w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-navy focus:border-primary-navy outline-none text-slate-800 text-sm font-medium transition';
const labelCls = 'text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wide px-1';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}
