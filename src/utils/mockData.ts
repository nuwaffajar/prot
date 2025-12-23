// utils/mockData.ts
// Mock data store using localStorage

import type {
  User,
  Perusahaan,
  KategoriSurat,
  Surat,
  ActivityLog,
  SystemSettings,
} from "./types";

const STORAGE_KEYS = {
  USERS: "surat_users",
  PERUSAHAAN: "surat_perusahaan",
  KATEGORI: "surat_kategori",
  SURAT: "surat_data",
  LOGS: "surat_logs",
  SETTINGS: "surat_settings",
  CURRENT_USER: "surat_current_user",
};

// ===== DEFAULT DATA =====
const defaultUsers: User[] = [
  {
    id: 1,
    name: "Super Admin",
    email: "superadmin@example.com",
    //password: "admin123",
    role: "super_admin", // super admin bisa lihat semua
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Admin PT EZRA",
    email: "admin@example.com",
    // password: "admin123",
    role: "admin", // admin hanya bisa lihat perusahaannya sendiri
    perusahaan_id: 1, // ID dari PT. EZRA
    created_at: new Date().toISOString(),
  },
];

const defaultPerusahaan: Perusahaan[] = [
  { id: 1, nama: "PT. EZRA", kode: "EP", status: "aktif", created_at: new Date().toISOString() },
  { id: 2, nama: "CV. ALFA OMEGA", kode: "AOS", status: "aktif", created_at: new Date().toISOString() },
  { id: 3, nama: "CV. STIGMA PRATAMA", kode: "SP", status: "aktif", created_at: new Date().toISOString() },
];

const defaultKategori: KategoriSurat[] = [
  { id: 1, nama: "Penawaran", kode: "SP", created_at: new Date().toISOString() },
  { id: 2, nama: "Pencairan", kode: "PC", created_at: new Date().toISOString() },
  { id: 3, nama: "Lain-lain", kode: "LL", created_at: new Date().toISOString() },
];

const defaultSettings: SystemSettings = {
  app_name: "Sistem Penomoran Surat",
  dark_mode: false,
  nomor_format: "{nomor}/{kode_surat}/{kode_perusahaan}/{bulan}/{tahun}",
  id: 1,
  created_at: new Date().toISOString(),
};

// ===== HELPERS =====
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ===== INIT =====
export function initializeStorage(): void {
  if (typeof window === "undefined") return;

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) saveToStorage(STORAGE_KEYS.USERS, defaultUsers);
  if (!localStorage.getItem(STORAGE_KEYS.PERUSAHAAN)) saveToStorage(STORAGE_KEYS.PERUSAHAAN, defaultPerusahaan);
  if (!localStorage.getItem(STORAGE_KEYS.KATEGORI)) saveToStorage(STORAGE_KEYS.KATEGORI, defaultKategori);
  if (!localStorage.getItem(STORAGE_KEYS.SURAT)) saveToStorage(STORAGE_KEYS.SURAT, []);
  if (!localStorage.getItem(STORAGE_KEYS.LOGS)) saveToStorage(STORAGE_KEYS.LOGS, []);
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) saveToStorage(STORAGE_KEYS.SETTINGS, defaultSettings);
}

// ===== EXPORT FUNCTIONS =====

// USERS
export const getUsers = (): User[] => getFromStorage(STORAGE_KEYS.USERS, defaultUsers);
export const saveUsers = (users: User[]): void => saveToStorage(STORAGE_KEYS.USERS, users);

// PERUSAHAAN
export const getPerusahaan = (): Perusahaan[] => getFromStorage(STORAGE_KEYS.PERUSAHAAN, defaultPerusahaan);
export const savePerusahaan = (p: Perusahaan[]): void => saveToStorage(STORAGE_KEYS.PERUSAHAAN, p);

// KATEGORI
export const getKategori = (): KategoriSurat[] => getFromStorage(STORAGE_KEYS.KATEGORI, defaultKategori);
export const saveKategori = (kategori: KategoriSurat[]): void => saveToStorage(STORAGE_KEYS.KATEGORI, kategori);

// SURAT
export const getSurat = (): Surat[] => getFromStorage(STORAGE_KEYS.SURAT, []);
export const saveSurat = (surat: Surat[]): void => saveToStorage(STORAGE_KEYS.SURAT, surat);

// LOGS
export const getLogs = (): ActivityLog[] => getFromStorage(STORAGE_KEYS.LOGS, []);
export const saveLogs = (logs: ActivityLog[]): void => saveToStorage(STORAGE_KEYS.LOGS, logs);

export const addLog = (userId: string, action: string, description: string): void => {
  const logs = getLogs();
  logs.push({
    id: Date.now(),
    user_id: parseInt(userId, 10), // Convert string to number
    action,
    description,
    timestamp: new Date().toISOString(),
  });
  saveLogs(logs);
};

// SETTINGS
export const getSettings = (): SystemSettings => getFromStorage(STORAGE_KEYS.SETTINGS, defaultSettings);
export const saveSettings = (settings: SystemSettings): void => saveToStorage(STORAGE_KEYS.SETTINGS, settings);

// CURRENT USER
export const getCurrentUser = (): User => {
  if (typeof window === "undefined") return defaultUsers[1]; // fallback: Admin PT EZRA
  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (stored) return JSON.parse(stored);
  // jika belum login, default ke Super Admin agar dashboard bisa tetap jalan
  return defaultUsers[0];
};

export const setCurrentUser = (user: User | null): void => {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};
