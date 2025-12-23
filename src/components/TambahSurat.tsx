import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert } from './ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { getAuthUser } from '../utils/auth';
import { apiServices } from '../services/apiServices';
import type { Perusahaan, KategoriSurat } from '../utils/types';
import { toast } from 'sonner';

interface TambahSuratProps {
  onNavigate: (page: string) => void;
}

export function TambahSurat({ onNavigate }: TambahSuratProps) {
  const user = getAuthUser();
  const [perusahaanId, setPerusahaanId] = useState<string>('');
  const [kategoriId, setKategoriId] = useState<string>('');
  const [perihal, setPerihal] = useState('');
  const [tujuan, setTujuan] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [nomorSurat, setNomorSurat] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [perusahaan, setPerusahaan] = useState<Perusahaan[]>([]);
  const [kategori, setKategori] = useState<KategoriSurat[]>([]);

  useEffect(() => {
    fetchPerusahaanAndKategori();
  }, []);

  useEffect(() => {
    // Pre-select perusahaan for admin
    if (user?.role === 'admin' && user.perusahaan_id && perusahaan.length > 0) {
      const userPerusahaan = perusahaan.find(p => p.id === user.perusahaan_id);
      if (userPerusahaan) {
        setPerusahaanId(userPerusahaan.id.toString());
      }
    }
  }, [user, perusahaan]);

  const fetchPerusahaanAndKategori = async () => {
    try {
      // Fetch active perusahaan
      const perusahaanResponse = await apiServices.perusahaan.getAll(true);
      if (perusahaanResponse.data.success) {
        setPerusahaan(perusahaanResponse.data.data);
      }

      // Fetch kategori
      const kategoriResponse = await apiServices.kategori.getAll();
      if (kategoriResponse.data.success) {
        setKategori(kategoriResponse.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data perusahaan dan kategori');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!perusahaanId || !kategoriId || !perihal || !tujuan || !tanggal) {
      setError('Semua field wajib diisi');
      toast.error('Semua field wajib diisi');
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiServices.surat.create({
        perusahaan_id: parseInt(perusahaanId),
        kategori_id: parseInt(kategoriId),
        perihal,
        tujuan,
        tanggal
      });

      if (response.data.success) {
        setSuccess('Surat berhasil ditambahkan!');
        setNomorSurat(response.data.data.nomor_surat);
        toast.success('Surat berhasil ditambahkan!');

        // Reset form setelah 10 detik
        setTimeout(() => {
          setPerusahaanId('');
          setKategoriId('');
          setPerihal('');
          setTujuan('');
          setTanggal(new Date().toISOString().split('T')[0]);
          setNomorSurat('');
          setSuccess('');
          onNavigate('data-surat');
        }, 10000);
      } else {
        setError(response.data.error || 'Gagal menambahkan surat');
        toast.error(response.data.error || 'Gagal menambahkan surat');
      }
    } catch (error: any) {
      console.error('Error creating surat:', error);
      setError(error.response?.data?.error || 'Terjadi kesalahan');
      toast.error(error.response?.data?.error || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl text-slate-900 mb-1">Tambah Surat Baru</h2>
        <p className="text-slate-600">Form untuk membuat surat dengan nomor otomatis</p>
      </div>

      {error && (
        <Alert className="mb-6 bg-red-50 border-red-200 text-red-800">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2">{error}</div>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-4 w-4" />
          <div className="ml-2">{success}</div>
        </Alert>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="perusahaan">Perusahaan *</Label>
              <Select 
                value={perusahaanId} 
                onValueChange={setPerusahaanId}
                disabled={user?.role === 'admin'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih perusahaan" />
                </SelectTrigger>
                <SelectContent>
                  {perusahaan.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nama} ({p.kode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {user?.role === 'admin' && (
                <p className="text-xs text-slate-500">
                  Perusahaan sudah otomatis dipilih sesuai akun Anda
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="kategori">Kategori Surat *</Label>
              <Select value={kategoriId} onValueChange={setKategoriId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {kategori.map(k => (
                    <SelectItem key={k.id} value={k.id.toString()}>
                      {k.nama} ({k.kode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tanggal">Tanggal Surat *</Label>
            <Input
              id="tanggal"
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
            />
          </div>

          {nomorSurat && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-slate-700 mb-1">Nomor Surat (Auto-Generated):</p>
              <p className="text-xl text-blue-700">{nomorSurat}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="perihal">Perihal *</Label>
            <Input
              id="perihal"
              type="text"
              placeholder="Contoh: Penawaran Kerja Sama"
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tujuan">Tujuan Surat *</Label>
            <Textarea
              id="tujuan"
              placeholder="Contoh: Kepada Yth. Direktur PT"
              value={tujuan}
              onChange={(e) => setTujuan(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading || !perusahaanId || !kategoriId} 
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Menyimpan...
                </>
              ) : 'Simpan Surat'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate('data-surat')}
            >
              Batal
            </Button>
          </div>
        </form>
      </Card>

      {/* Popup Konfirmasi */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-sm w-[92%] mx-auto text-center rounded-2xl shadow-xl backdrop-blur-md bg-white/80 border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900 tracking-tight">
              Konfirmasi Tambah Surat
            </DialogTitle>
          </DialogHeader>

          <div className="mt-3 space-y-1">
            <p className="text-slate-700 text-[15px] leading-relaxed">
              Apakah Anda yakin ingin melanjutkan penambahan surat ini?
            </p>
            <p className="text-slate-500 text-xs italic">
              Pastikan semua data sudah benar sebelum disimpan.
            </p>
          </div>

          <DialogFooter className="mt-6 flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              className="px-5 py-2 text-sm border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Batal
            </Button>
            <Button
              onClick={handleConfirm}
              className="px-5 py-2 text-sm bg-black text-white hover:bg-gray-800 shadow-md transition-all duration-200"
            >
              Lanjutkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-6 p-4 bg-slate-100 rounded-lg border border-slate-200">
        <p className="text-sm text-slate-700 mb-2">ℹ️ Informasi Format Nomor Surat:</p>
        <p className="text-xs text-slate-600">
          <strong>Format:</strong> NomorUrut / KodeSurat / KodePerusahaan / BulanRomawi / Tahun
        </p>
        <p className="text-xs text-slate-600 mt-1">
          <strong>Contoh:</strong> 13/SP/AOS/X/2025
        </p>
        <p className="text-xs text-slate-600 mt-1">
          Nomor urut akan reset otomatis setiap tahun.
        </p>
      </div>
    </div>
  );
}