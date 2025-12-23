import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { FileText, Building2, TrendingUp } from 'lucide-react';
import { getAuthUser } from '../utils/auth';
import { apiServices } from '../services/apiServices';
import type { Surat, DashboardStats } from '../utils/types';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { toast } from 'sonner';

interface DashboardHomeProps {
  onNavigate: (page: string) => void;
}

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentSurat, setRecentSurat] = useState<Surat[]>([]);
  const currentUser = getAuthUser();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await apiServices.surat.getStats();
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // Fetch recent surat
      const suratResponse = await apiServices.surat.getAll({ limit: 5 });
      if (suratResponse.data.success) {
        setRecentSurat(suratResponse.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl text-slate-900 mb-1">Sistem Penomoran Surat Otomatis</h2>
            <p className="text-slate-600">
              {currentUser?.role === 'super_admin'
                ? 'Dashboard Super Admin'
                : `Dashboard ${currentUser?.perusahaan_nama || ''}`}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-24 bg-slate-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl text-slate-900 mb-1">
            Sistem Penomoran Surat Otomatis
          </h2>
          <p className="text-slate-600">
            {currentUser?.role === 'super_admin'
              ? 'Dashboard Super Admin'
              : `Dashboard ${currentUser?.perusahaan_nama || ''}`}
          </p>
        </div>
        <Button onClick={() => onNavigate('tambah-surat')} className="w-full sm:w-auto">
          <FileText className="w-4 h-4 mr-2" />
          Tambah Surat Baru
        </Button>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Surat</p>
              <p className="text-3xl text-slate-900">{stats?.totalSurat || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Surat Bulan Ini</p>
              <p className="text-3xl text-slate-900">{stats?.suratBulanIni || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Perusahaan</p>
              <p className="text-3xl text-slate-900">{stats?.totalPerusahaan || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Grafik & Surat per Perusahaan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg text-slate-900 mb-4">Statistik 12 Bulan Terakhir</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats?.statistik12Bulan || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px' 
                }}
                formatter={(value) => [value, 'Jumlah Surat']}
              />
              <Bar dataKey="jumlah" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg text-slate-900 mb-4">Surat per Perusahaan</h3>
          <div className="space-y-4">
            {stats?.suratPerPerusahaan?.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-900">{item.nama}</p>
                    <p className="text-xs text-slate-500">{item.jumlah} surat</p>
                  </div>
                </div>
              </div>
            ))}
            {(!stats?.suratPerPerusahaan || stats.suratPerPerusahaan.length === 0) && (
              <p className="text-slate-500 text-center py-4">Belum ada data</p>
            )}
          </div>
        </Card>
      </div>

      {/* Surat Terbaru */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg text-slate-900">Surat Terbaru</h3>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('data-surat')}>
            Lihat Semua
          </Button>
        </div>

        {recentSurat.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Belum ada surat</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSurat.map(surat => (
              <div key={surat.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 mb-1">{surat.nomor_surat}</p>
                  <p className="text-xs text-slate-600 truncate">{surat.perihal}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">{surat.perusahaan_nama}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{surat.kategori_nama}</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-slate-500">
                    {new Date(surat.tanggal).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}