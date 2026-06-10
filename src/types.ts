export type ViewType = 'cadastro' | 'mercado' | 'mensagens' | 'projetos' | 'perfil';

export interface UserProfile {
  name: string;
  email: string;
  document: string;
  phone: string;
  country: 'Brasil' | 'Paraguai';
  profileType: 'PF' | 'PJ';
}

export interface Post {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  timeAgo: string;
  text: string;
  image?: string;
  tags: string[];
  likes: number;
  commentsCount: number;
  userLiked?: boolean;
}

export interface DirectMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
  attachment?: {
    name: string;
    size: string;
    type: 'pdf' | 'doc' | 'image';
  };
}

export interface ChatThread {
  id: string;
  contactName: string;
  contactRole: string;
  contactAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  messages: DirectMessage[];
  isOnline: boolean;
  isUrgent?: boolean;
}

export interface NetworkRequest {
  id: string;
  name: string;
  company: string;
  avatar: string;
  message: string;
  status: 'pending' | 'accepted' | 'ignored';
}

export interface OpportunityProject {
  id: string;
  title: string;
  description: string;
  technicalDescription: string;
  publishedDate: string;
  sector: string;
  estimatedBudgetBrl: number;
  estimatedBudgetPyg: number;
  contractType: string;
  paymentType: string;
  daysRemaining: number;
  projectPhase: string;
  estimatedDuration: string;
  geographicScope: string;
  languages: string[];
  requirements: string[];
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  location: string;
  verified: boolean;
  tags: string[];
}
