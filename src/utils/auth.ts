import type { User } from "./types";
import api from "./api";

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
  message?: string;
}

interface RegisterResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
  message?: string;
}

interface ProfileResponse {
  success: boolean;
  data?: User;
  error?: string;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.success) {
      const { token, user } = response.data;
      
      // Save token and user to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, token, user };
    }
    
    return { success: false, error: response.data.error || 'Login failed' };
  } catch (error: any) {
    console.error('Login error:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Network error' 
    };
  }
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<RegisterResponse> {
  try {
    const response = await api.post('/auth/register', { name, email, password });
    
    if (response.data.success) {
      const { token, user } = response.data;
      
      // Save token and user to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, token, user };
    }
    
    return { success: false, error: response.data.error || 'Registration failed' };
  } catch (error: any) {
    console.error('Register error:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Network error' 
    };
  }
}

export async function logout(): Promise<void> {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      await api.post('/auth/logout');
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}

export function isAuthenticated(): boolean {
  return localStorage.getItem('token') !== null;
}

export function isSuperAdmin(): boolean {
  const user = getAuthUser();
  return user?.role === 'super_admin';
}

export function getAuthUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user:', error);
    return null;
  }
}

export async function getProfile(): Promise<ProfileResponse> {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error: any) {
    console.error('Get profile error:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Network error' 
    };
  }
}

export async function updateProfile(name: string, email: string): Promise<ProfileResponse> {
  try {
    const response = await api.put('/auth/profile', { name, email });
    
    if (response.data.success && response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Update profile error:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Network error' 
    };
  }
}

export async function changePassword(
  currentPassword: string, 
  newPassword: string, 
  confirmPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Change password error:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Network error' 
    };
  }
}

// Helper untuk mendapatkan token
export function getToken(): string | null {
  return localStorage.getItem('token');
}