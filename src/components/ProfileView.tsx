import React, { useState } from 'react';
import { ASSETS, LOGGED_IN_USER } from '../data';

interface ProfileViewProps {
  userProfile: {
    name: string;
    email: string;
    document: string;
    phone: string;
    country: 'Brasil' | 'Paraguai';
    profileType: 'PF' | 'PJ';
  } | null;
  onShowNotification: (message: string) => void;
}

export default function ProfileView({ userProfile, onShowNotification }: ProfileViewProps) {
  const [profileTab, setProfileTab] = useState<'perfil' | 'projetos' | 'documentos' | 'rede'>('perfil');
  const [simulatedEdit, setSimulatedEdit] = useState(false);
  const [editedBio, setEditedBio] = useState(LOGGED_IN_USER.bio);

  // Fallback custom user or simulated logged-in user
  const displayProfile = {
    name: userProfile?.name || LOGGED_IN_USER.name,
    role: LOGGED_IN_USER.role,
    country: userProfile?.country || 'Brasil',
    docValue: userProfile?.document || LOGGED_IN_USER.documentCPF,
    phone: userProfile?.phone || "+55 (45) 99821-4432",
    profileType: userProfile?.profileType || 'PF'
  };

  const handleUpdateBio = (e: React.FormEvent) => {
    e.preventDefault();
    setSimulatedEdit(false);
    onShowNotification("Anotação profissional e biografia salvas com sucesso!");
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* 1. Profiler Heading Cover Banner Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs relative">
        
        {/* Cover Banner with geometric accent */}
        <div className="h-44 w-full bg-gradient-to-r from-primary-navy via-[#0c2459] to-secondary-orange relative">
          <div className="absolute inset-0 bg-black/10"></div>
          {/* Decorative network nodes */}
          <div className="absolute right-6 top-6 opacity-20 text-white text-[72px] font-thin leading-none select-none">
            ⚡
          </div>
        </div>

        {/* Profile Details Overlay Cluster (Screen 5 layout) */}
        <div className="px-6 md:px-8 pb-6 flex flex-col md:flex-row gap-6 relative">
          
          {/* Left Avatar Overlap */}
          <div className="relative -mt-20 shrink-0">
            <img 
              alt={displayProfile.name} 
              className="w-32 h-32 rounded-2xl object-cover bg-white p-1 border-4 border-white shadow-md" 
              src={ASSETS.joaoSilvaProfile}
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white font-bold text-xs" title="Perfil verificado pela receita bilateral">
              ✓
            </span>
          </div>

          {/* Core Info Info Container */}
          <div className="pt-4 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
                {displayProfile.name}
              </h2>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-150">
                <span className="material-symbols-outlined text-[12px] font-bold">verified</span>
                Verificado Oficial
              </span>

              <div className="flex gap-1 items-center ml-1">
                <img 
                  src={ASSETS.flagBr} 
                  alt="BR" 
                  className="w-4 h-2.5 object-cover rounded-xs" 
                  referrerPolicy="no-referrer"
                />
                <img 
                  src={ASSETS.flagPy} 
                  alt="PY" 
                  className="w-4 h-2.5 object-cover rounded-xs" 
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-700">{displayProfile.role}</p>
            
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-400">pin_drop</span>
                Foz do Iguaçu, PR e Ciudad del Este
              </span>
              <span>•</span>
              <span className="text-primary-navy font-bold hover:underline cursor-help">
                512 conexões bilaterais
              </span>
            </div>

            {/* Verification Status Banner tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-extrabold rounded-md flex items-center gap-1 border border-slate-150 leading-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                RFB ATIVO: {LOGGED_IN_USER.documentCNPJ}
              </span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-extrabold rounded-md flex items-center gap-1 border border-slate-150 leading-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                SET PY (RUC): {LOGGED_IN_USER.documentRUC}
              </span>
            </div>
          </div>

          {/* Edit / Quick actions on right */}
          <div className="pt-4 self-start flex gap-2">
            <button 
              onClick={() => setSimulatedEdit(!simulatedEdit)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Editar Perfil</span>
            </button>
            <button 
              onClick={() => {
                onShowNotification("Comprovante de conformidade consolidado baixado!");
                alert("Seu certificado de validação transfronteiriça com carimbo SET PY e RFB foi exportado como PDF.");
              }}
              className="p-2 bg-primary-navy text-white hover:bg-opacity-95 rounded-xl cursor-pointer transition shadow-xs"
              title="Baixar Passaporte Aduaneiro"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
            </button>
          </div>

        </div>

        {/* Tab Selection */}
        <div className="border-t border-slate-200 bg-slate-50 shrink-0 flex overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setProfileTab('perfil')}
            className={`px-6 py-3.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
              profileTab === 'perfil' 
                ? 'border-secondary-orange text-secondary-orange bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sobre meu Perfil
          </button>
          <button 
            onClick={() => setProfileTab('projetos')}
            className={`px-6 py-3.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
              profileTab === 'projetos' 
                ? 'border-secondary-orange text-secondary-orange bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Projetos &amp; Portfólio (3)
          </button>
          <button 
            onClick={() => setProfileTab('documentos')}
            className={`px-6 py-3.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
              profileTab === 'documentos' 
                ? 'border-secondary-orange text-secondary-orange bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Compliance &amp; Documentos (4)
          </button>
          <button 
            onClick={() => setProfileTab('rede')}
            className={`px-6 py-3.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
              profileTab === 'rede' 
                ? 'border-secondary-orange text-secondary-orange bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Rede Conectada
          </button>
        </div>

      </div>

      {/* Main Grid Content Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side Content Area depending on selected tab */}
        <section className="lg:col-span-8 space-y-6">
          
          {/* Tab: Sobre Perfil */}
          {profileTab === 'perfil' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 shadow-xs animate-fadeIn">
              
              {simulatedEdit ? (
                <form onSubmit={handleUpdateBio} className="space-y-4">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wide">Editar Resumo Profissional Bilateral</label>
                  <textarea 
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-primary-navy"
                  ></textarea>
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-secondary-orange text-white text-xs font-bold rounded-lg hover:brightness-105 cursor-pointer">Salvar</button>
                    <button type="button" onClick={() => setSimulatedEdit(false)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 cursor-pointer">Cancelar</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Resumo Profissional</h3>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {editedBio}
                  </p>
                </div>
              )}

              <div className="pt-6 border-t border-slate-100 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Especialidades</h3>
                <div className="flex flex-wrap gap-2">
                  {['Logística Aduaneira', 'Desembaraço de Cargas', 'Análise de NCM', 'Regime de Importação Temporária', 'Consultoria Empresarial', 'Mercosul Compliance'].map(spec => (
                    <span key={spec} className="px-3 py-1.5 bg-slate-100 text-slate-600 font-bold rounded-lg text-xs">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verified Badge Details */}
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 flex gap-3">
                <span className="material-symbols-outlined text-primary-navy text-[24px]">workspace_premium</span>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs block">Certificado de Idoneidade Fiscal</h4>
                  <p className="text-slate-500 text-xs mt-1 leading-normal">
                    Este perfil comprovou idoneidade perante a Receita Federal do Brasil (RFB) e Secretaria de Estado de Tributación do Paraguai (SET PY).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Projetos Portfólio (Screen 5 layout) */}
          {profileTab === 'projetos' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Main big Success card */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-350 transition duration-200 shadow-xs">
                <div className="h-44 w-full relative">
                  <img src={ASSETS.successCaseBig} alt="Containers em área portuária aduaneira" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                  <span className="absolute bottom-4 left-4 text-white font-extrabold text-shadow-md text-xs bg-secondary-orange px-2.5 py-1 rounded-md">
                    CASO DE SUCESSO DESTAQUE
                  </span>
                </div>
                <div className="p-6 space-y-3">
                  <h4 className="font-extrabold text-base text-slate-900 leading-tight">Otimização de Fluxo Logístico de Entrada - Região Sul / Portos de Paranaguá</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Facilitação alfandegária e rota rápida de escoamento de grãos e bens estruturados. Redução do tempo de despacho aduaneiro de 3 dias para menos de 6 horas através do novo protocolo de pré-envio binacional.
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>Parceria: Cooperativa do Iguaçu</span>
                    <span className="text-primary-navy font-bold">Retorno de investimento de 14%</span>
                  </div>
                </div>
              </div>

              {/* Smaller grids bottom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Project 1 */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-100 transition duration-200 p-4 space-y-3 shadow-xs">
                  <img src={ASSETS.projectAgroSmall} alt="Agro expansão" className="w-full h-28 object-cover rounded-lg" referrerPolicy="no-referrer" />
                  <h5 className="font-extrabold text-xs text-slate-900">Expansão de Mercado Territorial Agro</h5>
                  <p className="text-[11px] text-slate-500 leading-relaxed max-md:hidden">
                    Auxílio estratégico regulatório e assessoria na junta comercial de Asunción para abertura produtiva de filial.
                  </p>
                  <span className="inline-block bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-md">
                    Departamento Central, PY
                  </span>
                </div>

                {/* Project 2 */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-100 transition duration-200 p-4 space-y-3 shadow-xs">
                  <img src={ASSETS.projectTributacaoTablet} alt="Tributação aduaneira" className="w-full h-28 object-cover rounded-lg" referrerPolicy="no-referrer" />
                  <h5 className="font-extrabold text-xs text-slate-900">Análise de Isenção de Tributação de Insumos</h5>
                  <p className="text-[11px] text-slate-500 leading-relaxed max-md:hidden">
                    Delineamento operacional para importação temporária legal de fertilizantes biológicos com isenção cambial.
                  </p>
                  <span className="inline-block bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-md">
                    Regime Ad Valorem, BR/PY
                  </span>
                </div>

              </div>

            </div>
          )}

          {/* Tab: Documentos */}
          {profileTab === 'documentos' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs animate-fadeIn">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase">Certidões e Comprovantes de Idoneidade</h3>
              
              <div className="space-y-3 pt-2">
                {[
                  { name: 'Certidão Negativa de Débitos Tributários (Receita Federal)', desc: 'Validação eletrônica de imposto sobre circulação.', date: 'Atualizado em: Mai 2026', code: 'RFB-9844-00-Z' },
                  { name: 'Certificado de Existência e Registro SET Paraguai', desc: 'Confirmando cadastro fiscal de união sob número RUC.', date: 'Atualizado em: Abr 2026', code: 'SET-PY-22-98' },
                  { name: 'Cédula de Identidad de Fronteriza Comercial', desc: 'Permisso de permanência e contratações transfronteiriças sólidas.', date: 'Válido até: Dez 2028', code: 'CIF-981-BR-PY' }
                ].map((doc, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 flex justify-between items-center transition">
                    <div className="flex gap-3 items-start min-w-0">
                      <span className="material-symbols-outlined text-primary-navy text-[24px] mt-0.5">verified_user</span>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-slate-800 block truncate">{doc.name}</span>
                        <span className="text-[10px] text-slate-400 block truncate mt-0.5">{doc.desc}</span>
                        <span className="text-[9px] text-slate-500 block font-semibold mt-1">{doc.date} • Cód: {doc.code}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        onShowNotification(`Exportando certidão: ${doc.name}`);
                        alert(`Download concluído para ${doc.name}`);
                      }}
                      className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Rede */}
          {profileTab === 'rede' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 animate-fadeIn">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase">Contatos Mais Próximos</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  { name: 'Dra. Beatriz Almeida', role: 'Direito Aduaneiro', desc: 'Parceiro corporativo frequente', avatar: ASSETS.beatrizAlmeida },
                  { name: 'Carlos Mendez', role: 'Diretor de Logística', desc: 'Parceiro em rotas transnacionais', avatar: ASSETS.carlosMendez },
                  { name: 'Elena Ramirez', role: 'Consultora Tributária', desc: 'Assessora em Ciudad del Este', avatar: ASSETS.elenaRamirez },
                  { name: 'Joaquim de Almeida', role: 'Gestor AgroFronteira', desc: 'Parceiro de canais de captação', avatar: ASSETS.joaquimAlmeida }
                ].map((friend, idx) => (
                  <div key={idx} className="p-3.5 border border-slate-150 rounded-xl flex gap-3 hover:bg-slate-50 transition">
                    <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0" referrerPolicy="no-referrer" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{friend.name}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{friend.role}</p>
                      <p className="text-[9px] text-secondary-orange font-semibold block mt-1">{friend.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </section>

        {/* Right Side Sidebar panel widget (Screen 5 right panel verification flow) */}
        <section className="lg:col-span-4 space-y-6">
          
          {/* Validation Checklist Panel widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2">Validação de Documentação</h4>
            
            <div className="space-y-3.5">
              {[
                { name: 'Cédula de Identidad / RG', sub: 'Confirmado por receita federal', status: 'Verificado', primary: true },
                { name: 'Residência Comercial Foz', sub: 'Comprovante de endereço fiscal', status: 'Verificado', primary: true },
                { name: 'CPF / CNPJ Ativo RFB', sub: 'Receita Federal do Brasil', status: 'Verificado', primary: true },
                { name: 'RUC Activo SET PY', sub: 'Subsecretaria Tributação PY', status: 'Verificado', primary: true },
                { name: 'Certidão Fitossanitária Sec.', sub: 'Validade portuária Paranaguá', status: 'Expirando', primary: false }
              ].map((doc, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-semibold">
                  <div>
                    <span className="text-slate-800 block text-xs">{doc.name}</span>
                    <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">{doc.sub}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    doc.primary 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-red-50 text-secondary-red animate-pulse'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button 
                onClick={() => {
                  onShowNotification("Consolidação requisitada! Enviando token de compliance.");
                  alert("Solicitação enviada. Você receberá uma notificação quando os novos laudos forem homologados.");
                }}
                className="w-full py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer transition text-center"
              >
                Reenviar Laudos para Validação
              </button>
            </div>
          </div>

          {/* Itaipu Opportunities Advertisement banner widget */}
          <div className="bg-indigo-950 text-white rounded-xl overflow-hidden shadow-md relative group">
            <img 
              src={ASSETS.opportunitiesItaipuCover} 
              alt="Itaipu Binacional" 
              className="w-full h-32 object-cover opacity-30 group-hover:scale-105 transition duration-300" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            <div className="p-4 relative -mt-16 space-y-2">
              <span className="inline-block bg-[#002f6c] text-[#00eb82] text-[9px] px-2 py-0.5 rounded-full font-bold">
                EDITAL BINACIONAL ITAIPU
              </span>
              <h5 className="font-extrabold text-xs text-white leading-tight">Porto Seco de Ciudad del Este</h5>
              <p className="text-[10px] text-slate-300">Subsídios públicos para startups de tecnologia alfandegária inteligente.</p>
              <button 
                onClick={() => onShowNotification("Carregando chamamento público de Itaipu...")}
                className="text-[10px] text-[#00eb82] font-semibold hover:underline block"
              >
                Ler edital público de Itaipu →
              </button>
            </div>
          </div>

        </section>

      </div>

    </div>
  );
}
