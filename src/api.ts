// Thin client for the Conexão BR-PY backend. Requests go to /api (proxied to
// the Express server in dev). The JWT is kept in localStorage.

const TOKEN_KEY = 'conexao_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const CITIES = [
  'Asunción',
  'Ciudad del Este',
  'Encarnación',
  'Hernandarias',
  'Pedro Juan Caballero',
  'Salto del Guairá',
];
export const DEFAULT_CITY = 'Asunción';

export type Role = 'newcomer' | 'established' | 'business_owner';

export const ROLE_LABELS: Record<Role, string> = {
  newcomer: 'Brasileiro chegando',
  established: 'Brasileiro estabelecido',
  business_owner: 'Dono de negócio',
};

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface User {
  id: number;
  name: string;
  email?: string;
  role: Role;
  city: string;
  neighborhood: string | null;
  bio: string | null;
  verified: boolean;
  verificationStatus: VerificationStatus;
  isAdmin: boolean;
  createdAt: string;
}

export const DOC_TYPES = ['CPF', 'Cédula Paraguaia', 'Passaporte', 'RNE / Carteira de Residência', 'RUC / CNPJ'];

export interface VerificationRequest {
  id: number;
  userId: number;
  docType: string;
  docNumber: string;
  fullLegalName: string;
  note: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  user?: { id: number; name: string; email: string; role: Role; neighborhood: string | null };
}

export interface Establishment {
  id: number;
  name: string;
  category: string;
  description: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string;
  phone: string | null;
  whatsapp: string | null;
  ownerUserId: number | null;
  createdByUserId: number | null;
  createdAt: string;
  avgRating: number | null;
  indicationCount: number;
}

export interface Indication {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: number; name: string; verified: boolean };
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface Contribution {
  id: number;
  name: string;
  category: string;
  neighborhood: string | null;
  avgRating: number | null;
  indicationCount: number;
}

export interface Post {
  id: number;
  category: string | null;
  body: string;
  createdAt: string;
  replyCount: number;
  author: { id: number; name: string; verified: boolean; role: Role };
}

export interface PostReply {
  id: number;
  body: string;
  createdAt: string;
  user: { id: number; name: string; verified: boolean };
  establishment: { id: number; name: string; category: string | null; neighborhood: string | null } | null;
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  if (options.body) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, (data && data.error) || 'Algo deu errado. Tente novamente.');
  }
  return data as T;
}

// ---- Auth -------------------------------------------------------------------
export interface AuthPayload {
  name?: string;
  email: string;
  password: string;
  role?: Role;
  neighborhood?: string;
  bio?: string;
  city?: string;
}

export const authApi = {
  register: (body: AuthPayload) =>
    request<{ token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: Pick<AuthPayload, 'email' | 'password'>) =>
    request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request<{ user: User }>('/auth/me'),
};

// ---- Establishments ---------------------------------------------------------
export interface EstablishmentInput {
  name: string;
  category: string;
  description?: string;
  address?: string;
  neighborhood?: string;
  phone?: string;
  whatsapp?: string;
  city?: string;
}

export const estApi = {
  list: (params: { q?: string; category?: string; neighborhood?: string; city?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.category && params.category !== 'Todas') qs.set('category', params.category);
    if (params.neighborhood) qs.set('neighborhood', params.neighborhood);
    if (params.city) qs.set('city', params.city);
    const suffix = qs.toString() ? `?${qs}` : '';
    return request<{ establishments: Establishment[] }>(`/establishments${suffix}`);
  },
  categories: (city?: string) =>
    request<{ categories: CategoryCount[] }>(`/establishments/categories${city ? `?city=${encodeURIComponent(city)}` : ''}`),
  get: (id: number) =>
    request<{ establishment: Establishment; indications: Indication[] }>(`/establishments/${id}`),
  create: (body: EstablishmentInput) =>
    request<{ establishment: Establishment }>('/establishments', { method: 'POST', body: JSON.stringify(body) }),
  addIndication: (id: number, body: { rating: number; comment?: string }) =>
    request<{ ok: true }>(`/establishments/${id}/indications`, { method: 'POST', body: JSON.stringify(body) }),
};

// ---- Community feed ---------------------------------------------------------
export const postApi = {
  list: (city?: string, category?: string) => {
    const qs = new URLSearchParams();
    if (city) qs.set('city', city);
    if (category && category !== 'Todas') qs.set('category', category);
    const suffix = qs.toString() ? `?${qs}` : '';
    return request<{ posts: Post[] }>(`/posts${suffix}`);
  },
  get: (id: number) => request<{ post: Post; replies: PostReply[] }>(`/posts/${id}`),
  create: (body: { body: string; category?: string; city?: string }) =>
    request<{ post: Post }>('/posts', { method: 'POST', body: JSON.stringify(body) }),
  addReply: (id: number, body: { body: string; establishmentId?: number }) =>
    request<{ ok: true }>(`/posts/${id}/replies`, { method: 'POST', body: JSON.stringify(body) }),
};

// ---- Direct messages --------------------------------------------------------
export interface Conversation {
  user: { id: number; name: string; verified: boolean };
  lastBody: string | null;
  lastAt: string | null;
  unread: number;
}

export interface ChatMessage {
  id: number;
  body: string;
  createdAt: string;
  mine: boolean;
}

export const messageApi = {
  unreadCount: () => request<{ unreadCount: number }>('/messages/unread-count'),
  conversations: () => request<{ conversations: Conversation[] }>('/messages/conversations'),
  thread: (userId: number) =>
    request<{ user: { id: number; name: string; verified: boolean; role: Role }; messages: ChatMessage[] }>(
      `/messages/with/${userId}`,
    ),
  send: (userId: number, body: string) =>
    request<{ message: ChatMessage }>(`/messages/with/${userId}`, { method: 'POST', body: JSON.stringify({ body }) }),
};

// ---- Notifications ----------------------------------------------------------
export interface Notification {
  id: number;
  message: string;
  targetType: 'post' | 'establishment' | 'profile' | 'admin' | null;
  targetId: number | null;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  list: () => request<{ notifications: Notification[]; unreadCount: number }>('/notifications'),
  markAllRead: () => request<{ ok: true }>('/notifications/read-all', { method: 'POST' }),
  markRead: (id: number) => request<{ ok: true }>(`/notifications/${id}/read`, { method: 'POST' }),
};

// ---- Identity verification --------------------------------------------------
export const verificationApi = {
  me: () => request<{ request: VerificationRequest | null }>('/verification/me'),
  submit: (body: { docType: string; docNumber: string; fullLegalName: string; note?: string }) =>
    request<{ ok: true }>('/verification', { method: 'POST', body: JSON.stringify(body) }),
  pending: () => request<{ requests: VerificationRequest[] }>('/verification/pending'),
  review: (id: number, body: { decision: 'approve' | 'reject'; note?: string }) =>
    request<{ ok: true }>(`/verification/${id}/review`, { method: 'POST', body: JSON.stringify(body) }),
};

// ---- Users ------------------------------------------------------------------
export const userApi = {
  get: (id: number) => request<{ user: User; contributions: Contribution[] }>(`/users/${id}`),
  updateMe: (body: { name?: string; role?: Role; neighborhood?: string; bio?: string }) =>
    request<{ user: User }>('/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
};
