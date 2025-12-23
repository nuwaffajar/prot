import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Badge } from './ui/badge';
import { Plus, Trash2, Edit, Building2 } from 'lucide-react';
import { getAuthUser } from '../utils/auth';
import { apiServices } from '../services/apiServices';
import type { Perusahaan } from '../utils/types';
import { toast } from 'sonner';

export function DataPerusahaan() {
  const user = getAuthUser();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [nama, setNama] = useState('');
  const [kode, setKode] = useState('');
  const [status, setStatus] = useState<'aktif' | 'tidak_aktif'>('aktif');
  
  const [perusahaan, setPerusahaan] = useState<Perusahaan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerusahaan();
  }, []);

  const fetchPerusahaan = async () => {
    try {
      setLoading(true);
      const response = await apiServices.perusahaan.getAll();
      if (response.data.success) {
        setPerusahaan(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching perusahaan:', error);
      toast.error('Gagal memuat data perusahaan');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (perusahaanItem?: Perusahaan) => {
    if (perusahaanItem) {
      setEditingId(perusahaanItem.id);
      setNama(perusahaanItem.nama);
      setKode(perusahaanItem.kode);
      setStatus(perusahaanItem.status);
    } else {
      setEditingId(null);
      setNama('');
      setKode('');
      setStatus('aktif');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setNama('');
    setKode('');
    setStatus('aktif');
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      if (editingId) {
        // Update existing
        const response = await apiServices.perusahaan.update(editingId, { nama, kode, status });
        if (response.data.success) {
          toast.success('Perusahaan berhasil diubah');
          fetchPerusahaan();
          handleCloseDialog();
        } else {
          toast.error(response.data.error || 'Gagal mengubah perusahaan');
        }
      } else {
        // Create new
        const response = await apiServices.perusahaan.create({ nama, kode, status });
        if (response.data.success) {
          toast.success('Perusahaan berhasil ditambahkan');
          fetchPerusahaan();
          handleCloseDialog();
        } else {
          toast.error(response.data.error || 'Gagal menambah perusahaan');
        }
      }
    } catch (error: any) {
      console.error('Error saving perusahaan:', error);
      toast.error(error.response?.data?.error || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id: number) => {
    if (!user) return;

    try {
      const response = await apiServices.perusahaan.delete(id);
      if (response.data.success) {
        toast.success('Perusahaan berhasil dihapus');
        setPerusahaan(perusahaan.filter(p => p.id !== id));
        setDeleteId(null);
      } else {
        toast.error(response.data.error || 'Gagal menghapus perusahaan');
      }
    } catch (error: any) {
      console.error('Error deleting perusahaan:', error);
      toast.error(error.response?.data?.error || 'Terjadi kesalahan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl text-slate-900 mb-1">Data Perusahaan</h2>
          <p className="text-slate-600">Kelola data perusahaan PT/CV</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Perusahaan
        </Button>
      </div>

      <Card className="p-6">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Perusahaan</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : perusahaan.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada data perusahaan</p>
                  </TableCell>
                </TableRow>
              ) : (
                perusahaan.map(perusahaanItem => (
                  <TableRow key={perusahaanItem.id}>
                    <TableCell>{perusahaanItem.nama}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                        {perusahaanItem.kode}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={perusahaanItem.status === 'aktif' ? 'default' : 'secondary'}>
                        {perusahaanItem.status === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(perusahaanItem.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleOpenDialog(perusahaanItem)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setDeleteId(perusahaanItem.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Perusahaan' : 'Tambah Perusahaan Baru'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Ubah informasi perusahaan' : 'Tambahkan perusahaan baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Perusahaan</Label>
              <Input
                id="nama"
                placeholder="Contoh: PT. EZRA"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kode">Kode Perusahaan</Label>
              <Input
                id="kode"
                placeholder="Contoh: EP"
                value={kode}
                onChange={(e) => setKode(e.target.value.toUpperCase())}
                maxLength={5}
              />
              <p className="text-xs text-slate-500">Kode akan otomatis diubah ke huruf besar</p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(value: "aktif" | "tidak_aktif") => setStatus(value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={!nama || !kode}>
              {editingId ? 'Simpan Perubahan' : 'Tambah Perusahaan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus perusahaan ini? Tindakan ini tidak dapat dibatalkan dan akan mempengaruhi data surat terkait.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}