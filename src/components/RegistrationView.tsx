import React, { useState } from 'react';
import { ASSETS } from '../data';
import { UserProfile, ViewType } from '../types';

interface RegistrationViewProps {
  onRegister: (profile: UserProfile) => void;
  onSkip: () => void;
}

export default function RegistrationView({ onRegister, onSkip }: RegistrationViewProps) {
  const [country, setCountry] = useState<'Brasil' | 'Paraguai'>('Brasil');
  const [profileType, setProfileType] = useState<'PF' | 'PJ'>('PF');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [doc, setDoc] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Por favor, insira o seu nome completo.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Por favor, insira um e-mail profissional válido.');
      return;
    }
    if (!doc.trim()) {
      setErrorMsg(`Por favor, insira o seu ${profileType === 'PF' ? 'CPF' : 'CNPJ'}.`);
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Por favor, insira o seu telefone.');
      return;
    }
    if (!agreed) {
      setErrorMsg('Você precisa aceitar os Termos de Uso e as Políticas de Privacidade.');
      return;
    }

    setErrorMsg('');
    onRegister({
      name,
      email,
      document: doc,
      phone: `${country === 'Brasil' ? '+55' : '+595'} ${phone}`,
      country,
      profileType
    });
  };

  return (
    <main className="flex flex-col md:flex-row min-h-screen">
      {/* Left Visual Anchor (Split-screen Desktop Layout) */}
      <section className="hidden md:flex md:w-5/12 lg:w-1/2 relative bg-primary-navy p-12 flex-col justify-between overflow-hidden">
        <div className="z-10 mt-6">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Conexão Transfronteiriça
          </h1>
          <p className="text-lg lg:text-xl text-indigo-200 max-w-md leading-relaxed">
            Facilitando parcerias estratégicas e operações comerciais seguras entre Brasil e Paraguai.
          </p>
        </div>
        
        {/* Graphic Element: High quality background image */}
        <div className="absolute inset-0 z-0">
          <img 
            alt="Vista aérea da Ponte da Amizade e região portuária de containers, simbolizando o comércio bilateral" 
            className="w-full h-full object-cover opacity-30" 
            referrerPolicy="no-referrer"
            src={ASSETS.registerCover}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-navy/90 via-primary-navy/40 to-transparent"></div>
        </div>

        <div className="z-10 mt-auto">
          <div className="flex gap-4 items-center">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">handshake</span>
            </div>
            <div>
              <span className="font-semibold text-white block text-sm">Trust &amp; Compliance</span>
              <span className="text-xs text-indigo-200">Rede validada bilateralmente</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Registration Canvas */}
      <section className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-[480px]">
          {/* Header */}
          <header className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Crie sua conta</h2>
            <p className="text-slate-500 font-medium">Junte-se à maior rede de comércio bilateral.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border-l-4 border-secondary-red text-secondary-red text-sm font-medium rounded-r-lg">
                {errorMsg}
              </div>
            )}

            {/* Country Selection (Bilingual Logic) */}
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">País de Origem</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  onClick={() => setCountry('Brasil')}
                  className={`flex items-center justify-center gap-3 p-3.5 border-2 rounded-xl transition-all duration-200 ${
                    country === 'Brasil' 
                      ? 'border-primary-navy bg-indigo-50/20 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={ASSETS.flagBr} alt="Brasil" className="w-6 h-4 object-cover rounded-sm shadow-xs" referrerPolicy="no-referrer" />
                  <span className={`text-sm font-bold ${country === 'Brasil' ? 'text-primary-navy' : 'text-slate-600'}`}>Brasil</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setCountry('Paraguai')}
                  className={`flex items-center justify-center gap-3 p-3.5 border-2 rounded-xl transition-all duration-200 ${
                    country === 'Paraguai' 
                      ? 'border-primary-navy bg-indigo-50/20 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={ASSETS.flagPy} alt="Paraguai" className="w-6 h-4 object-cover rounded-sm shadow-xs" referrerPolicy="no-referrer" />
                  <span className={`text-sm font-bold ${country === 'Paraguai' ? 'text-primary-navy' : 'text-slate-600'}`}>Paraguai</span>
                </button>
              </div>
            </div>

            {/* User Type Selection */}
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Tipo de Perfil</label>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setProfileType('PF');
                    setDoc('');
                  }}
                  className={`px-6 py-2 rounded-full font-semibold text-xs transition-all duration-200 ${
                    profileType === 'PF' 
                      ? 'bg-primary-navy text-white shadow-sm' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Pessoa Física (PF)
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setProfileType('PJ');
                    setDoc('');
                  }}
                  className={`px-6 py-2 rounded-full font-semibold text-xs transition-all duration-200 ${
                    profileType === 'PJ' 
                      ? 'bg-primary-navy text-white shadow-sm' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Pessoa Jurídica (PJ)
                </button>
              </div>
            </div>

            {/* Input Cluster */}
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block tracking-wide uppercase px-1" htmlFor="name">Nome Completo</label>
                <input 
                  id="name"
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-navy focus:border-primary-navy transition-all duration-200 outline-none text-slate-800 text-sm font-medium"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block tracking-wide uppercase px-1" htmlFor="email">E-mail Profissional</label>
                <input 
                  id="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@empresa.com"
                  className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-navy focus:border-primary-navy transition-all duration-200 outline-none text-slate-800 text-sm font-medium"
                />
              </div>

              {/* Document */}
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block tracking-wide uppercase px-1" htmlFor="doc">
                  {profileType === 'PF' ? 'CPF (Brasil / Paraguai)' : 'CNPJ / RUC'}
                </label>
                <input 
                  id="doc"
                  type="text" 
                  value={doc}
                  onChange={(e) => setDoc(e.target.value)}
                  placeholder={profileType === 'PF' ? '000.000.000-00' : '00.000.000/0001-00 ou RUC'}
                  className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-navy focus:border-primary-navy transition-all duration-200 outline-none text-slate-800 text-sm font-medium"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block tracking-wide uppercase px-1" htmlFor="phone">Telefone de Contato</label>
                <div className="flex gap-2">
                  <div className="w-24 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center font-bold text-primary-navy text-sm">
                    {country === 'Brasil' ? '+55' : '+595'}
                  </div>
                  <input 
                    id="phone"
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={country === 'Brasil' ? '(45) 99999-0000' : '981 123456'}
                    className="flex-1 bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-navy focus:border-primary-navy transition-all duration-200 outline-none text-slate-800 text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Terms & Privacy */}
            <div className="flex items-start gap-3 py-1">
              <input 
                id="terms" 
                type="checkbox" 
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-slate-200 text-secondary-orange focus:ring-secondary-orange transition"
              />
              <label className="text-slate-500 text-xs leading-relaxed" htmlFor="terms">
                Ao me cadastrar, concordo com os{' '}
                <a className="text-primary-navy font-bold hover:underline" href="#top">Termos de Uso</a>{' '}
                e as{' '}
                <a className="text-primary-navy font-bold hover:underline" href="#top">Políticas de Privacidade</a>{' '}
                bilaterais.
              </label>
            </div>

            {/* CTA Actions */}
            <div className="pt-4 space-y-4">
              <button 
                type="submit"
                className="w-full bg-secondary-orange hover:bg-secondary-orange/95 text-white font-bold text-sm py-4 rounded-xl shadow-md cursor-pointer hover:shadow-lg hover:brightness-110 active:scale-[0.99] transition-all duration-150 text-center"
              >
                Criar minha conta
              </button>

              <div className="flex items-center justify-center gap-2 text-sm pt-2">
                <span className="text-slate-500">Já possui uma conta?</span>
                <button 
                  type="button" 
                  onClick={onSkip}
                  className="font-bold text-primary-navy hover:underline text-sm focus:outline-none"
                >
                  Fazer login
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
