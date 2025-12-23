import api from '../utils/api';
import type {
  // Surat,
  // Perusahaan,
  // KategoriSurat,
  // User,
  // DashboardStats,
  FilterParams
} from '../utils/types';

export const apiServices = {
  // === AUTH ===
  auth: {
    login: (email: string, password: string) => 
      api.post('/auth/login', { email, password }),
    register: (name: string, email: string, password: string) => 
      api.post('/auth/register', { name, email, password }),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data: { name: string; email: string }) => 
      api.put('/auth/profile', data),
    changePassword: (data: { 
      currentPassword: string; 
      newPassword: string; 
      confirmPassword: string 
    }) => api.put('/auth/change-password', data)
  },

  // === SURAT ===
  surat: {
    getAll: (params?: FilterParams) => 
      api.get('/surat', { params }),
    getById: (id: number) => 
      api.get(`/surat/${id}`),
    create: (data: {
      perusahaan_id: number;
      kategori_id: number;
      perihal: string;
      tujuan: string;
      tanggal: string;
    }) => api.post('/surat', data),
    update: (id: number, data: Partial<{
      perihal: string;
      tujuan: string;
      tanggal: string;
      perusahaan_id: number;
      kategori_id: number;
      bukti_file?: string;
    }>) => api.put(`/surat/${id}`, data),
    delete: (id: number) => 
      api.delete(`/surat/${id}`),
    uploadBukti: (id: number, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post(`/surat/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    getStats: () => 
      api.get('/surat/stats'),
    getCountByPerusahaan: () => 
      api.get('/surat/count/perusahaan'),
    getCountByKategori: () => 
      api.get('/surat/count/kategori'),
    getAvailableYears: () => 
      api.get('/surat/years')
  },

  // === PERUSAHAAN ===
  perusahaan: {
    getAll: (activeOnly?: boolean) => 
      api.get('/perusahaan', { params: { active: activeOnly } }),
    getById: (id: number) => 
      api.get(`/perusahaan/${id}`),
    create: (data: { nama: string; kode: string; status?: string }) => 
      api.post('/perusahaan', data),
    update: (id: number, data: Partial<{ nama: string; kode: string; status: string }>) => 
      api.put(`/perusahaan/${id}`, data),
    delete: (id: number) => 
      api.delete(`/perusahaan/${id}`),
    getStats: () => 
      api.get('/perusahaan/stats')
  },

  // === KATEGORI ===
  kategori: {
    getAll: () => 
      api.get('/kategori'),
    getById: (id: number) => 
      api.get(`/kategori/${id}`),
    create: (data: { nama: string; kode: string }) => 
      api.post('/kategori', data),
    update: (id: number, data: Partial<{ nama: string; kode: string }>) => 
      api.put(`/kategori/${id}`, data),
    delete: (id: number) => 
      api.delete(`/kategori/${id}`),
    getStats: () => 
      api.get('/kategori/stats')
  },

  // === USERS ===
  users: {
    getAll: () => 
      api.get('/users'),
    getById: (id: number) => 
      api.get(`/users/${id}`),
    create: (data: {
      name: string;
      email: string;
      password: string;
      role: string;
      perusahaan_id?: number;
    }) => api.post('/users', data),
    update: (id: number, data: Partial<{
      name: string;
      email: string;
      password?: string;
      role: string;
      perusahaan_id?: number;
    }>) => api.put(`/users/${id}`, data),
    delete: (id: number) => 
      api.delete(`/users/${id}`),
    resetPassword: (id: number, newPassword: string) => 
      api.put(`/users/${id}/reset-password`, { newPassword })
  },

  // === LAPORAN ===
  laporan: {
    getLaporan: (params: {
      perusahaan?: string;
      kategori?: string;
      tahun?: string;
      bulan?: string;
    }) => api.get('/laporan', { params }),
    exportExcel: (params: {
      perusahaan?: string;
      kategori?: string;
      tahun?: string;
      bulan?: string;
    }) => api.get('/laporan/export/excel', { 
      params,
      responseType: 'blob'
    }),
    exportPDF: (params: {
      perusahaan?: string;
      kategori?: string;
      tahun?: string;
      bulan?: string;
    }) => api.get('/laporan/export/pdf', { 
      params,
      responseType: 'blob'
    })
  },

  // === SETTINGS ===
  settings: {
    getSettings: () => 
      api.get('/settings'),
    updateSettings: (data: Partial<{
      app_name: string;
      logo?: string;
      dark_mode: boolean;
      nomor_format: string;
    }>) => api.put('/settings', data),
    resetSettings: () => 
      api.post('/settings/reset')
  },

  // === HEALTH CHECK ===
  health: {
    check: () => 
      api.get('/health')
  }
};