import { Post, ChatThread, NetworkRequest, OpportunityProject } from './types';

export const ASSETS = {
  flagBr: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3Eqf4h5FLHi4OECS2RIRKVdXgWknm_CHC7Fs7kzt7tvADU_BOYExbjdhYDT_zOgWBFASXAxmxw4fWx7Q8ElpaXzfwEIfhwCQHWQg50JoMzjAQKbL7nX03KsfvHtR7Cie7YdXrFGlBbydDtnWRvG_-HdbxTs36jUUF0QIcHm76a4eN52cUnkq_oE1tthrjWlDDaBJc03dbmEeeaNsKczYRA9iMlTKAdhcCFQ0I5itWPjrzHreR0h25j_l0iKUZxI5taA_sL2hugXU",
  flagPy: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgJpB8l7YrNzx8B0I1v3jnexvpGu2zygvuZFUtmbaVuCoYsQw7odKWvQGYgexi0Q-_oBwwwtXQ38SsS0KCkn2A3ecBn5E_t9wwy841-es0ZHG5vsuC-orWJONb5XuGz2p5op7w15QhQiheKhCdo5aSuqnOw70hc5YssLyTHyshwDYT4-pM5Bk1emIiDZBWZQyCR7qWzWZVU3bmbYQY6Mzfkz94UOY64DHv3G3cn7RolVJFTcNlcNFaMa3g_9_-rNqQXehzkANLGW4",
  registerCover: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQEt6G1EXC6X6XMLL6BweS_IMRnQxf9wgMo4I2VTfmo0o8xNTmMzU37Hrn-jEoetIS-MchLfoUtk56dzrX0ujjTMucbFap67IDArr4fPwrzCtmoON211gfSoypXSRgyCogSYqiJGsyZbt0eqONolXwQh43fN4XMfmsBWzZ9D5JBHhNpBQj7q2518bR1K55FrkQ-VtSVfHl3GWed8H9-RAvx-IxTnVucKQknnXfz3C_hTF6eEUbNSwW5bM73AZlvCwrFcul9e8dLeU",
  userHeaderProfile: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-IS9CGwG8fBVj_OJ37Mj6ehb5EP69vTKSETuaf8TNQKPkefLj9rF-3rUQN0V1hLeUY4RHoOMRdSgs0q0WRfmdiDOKvBvG8GS0RIkoEx8mniimTOcGo9tV9-yvGdievwPOBU6AvsQiS9oQvQwRgp1lLrjriPZtbh7yjFXP4oDgZIS312pRZsTFjUt6ymXiidZToX2dIwX7AW7kRieOdvG4cI2enfOBBVte0J3qndiMjxchByZpGVUOycpYqYIcU3Az-xTp0eyOFDY",
  joaoSilvaProfile: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmCHV8uXKMPkoJFys1qMQ1zBUmm-dA9_IqIf_iXrmN-dl_PaRxShEhAmmBfhJQsaDbQV4L8prJzaYX8vQNmKhGUKoLpqlHif9vOTrIGQT7_IBN9qtRXBjP-XvS7hxBMjsR8Hw67Psej6qW7tB5tTYxMrngVF5Y8p26Y43R1uvembozPZNUuAws5JGnFmAZovOBI0RbUW45KiMOee_7sK53Ak8vVR5zGmrsdDnTc6ncG4YdH3G1ix8Cu31quFKLUW8DSeHTwORf8yQ",
  joaoSilvaSmall: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsGJvGvH2vxjfNhmrx4FWW85VtFSjAE1FSmFXtMV8uqumOhKhF1myT-mNfc3CSmUEPXbVoww-bM78IYT5HKjyaAEuY-8zSmEekDxYaxH-IbbQKPYXHQYl1hJBbgEWvPZYnItoHbdwYPUzIW85FU0RWeFyuZIbe-cJ7xNystWT7cvi5kZNtA1dDUMcSUXVRvO8elBIRDQU4WpqJ9p1CNJpb86f1hfRnNvAINcYdJ-DHjzGJNB8HK5YbiDza6CeOl8h6BPSKBGsbFOo",
  carlosMendez: "https://lh3.googleusercontent.com/aida-public/AB6AXuBo-rRJ1-edAfRg8qcCQXZRXEhQJTDfJADIJ5QDoS7Pg5dl1uY5tUHJkznBiLRN53UW82kNQVx9yK4w8YBW_Xw6LRiTuiQlxsdNFp13qb7IfHYRBAFckMcyPlQA5W5_pJ6nG4xkU5x41h25B6r28shEddH2uyZuXSbxzk4PtyI7nzHo1m7goaPYtAaIUZzuVzhKANVUCfT0FD1vQ9ZRdTS-Hi02quTCAYkxrvUTOy6rT7CC32iDrFk-vrGXAoabxrEXIXqryOU2nE4",
  logisticsHub: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqiGP7HNkrf2_AVYvVwjjhSHWa6_Bufjaiti9pHdx3rSikWT6BqqRGLUpWIhWyjkRKpuNfOpcpUN6jwxGn1IUmPAZ5raM7tYZJj88TRrjN--VhWWAMcudq_-a2BUadAYX2CH4ER9Ew4tlODIm3VX4gWaapxNFDWaUVVhmdPBQt3CUkhm8NyN_CVXApvIfuxhV-lToUUjaBw5V3h5Vq7_f-J8CAWsHt630_fyFud9_bneNgg-qJu2asbo2s0e_PzP1ZMFkRu3ctPME",
  beatrizAlmeida: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8oikYECLkX9OpudYEnrgbZYNSbcO3ZM9CO3WosYSwuLKzu_9q75NzQ3bsSsr3MroF9fEhcrVBrmvObcDAgIfz57aEKv3f2CxdbTQFQvw1vhvf4O96ZySX4RUvFkNJMLBhqoFLvulcx5BiYzM3jVM6GI6n_DWOdJfCpGIIm1BBiSE4W1TlNC1Wugcg-0eM4AAjVNZjwsYfWSgIY7vxvyfviIshwTCdQ4arLN28A0lM2CPvDjhp0f-zHLtaxQgcf2cIycS4Zrig-3c",
  ricardoGomez: "https://lh3.googleusercontent.com/aida-public/AB6AXuD6DawflYKxwQrlSR9oE55xgta-hfzDMOZt_KrHBUasqffNuoasTxxHlRmzMLd1zZquJhVj4NF7LSOzyBK-EozN9kVu_Lhi-nEMg93d1BB3uO72exq-kUoUVd_4vNd4IwadNx0kBjDIo3t5ZxULBGEcwoDMY5FkLlRCPhAejQOhPJTk0NwlcrvYTHSkTYxgSVv88Q4wNG0GQfaU3h4hzyKEjaoBT1KUGcdQyyHtWhtfFRCWAFDcdSBCO4VmioDUgQ-Ygvn1aOs4pUw",
  marianaCosta: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbqmKVfom0gU3ho5K3DsYxP6SYlaYLtCwb_JsbdwHE43lOwWKt8a8Yn-XT3y5b0wPArdnxTO0iJglBEHeK0Lt53VxeUfudqIiDsBLUxls3uwrArlilrmJEJLGPSeMF2K4yUKOw36NMDcqUUxCqaTyspMsH_pbPgeXkSvIh7u56rfnFNH7wED84sFcT-LuAdODkW3fI15t_yzeZD2g8D7gNm7wwJdrlEqX1-Z0ezDrTltp3zT1_LaYeBNNGh4FesY-aXEmpTEdrcu4",
  elenaRamirez: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfXvND_uqCU-5u0Z7QjW3nfGsinJTIo3uSAgWF8HUIQOmgtQ6qDoLg6Y3gK_8D3ra1xbtBEMcVpcA_j0xq2W2Bj7WjaKPmeUyLNWde5NNC4ErKWE0ax6lZmjkowT46bAK8WgKsPmXnxfl7PYwm_Q3uf2NfgKcB7gr1beryhoWaaubG_xAVvey5LADzqiUrXztist14atyV-_fHI6P1jrLmGKx8IVaNnvO65oMK6PAAdVBhSBYoK9hBLx_TFpKCyASM9a0hbAdFgRc",
  cooperativaRep: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFq4fYH77_ByRZVneHwbI8LDh8t59oRny_9KbpUTMBg-Xc586K1CBj67yo8KT9kdmOdhecSYE9Z-yqG41FYvzmYfqoCziXq40JcIguqQan8Wf4XZ0kkoo68Bcy26g-cj_F-iBh_ZkpMEdUVPbdNgmLA9F_-5Nm2Hy5v0d01V6GvtJ3X99ZlAMWHIdOzw1dILleYMpEmnIiPG5ARPGwIXAwnPdz8VBoGAhgpm6unesM9JVxgN2qnUg4Fl-Snxee5IMbhBtI36mDzX4",
  cooperativaChat: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8oA4z2l6h9Tf7tsQadG5Z7uVfae-XS1SZYNigviGqRE-XY_WStvdBfPuuac1yW3SeOT68xzS8sWk4N1iXo-sxl1oqf-m2_Uy8MDsIsgKdneTwpKu668FMxWXGknsOyZyi-zfnFPGyG9Hs2hZ1P_FXz0-3sYNNEt5R4Ks5-U-5hunjmbsy8R1j-gXgBAiqB2oK6tYeHqcjksyHWwDcXPAdK9FmlDevsaKf0dRlkizCvRpqSTmdsJtkaBgcSLMbpOjsDl2cLeCo4I0",
  projectMap: "https://lh3.googleusercontent.com/aida-public/AB6AXuBd9UsT4Uu2OGKWXY8MibG2B42s9_KvojbXEuHMxu9_5SdyYk-kYa8Lmx3QXaQgq9xZg66ZCbX9eHxC54xhncWn23-HNTz6q67q5hZIroYTZF7bXah3E3Fx6meHYJDvcqdjE6L97O8ymBSJW10AgudEoloE7xVMJa4fCF_6mLtCG_gdDo1om3eG0pQaUjQGjSktVbK-gjLeSVLKtkeEL1tquTQnfazJpJB7MJwWbMS1rlQyFKjNFbPcCuHpWtnHnqTkSi_FGG_PVME",
  joaquimAlmeida: "https://lh3.googleusercontent.com/aida-public/AB6AXuCEE9TE11p-EJo_n8fsvw6QX9heWfNvJbraUM0INYkWuTbHkFncPFUObvhYCNcB07aKAUTT2ql9cARyG001omr_VW-Yv-VddioB-APvsrMFG8o4jm7aGP9djpuBfgHSsOH4M3VCY8PvPDwsvYaYufgO7zcoqZd5nPO-m92ypeg6NLdsavdqWW1hAYKjJfWb0l7QshRzRnrX0tpGwJ9PW8e-Hrg6Ti_q5Wd8QZwwqdVPsqvPypGvlHomymqPTfgv6vAlOw34qa9AKCU",
  mariaGonzalez: "https://lh3.googleusercontent.com/aida-public/AB6AXuAp88Em04TxuQ8jc-DU0-yPeu39NbcNJvwPjCiMuN8Gu6o4W-UGPXjbHA-PwKEQwNj17Bx84MEzG2aKeWvoiTy-X5bbe0bulytUbT2UYjQ8gwy4I6va-yvPbPMDOQlqvjQgMYeZtd1nbXdPbyfbMed0Hxh5klVehG9gSmVVN_KFx7fzwoOA9PpJ8SQVjT4B3fXjPZ5AFMvTGHqIAoKBjVoLy6gzi7MwkFRs0uWE3NmiWmRcny0xsPqDP5jt7W46LNlaRfgIGwOxqX4",
  successCaseBig: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdbh3g6kNc2NCh93qKDbRUHb8lBgKoOpf7-fDLqi4zGLmEge7A0BmiGBlvfR_BFQ8XEUkqHy6OoYvGrEiN8xt3SKjAwB1fLMlxKOor7uGqb4AsZaI62bWoVqbs9Q621yCOCgJ61XGgSUWMCc49rZDMtmdECWR8gPpPrQZnIMqrNE9Dx6TDKykGdB3R3fcKNH9StNq2hPB47SK1zu2qKMgGi4N65VDOLmq9g-9vUp_-lOH4nne6yFPp8K52zs8TIRkDXU0R8tFEkeQ",
  projectAgroSmall: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkYt5M5pAZdokVZgs_cREJSBA0S0-Z7h69bA0pq9H-ZOrI0kdfr-wYY8kNOIsDeUYvT6ZHfCGC5CE5foFCX0CmQ4AA4bJXs94F-_Yb_-qV15qmKQCWag_cX-R0hwH6jD7utO9_10oGrqammGc6larlIAF1Gs224_ZweLRRqM_vCjG_rH84WMzmtf9_ZkjtEfobLHuu1gG2FVy7aBecoKqayWfrOSOLOJoQDKAJHq-uYSeJLtz4Gpg9TiWttX5051oHOGIY5k_XQ_g",
  projectTributacaoTablet: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3vcQ_bcncRNFJCZVQgOd4mMIhb6vIQFWT6eeOsbdxyBslRJN6zJIWMVQc08bkenczXAewQ2G63h6TAWhu0LZhzYbM51WDOwJov8k7o-GqJ2u38I7SQgstKIhvQ3E9I6KMYtW6n7x3WneMCdWA6yOvGy-xzq5ndC9xHYI1hahNaJbrXLuESGMY4JN9juiWrTaeJyIxHiy7TEneqYy3uGs1CCRLhVAv5XxErZ5Kf7NFcL9ITXywHJYQBoXn_58qUsfbyCygXMM6NV0",
  opportunitiesItaipuCover: "https://lh3.googleusercontent.com/aida-public/AB6AXuANOxch0HUfBIf4Ac6xGKq-DJghfdL8CqMiHSb6dhsERHrUo3ekZGlpAv1nlEUp7h6XBIyvcwl322Vhy9ntprzZAGpj4RdslY2kGyREEF4yRQKrl1cObq6hqoUBX80lZvy4Hgn5SjckRQja4fQO87rPk55RccRyG7VglYnZwQA-BCxXD1M4xxNNLHDBs_VzX9SXC9E3DW9MIe1ERTkIRsWflGFjsOvXo7-M7J6ql-7UX-k24YtEwIRLc270abnjR7YKkeLfr1HQr1E"
};

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    authorName: 'Carlos Mendez',
    authorRole: 'Diretor de Logística na Mercosul Trans',
    authorAvatar: ASSETS.carlosMendez,
    timeAgo: '2h',
    text: 'Excelente notícia para o setor agroindustrial! O novo corredor logístico entre Mato Grosso do Sul e o Chaco paraguaio deve reduzir o tempo de trânsito em 15%. Isso fortalece significativamente nossa competitividade bilateral. #Logistica #Agro #BrasilParaguai',
    image: ASSETS.logisticsHub,
    tags: ['Logistica', 'Agro', 'BrasilParaguai'],
    likes: 114,
    commentsCount: 23,
    userLiked: false
  },
  {
    id: 'post-2',
    authorName: 'Dra. Beatriz Almeida',
    authorRole: 'Especialista em Direito Aduaneiro',
    authorAvatar: ASSETS.beatrizAlmeida,
    timeAgo: '5h',
    text: 'Acabamos de publicar um guia atualizado sobre as novas normativas de importação para bens de capital no Paraguai. A isenção tributária para máquinas agrícolas foi estendida até o final do ano. Ótima oportunidade para expansão!',
    tags: ['DireitoAduaneiro', 'Tributacao', 'AgroMercosul'],
    likes: 124,
    commentsCount: 42,
    userLiked: true
  }
];

export const INITIAL_CHATS: ChatThread[] = [
  {
    id: 'chat-1',
    contactName: 'Cooperativa Agro Industrial',
    contactRole: 'Setor de Exportação - Filial PY',
    contactAvatar: ASSETS.cooperativaRep,
    lastMessage: 'Segue a versão atualizada com as notas da auditoria.',
    lastMessageTime: '10:50',
    isOnline: true,
    isUrgent: true,
    messages: [
      {
        id: 'msg-1',
        sender: 'them',
        text: 'Prezado João, acabamos de revisar a minuta do contrato de exportação de soja. Temos uma observação sobre a cláusula de conformidade ambiental exigida pelo mercado brasileiro.',
        time: '10:42'
      },
      {
        id: 'msg-2',
        sender: 'me',
        text: 'Entendido. A conformidade ambiental é um pré-requisito crítico para a certificação do lote. Podemos ajustar para incluir o relatório da auditoria externa?',
        time: '10:45'
      },
      {
        id: 'msg-3',
        sender: 'them',
        text: 'Segue a versão atualizada com as notas da auditoria.',
        time: '10:50',
        attachment: {
          name: 'Minuta_Contrato_v2.pdf',
          size: '2.4 MB',
          type: 'pdf'
        }
      }
    ]
  },
  {
    id: 'chat-2',
    contactName: 'Dra. Elena Ramirez',
    contactRole: 'Assessora Aduaneira',
    contactAvatar: ASSETS.elenaRamirez,
    lastMessage: 'Os documentos alfandegários estão prontos para...',
    lastMessageTime: 'Ontem',
    isOnline: false,
    messages: [
      {
        id: 'msg-elena-1',
        sender: 'them',
        text: 'Olá João, as guias de trânsito aduaneiro estão prontas para liberação.',
        time: 'Ontem'
      }
    ]
  },
  {
    id: 'chat-3',
    contactName: 'Aduana Leste Portuária',
    contactRole: 'Central de Cargas e Trânsito Seco',
    contactAvatar: '', // will display text acronym AL
    lastMessage: 'Confirmação de liberação de carga - Ref: 98221...',
    lastMessageTime: 'Segunda',
    isOnline: false,
    messages: [
      {
        id: 'msg-aduana-1',
        sender: 'them',
        text: 'Atenção: Confirmação de liberação de carga sob trânsito aduaneiro de importação temporária emitida.',
        time: 'Segunda'
      }
    ]
  }
];

export const INITIAL_NETWORK_REQUESTS: NetworkRequest[] = [
  {
    id: 'net-1',
    name: 'Maria Gonzalez',
    company: 'Transportadora Ciudad',
    avatar: ASSETS.mariaGonzalez,
    message: 'Gostaria de conectar para discutir rotas logísticas Brasil-Paraguai.',
    status: 'pending'
  }
];

export const LOGGED_IN_USER = {
  name: "João Silva",
  role: "Consultor de Comércio Exterior",
  location: "Foz do Iguaçu, Brasil",
  experience: "12 anos de experiência",
  bio: "Especialista em facilitar transações comerciais entre empresas brasileiras e paraguaias. Foco em redução de custos logísticos e conformidade aduaneira no Mercosul. Atuação estratégica em Ciudad del Este e Foz do Iguaçu.",
  avatar: ASSETS.joaoSilvaProfile,
  countries: ["BR", "PY"],
  verified: true,
  documentCPF: "***.542.988-**",
  documentRUC: "80024***-*",
  documentCNPJ: "24.556.*** / 0001-**"
};

export const TRENDING_TOPICS = [
  { id: 't-1', hashtag: '#PonteDaIntegracao', count: '2.432 publicações' },
  { id: 't-2', hashtag: '#Mercosul2024', count: '1.890 publicações' },
  { id: 't-3', hashtag: '#AgroBusinessPY', count: '1.543 publicações' },
  { id: 't-4', hashtag: '#ExportaFacil', count: '980 publicações' }
];

export const DEFAULT_OPPORTUNITIES: OpportunityProject[] = [
  {
    id: 'project-1',
    title: 'Implementação de Sistema de Irrigação Inteligente - Foz do Iguaçu/CDE',
    description: 'Projeto bilateral focado na otimização de recursos hídricos em plantações de soja na região de fronteira entre Brasil e Paraguai.',
    technicalDescription: 'O projeto consiste no desenvolvimento e instalação de uma rede de sensores IoT integrada a pivôs centrais de irrigação. O objetivo principal é a redução do consumo de energia em 15% e de água em 20% através de análise preditiva baseada em dados meteorológicos locais.\n\nA solução deve ser robusta o suficiente para operar em ambiente rural com conectividade limitada, utilizando protocolos LoRaWAN para comunicação entre os nós de sensores e o gateway central.',
    publishedDate: '24 Out, 2023',
    sector: 'Agronegócio',
    estimatedBudgetBrl: 450000,
    estimatedBudgetPyg: 645000000,
    contractType: 'PJ / B2B',
    paymentType: 'Mensal',
    daysRemaining: 12,
    projectPhase: 'Planejamento & Licitação',
    estimatedDuration: '12 meses',
    geographicScope: 'Paraná (BR) / Alto Paraná (PY)',
    languages: ['Português', 'Espanhol'],
    requirements: [
      'Registro ativo na junta comercial do Brasil ou Paraguai (CNPJ ou RUC).',
      'Experiência comprovada de no mínimo 3 anos em projetos de automação agrícola.',
      'Capacidade técnica para importação/exportação temporária de equipamentos entre as fronteiras.',
      'Certificação técnica para instalação de infraestrutura elétrica rural.'
    ],
    authorName: 'Joaquim de Almeida',
    authorRole: 'Gestor de Projetos de Infraestrutura • Cooperativa AgroFronteira',
    authorAvatar: ASSETS.joaquimAlmeida,
    location: 'Foz do Iguaçu, PR',
    verified: true,
    tags: ['Sistemas IoT2', 'Agronomia', 'Gestão Bilateral', 'Infraestrutura Rural']
  }
];

export const OTHER_OPPORTUNITIES = [
  {
    id: 'opp-1',
    title: 'Consultoria Aduaneira em Ciudad del Este',
    description: 'Suporte completo para desembaraço de carga eletrônica na fronteira seca. Necessário experiência em regimes tributários paraguaios.',
    sector: 'Exportação',
    type: 'Freelance',
    location: 'Foz do Iguaçu, BR',
    budgetVal: 'R$ 12.500,00',
    budgetType: 'Orçamento'
  },
  {
    id: 'opp-2',
    title: 'Parceria para Distribuição de Fertilizantes',
    description: 'Buscamos parceiro comercial para expansão de rede de distribuição no departamento de Alto Paraná. Foco em soja e milho.',
    sector: 'Agronegócio',
    type: 'Parceria',
    location: 'Asunción, PY',
    budgetVal: '$ 45.000,00',
    budgetType: 'Investimento'
  },
  {
    id: 'opp-3',
    title: 'Analista de Comércio Exterior Pleno',
    description: 'Contratação imediata para gestão de fluxos logísticos entre armazéns em Santa Rita e polos industriais brasileiros.',
    sector: 'Logística',
    type: 'CLT',
    location: 'Cascavel, BR',
    budgetVal: 'R$ 7.800,00',
    budgetType: 'Salário Base'
  },
  {
    id: 'opp-4',
    title: 'Desenvolvimento de ERP Transfronteiriço',
    description: 'Projeto para unificação de dados fiscais multi-moeda para varejistas com operações em ambos os países.',
    sector: 'Tecnologia',
    type: 'Freelance',
    location: 'Remoto',
    budgetVal: '$ 8.500,00',
    budgetType: 'Orçamento'
  },
  {
    id: 'opp-5',
    title: 'Representante Comercial - Autopeças',
    description: 'Expansão de marca brasileira de componentes automotivos no mercado paraguaio.',
    sector: 'Comércio',
    type: 'Parceria',
    location: 'Ciudad del Este, PY',
    budgetVal: 'R$ 5.000,00+',
    budgetType: 'Comissão Est.'
  }
];
