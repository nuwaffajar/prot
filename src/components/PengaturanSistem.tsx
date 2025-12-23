import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { getAuthUser } from '../utils/auth';
import { apiServices } from '../services/apiServices';
import type { SystemSettings } from '../utils/types';
import { toast } from 'sonner';

export function PengaturanSistem() {
  const user = getAuthUser();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    id: 0,
    app_name: 'Sistem Penomoran Surat',
    dark_mode: false,
    nomor_format: '{nomor}/{kode_surat}/{kode_perusahaan}/{bulan}/{tahun}',
    created_at: new Date().toISOString()
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await apiServices.settings.getSettings();
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await apiServices.settings.updateSettings({
        app_name: settings.app_name,
        dark_mode: settings.dark_mode,
        nomor_format: settings.nomor_format
      });
      
      if (response.data.success) {
        toast.success('Pengaturan berhasil disimpan');
        fetchSettings();
      } else {
        toast.error(response.data.error || 'Gagal menyimpan pengaturan');
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.error || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset pengaturan ke default?')) return;

    try {
      setLoading(true);
      const response = await apiServices.settings.resetSettings();
      
      if (response.data.success) {
        toast.success('Pengaturan berhasil direset ke default');
        fetchSettings();
      } else {
        toast.error(response.data.error || 'Gagal reset pengaturan');
      }
    } catch (error: any) {
      console.error('Error resetting settings:', error);
      toast.error(error.response?.data?.error || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleDarkModeChange = (checked: boolean) => {
    setSettings({...settings, dark_mode: checked});
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl text-slate-900 mb-1">Pengaturan Sistem</h2>
        <p className="text-slate-600">Konfigurasi aplikasi dan preferensi</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* General Settings */}
          <div>
            <h3 className="text-lg text-slate-900 mb-4">Pengaturan Umum</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appName">Nama Aplikasi</Label>
                <Input
                  id="appName"
                  value={settings.app_name}
                  onChange={(e) => setSettings({...settings, app_name: e.target.value})}
                  placeholder="Sistem Penomoran Surat"
                  disabled={loading}
                />
                <p className="text-xs text-slate-500">Nama aplikasi yang ditampilkan di sidebar dan header</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Appearance */}
          <div>
            <h3 className="text-lg text-slate-900 mb-4">Tampilan</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="darkMode">Dark Mode</Label>
                <p className="text-xs text-slate-500">Aktifkan mode gelap (Coming Soon)</p>
              </div>
              <Switch
                id="darkMode"
                checked={settings.dark_mode}
                onCheckedChange={handleDarkModeChange}
                disabled={true}
              />
            </div>
          </div>

          <Separator />

          {/* Numbering Format */}
          <div>
            <h3 className="text-lg text-slate-900 mb-4">Format Penomoran</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nomorFormat">Format Nomor Surat</Label>
                <Input
                  id="nomorFormat"
                  value={settings.nomor_format}
                  onChange={(e) => setSettings({...settings, nomor_format: e.target.value})}
                  placeholder="{nomor}/{kode_surat}/{kode_perusahaan}/{bulan}/{tahun}"
                  disabled={true}
                />
                <p className="text-xs text-slate-500">
                  Format saat ini: {'{nomor}/{kode_surat}/{kode_perusahaan}/{bulan}/{tahun}'}
                </p>

                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-xs text-slate-700">
                    <strong>Contoh output:</strong> 13/SP/AOS/X/2025
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    • {'{nomor}'} = Nomor urut (reset tiap tahun)<br />
                    • {'{kode_surat}'} = Kode kategori surat (SP, PC, LL)<br />
                    • {'{kode_perusahaan}'} = Kode perusahaan (EP, AOS, SP)<br />
                    • {'{bulan}'} = Bulan dalam Romawi (I-XII)<br />
                    • {'{tahun}'} = Tahun 4 digit (2025)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* System Info */}
          <div>
            <h3 className="text-lg text-slate-900 mb-4">Informasi Sistem</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">Versi Aplikasi</span>
                <span className="text-slate-900">1.0.0</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">Framework</span>
                <span className="text-slate-900">React + TypeScript</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">Styling</span>
                <span className="text-slate-900">Tailwind CSS</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">Backend</span>
                <span className="text-slate-900">Express.js + MySQL</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Menyimpan...
                </>
              ) : 'Simpan Perubahan'}
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={loading}>
              Reset ke Default
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}