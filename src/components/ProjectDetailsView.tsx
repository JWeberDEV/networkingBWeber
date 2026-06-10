import React, { useState } from 'react';
import { OpportunityProject } from '../types';
import { ASSETS, DEFAULT_OPPORTUNITIES, OTHER_OPPORTUNITIES } from '../data';

interface ProjectDetailsViewProps {
  onShowNotification: (message: string) => void;
  onNavigateToView: (view: 'cadastro' | 'mercado' | 'mensagens' | 'projetos' | 'perfil') => void;
  onOpenDirectChat: (contactName: string) => void;
}

export default function ProjectDetailsView({
  onShowNotification,
  onNavigateToView,
  onOpenDirectChat
}: ProjectDetailsViewProps) {
  const project = DEFAULT_OPPORTUNITIES[0];
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'completed'>('idle');
  const [whatsappModal, setWhatsappModal] = useState(false);
  const [whatsappProposalText, setWhatsappProposalText] = useState('Prezado Joaquim, temos interesse no edital de Irrigação Inteligente.');
  
  // Secondary Directory State
  const [selectedSector, setSelectedSector] = useState('Todos os Setores');
  const [selectedType, setSelectedType] = useState('Todos');
  const [projectSearch, setProjectSearch] = useState('');

  const handleDownloadEdital = () => {
    setDownloadState('downloading');
    onShowNotification("Iniciando download seguro do Edital de Irrigação Inteligente...");
    setTimeout(() => {
      setDownloadState('completed');
      onShowNotification("Edital completo (Edital_Irrigacao_BR_PY.pdf) baixado com sucesso!");
    }, 2000);
  };

  const handleSendWhatsapp = (e: React.FormEvent) => {
    e.preventDefault();
    setWhatsappModal(false);
    onShowNotification(`Proposta enviada com sucesso para Joaquim de Almeida no WhatsApp!`);
  };

  // Filter logic for other opportunities
  const filteredOtherOpps = OTHER_OPPORTUNITIES.filter(opp => {
    const matchesSector = selectedSector === 'Todos os Setores' || opp.sector === selectedSector;
    const matchesType = selectedType === 'Todos' || opp.type === selectedType;
    const matchesSearch = projectSearch === '' || 
      opp.title.toLowerCase().includes(projectSearch.toLowerCase()) || 
      opp.description.toLowerCase().includes(projectSearch.toLowerCase()) ||
      opp.location.toLowerCase().includes(projectSearch.toLowerCase());
    return matchesSector && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      
      {/* 1. Header Navigation Context bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl">
        <button 
          onClick={() => onNavigateToView('mercado')}
          className="flex items-center gap-2 text-slate-600 hover:text-primary-navy text-sm font-semibold border border-slate-200 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Voltar ao Mercado</span>
        </button>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Oportunidades</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>Código do Edital: PY-BR-2026-0421</span>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Professional Dossier Description */}
        <section className="lg:col-span-8 space-y-6">
          
          {/* Main Title Badge Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-4 shadow-xs">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-amber-50 text-secondary-orange text-xs rounded-lg font-bold">
                {project.sector}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                {project.location}
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-lg font-bold flex items-center gap-1 leading-none">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Verificado Bilateral
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {project.title}
            </h1>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Orçamento Estimado</p>
                <p className="text-sm font-extrabold text-primary-navy mt-1">R$ 450.000</p>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">~ ₲ 645M PYG</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Prazo Restante</p>
                <p className="text-sm font-extrabold text-secondary-red mt-1">{project.daysRemaining} dias</p>
                <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">Encerra em Nov 2026</span>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tipo de Contrato</p>
                <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-indigo-50 text-primary-navy text-[10px] font-bold rounded-md">
                  {project.contractType}
                </span>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Fase do Projeto</p>
                <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-amber-50 text-secondary-orange text-[10px] font-bold rounded-md">
                  {project.projectPhase}
                </span>
              </div>
            </div>
          </div>

          {/* Details Overview Parameters */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wide">
              Parâmetros e Escopo Geográfico
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-700">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400">Duração do Acordo:</span>
                <span className="font-bold text-slate-800">{project.estimatedDuration}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400">Abrangência Territorial:</span>
                <span className="font-bold text-slate-800 text-right">{project.geographicScope}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400">Modalidade de Pagamento:</span>
                <span className="font-bold text-slate-800">{project.paymentType}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400">Idiomas Oficiais Exigidos:</span>
                <span className="font-bold text-slate-800">{project.languages.join(' / ')}</span>
              </div>
            </div>
          </div>

          {/* Description Text */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-4 shadow-xs">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-3">Descrição do Projeto</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{project.description}</p>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-3">Escopo Técnico e Tecnológico</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{project.technicalDescription}</p>
            </div>
          </div>

          {/* Eligibility Requirements Details Checklist (Highly tailored) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-4 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3">
              Requisitos e Critérios de Elegibilidade
            </h3>
            
            <ul className="space-y-3.5 pt-2">
              {project.requirements.map((req, idx) => (
                <li key={idx} className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                  </div>
                  <span className="text-slate-700 text-xs md:text-sm font-medium leading-relaxed">{req}</span>
                </li>
              ))}
            </ul>
          </div>

        </section>

        {/* Right Side Sticky Utilities */}
        <section className="lg:col-span-4 space-y-6">
          
          {/* Action Hub CTA Card */}
          <div className="bg-white border border-primary-navy/15 rounded-xl p-5 shadow-xs bg-gradient-to-br from-white to-slate-50">
            <h4 className="text-xs font-extrabold text-primary-navy uppercase tracking-wider mb-4">Ação e Propostas</h4>
            
            <div className="space-y-3">
              <button 
                onClick={() => setWhatsappModal(true)}
                className="w-full py-3.5 bg-[#25D366] hover:bg-[#25D366]/90 text-white font-bold text-xs rounded-xl shadow-xs transition hover:brightness-105 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                Enviar Proposta WhatsApp
              </button>

              <button 
                onClick={handleDownloadEdital}
                disabled={downloadState === 'downloading'}
                className={`w-full py-3.5 border transition font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer ${
                  downloadState === 'downloading'
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                    : 'bg-white border-primary-navy text-primary-navy hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {downloadState === 'completed' ? 'check_circle' : 'download'}
                </span>
                {downloadState === 'downloading' ? 'Baixando...' : downloadState === 'completed' ? 'Edital Baixado' : 'Baixar Edital Completo'}
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 mt-4 leading-normal text-center">
              A submissão pelo WhatsApp abre canal seguro com os termos fiscais de licitação da Cooperativa.
            </p>
          </div>

          {/* Author Card Profile Details */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Autor do Edital</h4>
            
            <div className="flex gap-3">
              <img 
                alt={project.authorName} 
                className="w-12 h-12 rounded-xl object-cover border border-slate-100" 
                src={project.authorAvatar}
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <span className="font-extrabold text-xs text-slate-900 block truncate">{project.authorName}</span>
                <span className="text-[10px] text-slate-500 block truncate mt-0.5">{project.authorRole}</span>
                <span className="inline-block bg-indigo-50 text-primary-navy text-[8px] px-1.5 py-0.5 rounded-md font-bold mt-1 uppercase tracking-wide">
                  Verificado BR/PY
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Retorno Médio</span>
                <span className="text-xs font-bold text-slate-800 block mt-0.5">&lt; 1 hora</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Projetos Ativos</span>
                <span className="text-xs font-bold text-slate-800 block mt-0.5">3 bilaterais</span>
              </div>
            </div>

            <button 
              onClick={() => onOpenDirectChat("Cooperativa Agro Industrial")}
              className="w-full py-2.5 bg-primary-navy text-white hover:bg-opacity-95 font-bold text-xs rounded-xl shadow-xs cursor-pointer transition text-center"
            >
              Iniciar Chat Técnico
            </button>
          </div>

          {/* Localização Física e Map Simulation Widget (highly authentic Google-style) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5 shadow-xs">
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Localização Física</h4>
            <div className="relative h-44 rounded-xl border border-slate-150 overflow-hidden bg-slate-100">
              <img 
                alt="Mapa demonstrando a localização rural binacional próxima a Foz do Iguaçu e Ciudad del Este" 
                className="w-full h-full object-cover grayscale opacity-90" 
                src={ASSETS.projectMap}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-indigo-900/10 hover:bg-transparent transition duration-200"></div>
              
              {/* Compass Controls Widget */}
              <div className="absolute right-2.5 bottom-2.5 flex flex-col bg-white border border-slate-200 rounded-lg shadow-sm">
                <button 
                  onClick={() => onShowNotification("Simulando zoom in no mapa...")}
                  className="w-7 h-7 flex items-center justify-center border-b border-slate-200 text-slate-600 font-bold hover:bg-slate-50 focus:outline-none"
                >
                  +
                </button>
                <button 
                  onClick={() => onShowNotification("Simulando zoom out no mapa...")}
                  className="w-7 h-7 flex items-center justify-center text-slate-600 font-bold hover:bg-slate-50 focus:outline-none"
                >
                  -
                </button>
              </div>

              {/* Marker pin */}
              <div className="absolute left-[45%] top-[40%] text-secondary-red animate-bounce">
                <span className="material-symbols-outlined text-[28px] drop-shadow-md">location_on</span>
              </div>
            </div>
            <div className="flex gap-2 text-[11px] font-medium text-slate-500">
              <span className="material-symbols-outlined text-[16px]">map</span>
              <span>Região Rural Fronteira BR-PY (Cataratas Zona Norte)</span>
            </div>
          </div>

        </section>
      </div>

      {/* 4. Integrated Projects & Opportunities Directory (Search and filter panel) */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-xs">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Painel de Oportunidades &amp; Editais Ativos</h2>
          <p className="text-slate-500 text-xs font-semibold">Consulte editais de cooperação ou publique os seus para receber propostas.</p>
        </div>

        {/* Filters Group */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Sector filter */}
            <select 
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-navy"
            >
              <option value="Todos os Setores">Todos os Setores</option>
              <option value="Agronegócio">Agronegócio</option>
              <option value="Logística">Logística</option>
              <option value="Exportação">Exportação</option>
              <option value="Tecnologia">Tecnologia</option>
              <option value="Comércio">Comércio</option>
            </select>

            {/* Type Filter */}
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-navy"
            >
              <option value="Todos">Todos os Contratos</option>
              <option value="Freelance">Freelance</option>
              <option value="Parceria">Parceria</option>
              <option value="CLT">CLT</option>
            </select>
          </div>

          {/* Directory Search */}
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input 
              type="text"
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-none outline-none focus:bg-white focus:ring-1 focus:ring-primary-navy"
              placeholder="Pesquisar por editais..."
            />
          </div>
        </div>

        {/* Directory Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOtherOpps.map((opp) => (
            <div 
              key={opp.id} 
              className="p-4 border border-slate-150 hover:border-indigo-200 hover:bg-slate-50/20 rounded-xl space-y-3 transition group cursor-pointer"
              onClick={() => {
                onShowNotification(`Abrindo edital: ${opp.title}`);
                alert(`Este é um edital de oportunidade corporativa: ${opp.title}. Você pode submeter propostas diretamente pelo chat com os assessores técnicos.`);
              }}
            >
              <div className="flex justify-between items-start gap-2">
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-md text-[9px]">
                  {opp.sector}
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">{opp.type}</span>
              </div>

              <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-primary-navy truncate">
                {opp.title}
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {opp.description}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">pin_drop</span>
                  {opp.location}
                </span>
                <span className="text-primary-navy font-extrabold">
                  {opp.budgetVal} <span className="text-[8px] text-slate-400 font-semibold">({opp.budgetType})</span>
                </span>
              </div>
            </div>
          ))}

          {filteredOtherOpps.length === 0 && (
            <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center py-8">
              <span className="material-symbols-outlined text-slate-300 text-[36px] mb-1">find_in_page</span>
              <p className="text-slate-400 text-xs italic">Nenhum edital corresponde aos termos de filtros selecionados.</p>
            </div>
          )}
        </div>
      </section>

      {/* WhatsApp proposal interactive modal */}
      {whatsappModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 animate-scaleUp">
            
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-primary-navy to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#25D366] text-[24px]">chat_bubble</span>
                <div>
                  <h4 className="font-extrabold text-sm block">Submissão Bilateral WhatsApp</h4>
                  <p className="text-[9px] text-slate-300">Conectado sob API Conexão Transfronteiriça</p>
                </div>
              </div>
              <button 
                onClick={() => setWhatsappModal(false)}
                className="text-white hover:text-slate-300 font-extrabold text-sm focus:outline-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendWhatsapp} className="p-5 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Seu contato profissional (BR/PY) foi previamente validado. Insira a proposta inicial que será remetida ao consultor Joaquim de Almeida.
              </p>

              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block mb-1">Destinatário</label>
                <div className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <img src={ASSETS.joaquimAlmeida} alt="Joaquim" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">Joaquim de Almeida</span>
                    <span className="text-[9px] text-slate-400">+595 981 *** 421</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block mb-1">Texto de Mensagem</label>
                <textarea 
                  value={whatsappProposalText}
                  onChange={(e) => setWhatsappProposalText(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl p-3 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-primary-navy"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-[#25D366] hover:bg-[#25D366]/90 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition text-center"
              >
                Confirmar e Abrir no WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
