import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert } from './ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { getAuthUser, isSuperAdmin, updateProfile, changePassword } from '../utils/auth';
import { apiServices } from '../services/apiServices';
import type { Perusahaan } from '../utils/types';
import { toast } from 'sonner';

export function ProfilSaya() {
  const user = getAuthUser();
  const isSuperAdminUser = isSuperAdmin();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [perusahaan, setPerusahaan] = useState<Perusahaan | null>(null);

  useEffect(() => {
    if (user?.perusahaan_id) {
      fetchPerusahaan();
    }
  }, [user]);

  const fetchPerusahaan = async () => {
    if (!user?.perusahaan_id) return;
    
    try {
      const response = await apiServices.perusahaan.getById(user.perusahaan_id);
      if (response.data.success) {
        setPerusahaan(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching perusahaan:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await updateProfile(name, email);
      
      if (response.success && response.data) {
        setSuccess('Profil berhasil diperbarui');
        toast.success('Profil berhasil diperbarui');
      } else {
        setError(response.error || 'Gagal mengupdate profil');
        toast.error(response.error || 'Gagal mengupdate profil');
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      setError('Terjadi kesalahan saat mengupdate profil');
      toast.error('Terjadi kesalahan saat mengupdate profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    setError('');
    setSuccess('');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Semua field password harus diisi');
      toast.error('Semua field password harus diisi');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password baru minimal 6 karakter');
      toast.error('Password baru minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password baru dan konfirmasi tidak sama');
      toast.error('Password baru dan konfirmasi tidak sama');
      return;
    }

    setLoading(true);

    try {
      const response = await changePassword(currentPassword, newPassword, confirmPassword);
      
      if (response.success) {
        setSuccess('Password berhasil diubah');
        toast.success('Password berhasil diubah');
        
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(response.error || 'Gagal mengubah password');
        toast.error(response.error || 'Gagal mengubah password');
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      setError('Terjadi kesalahan saat mengubah password');
      toast.error('Terjadi kesalahan saat mengubah password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">User tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl text-slate-900 mb-1">Profil Saya</h2>
        <p className="text-slate-600">Kelola informasi profil dan keamanan akun</p>
      </div>

      {error && (
        <Alert className="bg-red-50 border-red-200 text-red-800">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2">{error}</div>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-4 w-4" />
          <div className="ml-2">{success}</div>
        </Alert>
      )}

      {/* Profile Info Card */}
      <Card className="p-6">
        <div className="flex items-start gap-6 mb-6">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="bg-blue-600 text-white text-2xl">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-xl text-slate-900 mb-1">{user.name}</h3>
            <p className="text-slate-600 mb-2">{user.email}</p>
            <div className="flex items-center gap-2">
              <Badge variant={isSuperAdminUser ? 'default' : 'secondary'}>
                {isSuperAdminUser ? 'Super Admin' : 'Admin'}
              </Badge>
              {perusahaan && (
                <Badge variant="outline">
                  {perusahaan.nama}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <h3 className="text-lg text-slate-900">Informasi Profil</h3>
          
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Input
              value={isSuperAdminUser ? 'Super Admin' : 'Admin'}
              disabled
              className="bg-slate-50"
            />
          </div>

          <Button onClick={handleUpdateProfile} disabled={loading || !name || !email}>
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Menyimpan...
              </>
            ) : 'Simpan Perubahan'}
          </Button>
        </div>
      </Card>

      {/* Change Password Card */}
      <Card className="p-6">
        <h3 className="text-lg text-slate-900 mb-4">Ubah Password</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Password Lama</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Masukkan password lama"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Password Baru</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              disabled={loading}
            />
          </div>

          <Button onClick={handleChangePassword} disabled={loading}>
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Memproses...
              </>
            ) : 'Ubah Password'}
          </Button>
        </div>
      </Card>

      {/* Account Info */}
      <Card className="p-6">
        <h3 className="text-lg text-slate-900 mb-4">Informasi Akun</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-600">Akun dibuat</span>
            <span className="text-slate-900">
              {new Date(user.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-600">User ID</span>
            <span className="text-slate-900 font-mono text-xs">{user.id}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-600">Perusahaan</span>
            <span className="text-slate-900">{perusahaan?.nama || '-'}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}