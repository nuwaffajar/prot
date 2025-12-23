import { useState } from 'react';
import type { ReactNode } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  FilePlus, 
  FolderOpen, 
  Users, 
  Building2, 
  FileBarChart, 
  Settings, 
  User, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { logout, getAuthUser, isSuperAdmin } from '../utils/auth';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function DashboardLayout({ children, currentPage, onNavigate, onLogout }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = getAuthUser();
  const isSuperAdminUser = isSuperAdmin();

  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
      toast.success('Logout berhasil');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Gagal logout');
    }
  };

  // Menu items
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'super_admin'] },
    { id: 'tambah-surat', icon: FilePlus, label: 'Tambah Surat', roles: ['admin', 'super_admin'] },
    { id: 'kategori-surat', icon: FolderOpen, label: 'Kategori Surat', roles: ['admin', 'super_admin'] },
    { id: 'data-surat', icon: FileText, label: 'Data Surat', roles: ['admin', 'super_admin'] },
    { id: 'laporan', icon: FileBarChart, label: 'Laporan Surat', roles: ['admin', 'super_admin'] },
    { id: 'manajemen-pengguna', icon: Users, label: 'Manajemen Pengguna', roles: ['super_admin'] },
    { id: 'data-perusahaan', icon: Building2, label: 'Data Perusahaan', roles: ['super_admin'] },
    { id: 'pengaturan', icon: Settings, label: 'Pengaturan Sistem', roles: ['super_admin'] },
  ];

  // Filter menu berdasarkan role
  const filteredMenuItems = menuItems.filter(item => {
    if (item.roles.includes('super_admin') && isSuperAdminUser) return true;
    if (item.roles.includes('admin') && !isSuperAdminUser) return true;
    return false;
  });

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-slate-200
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-slate-900 font-semibold">Surat App</span>
            </div>
            <button 
              className="lg:hidden p-1"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-colors text-sm
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-slate-700 hover:bg-slate-100'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* User Section */}
          <div className="border-t border-slate-200 p-3 space-y-1">
            <button
              onClick={() => {
                onNavigate('profil');
                setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-colors text-sm
                ${currentPage === 'profil' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-700 hover:bg-slate-100'
                }
              `}
            >
              <User className="w-5 h-5" />
              <span>Profil Saya</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                text-red-700 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-lg text-slate-900 hidden sm:block font-medium">
              {filteredMenuItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">
                {isSuperAdminUser ? 'Super Admin' : 'Admin'}
              </p>
            </div>
            <Avatar>
              <AvatarFallback className="bg-blue-600 text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}