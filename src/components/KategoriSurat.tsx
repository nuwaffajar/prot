import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Plus, Trash2, Edit, FolderOpen } from 'lucide-react';
import { getAuthUser, isSuperAdmin } from '../utils/auth';
import { apiServices } from '../services/apiServices';
import type { KategoriSurat as KategoriSuratType } from '../utils/types';
import { toast } from 'sonner';

export function KategoriSurat() {
  const user = getAuthUser();
  const isSuperAdminUser = isSuperAdmin();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [nama, setNama] = useState('');
  const [kode, setKode] = useState('');
  
  const [kategori, setKategori] = useState<KategoriSuratType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKategori();
  }, []);

  const fetchKategori = async () => {
    try {
      setLoading(true);
      const response = await apiServices.kategori.getAll();
      if (response.data.success) {
        setKategori(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching kategori:', error);
      toast.error('Gagal memuat data kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (kategoriItem?: KategoriSuratType) => {
    if (kategoriItem) {
      setEditingId(kategoriItem.id);
      setNama(kategoriItem.nama);
      setKode(kategoriItem.kode);
    } else {
      setEditingId(null);
      setNama('');
      setKode('');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setNama('');
    setKode('');
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      if (editingId) {
        // Update existing
        const response = await apiServices.kategori.update(editingId, { nama, kode });
        if (response.data.success) {
          toast.success('Kategori berhasil diubah');
          fetchKategori();
        } else {
          toast.error(response.data.error || 'Gagal mengubah kategori');
        }
      } else {
        // Create new
        const response = await apiServices.kategori.create({ nama, kode });
        if (response.data.success) {
          toast.success('Kategori berhasil ditambahkan');
          fetchKategori();
        } else {
          toast.error(response.data.error || 'Gagal menambah kategori');
        }
      }
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving kategori:', error);
      toast.error(error.response?.data?.error || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id: number) => {
    if (!user) return;

    try {
      const response = await apiServices.kategori.delete(id);
      if (response.data.success) {
        toast.success('Kategori berhasil dihapus');
        setKategori(kategori.filter(k => k.id !== id));
        setDeleteId(null);
      } else {
        toast.error(response.data.error || 'Gagal menghapus kategori');
      }
    } catch (error: any) {
      console.error('Error deleting kategori:', error);
      toast.error(error.response?.data?.error || 'Terjadi kesalahan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl text-slate-900 mb-1">Kategori Surat</h2>
          <p className="text-slate-600">Kelola jenis/kategori surat</p>
        </div>
        {isSuperAdminUser && (
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Kategori
          </Button>
        )}
      </div>

      <Card className="p-6">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kategori</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                {isSuperAdminUser && <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isSuperAdminUser ? 4 : 3} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : kategori.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isSuperAdminUser ? 4 : 3} className="text-center py-8 text-slate-500">
                    <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada data kategori</p>
                  </TableCell>
                </TableRow>
              ) : (
                kategori.map(kategoriItem => (
                  <TableRow key={kategoriItem.id}>
                    <TableCell>{kategoriItem.nama}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        {kategoriItem.kode}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(kategoriItem.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    {isSuperAdminUser && (
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOpenDialog(kategoriItem)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setDeleteId(kategoriItem.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
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
            <DialogTitle>{editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Ubah informasi kategori surat' : 'Tambahkan kategori surat baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Kategori</Label>
              <Input
                id="nama"
                placeholder="Contoh: Penawaran"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kode">Kode Kategori</Label>
              <Input
                id="kode"
                placeholder="Contoh: SP"
                value={kode}
                onChange={(e) => setKode(e.target.value.toUpperCase())}
                maxLength={10}
              />
              <p className="text-xs text-slate-500">Kode akan otomatis diubah ke huruf besar</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={!nama || !kode}>
              {editingId ? 'Simpan Perubahan' : 'Tambah Kategori'}
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
              Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.
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