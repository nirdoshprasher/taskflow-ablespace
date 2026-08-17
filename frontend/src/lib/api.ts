import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  guestLogin: () => api.post('/auth/guest'),
  me: () => api.get('/auth/me'),
};

// ── Tasks API ─────────────────────────────────────────────────────────────────
export const tasksApi = {
  getAll: (params?: {
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
  }) => api.get('/tasks', { params }),
  getStats: () => api.get('/tasks/stats'),
  getOne:   (id: string) => api.get(`/tasks/${id}`),
  create:   (data: Partial<Task>) => api.post('/tasks', data),
  update:   (id: string, data: Partial<Task>) => api.put(`/tasks/${id}`, data),
  delete:   (id: string) => api.delete(`/tasks/${id}`),
};

// ── Subtasks API ──────────────────────────────────────────────────────────────
export const subtasksApi = {
  getAll: (taskId: string) =>
    api.get(`/tasks/${taskId}/subtasks`),
  create: (taskId: string, title: string) =>
    api.post(`/tasks/${taskId}/subtasks`, { title }),
  update: (taskId: string, id: string, data: { title?: string; isCompleted?: boolean }) =>
    api.patch(`/tasks/${taskId}/subtasks/${id}`, data),
  delete: (taskId: string, id: string) =>
    api.delete(`/tasks/${taskId}/subtasks/${id}`),
};

// ── Comments API ──────────────────────────────────────────────────────────────
export const commentsApi = {
  getAll: (taskId: string) =>
    api.get(`/tasks/${taskId}/comments`),
  create: (taskId: string, content: string) =>
    api.post(`/tasks/${taskId}/comments`, { content }),
  delete: (taskId: string, id: string) =>
    api.delete(`/tasks/${taskId}/comments/${id}`),
};

export interface Comment {
  id: string;
  content: string;
  authorName: string;
  taskId: string;
  createdAt: string;
}
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  category?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  taskId: string;
  createdAt: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  overdue: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
  avatar?: string;
}
