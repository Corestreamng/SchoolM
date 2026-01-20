import apiClient from '../api-client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'admin' | 'teacher' | 'student' | 'parent' | 'staff';
}

export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    [key: string]: any;
  };
  token: string;
  token_type: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/login', credentials);
    if (typeof window !== 'undefined' && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/register', data);
    if (typeof window !== 'undefined' && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/logout');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },

  getMe: async (): Promise<AuthResponse['user']> => {
    const response = await apiClient.get('/me');
    return response.data;
  },
};

