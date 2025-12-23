// Type definitions for the application

export type UserRole = 'admin' | 'super_admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  perusahaan_id?: number;
  perusahaan_nama?: string;
  avatar?: string;
  created_at: string;
}

export interface Perusahaan {
  id: number;
  nama: string;
  kode: string;
  status: 'aktif' | 'tidak_aktif';
  created_at: string;
}

export interface KategoriSurat {
  id: number;
  nama: string;
  kode: string;
  created_at: string;
}

export interface Surat {
  id: number;
  nomor_surat: string;
  perusahaan_id: number;
  kategori_id: number;
  perihal: string;
  tujuan: string;
  tanggal: string;
  created_by: number;
  created_at: string;
  bukti_file?: string;
  perusahaan_nama?: string;
  perusahaan_kode?: string;
  kategori_nama?: string;
  kategori_kode?: string;
  created_by_name?: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  description: string;
  timestamp: string;
}

export interface SystemSettings {
  id: number;
  app_name: string;
  logo?: string;
  dark_mode: boolean;
  nomor_format: string;
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
}

export interface DashboardStats {
  totalSurat: number;
  suratBulanIni: number;
  totalPerusahaan: number;
  statistik12Bulan: Array<{ name: string; jumlah: number }>;
  suratPerPerusahaan: Array<{ nama: string; jumlah: number }>;
  suratTerbaru: Surat[];
}

export interface FilterParams {
  search?: string;
  perusahaan?: string;
  kategori?: string;
  tahun?: string;
  bulan?: string;
  limit?: number;
  offset?: number;
}