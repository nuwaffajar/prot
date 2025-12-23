import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { FileDown, FileSpreadsheet, FileBarChart } from 'lucide-react';
import { getAuthUser, isSuperAdmin } from '../utils/auth';
import { apiServices } from '../services/apiServices';
import type { Surat, Perusahaan, KategoriSurat } from '../utils/types';
import { toast } from 'sonner';

export function LaporanSurat() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [bulan, setBulan] = useState(currentMonth.toString());
  const [tahun, setTahun] = useState(currentYear.toString());
  const [perusahaanId, setPerusahaanId] = useState('all');
  const [kategoriId, setKategoriId] = useState('all');

  const user = getAuthUser();
  const isSuperAdminUser = isSuperAdmin();

  const [perusahaan, setPerusahaan] = useState<Perusahaan[]>([]);
  const [kategori, setKategori] = useState<KategoriSurat[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [surat, setSurat] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    byPerusahaan: [] as Array<{ nama: string; jumlah: number }>,
    byKategori: [] as Array<{ nama: string; jumlah: number }>
  });

  useEffect(() => {
    fetchFilters();
    fetchLaporan();
  }, []);

  useEffect(() => {
    fetchLaporan();
  }, [bulan, tahun, perusahaanId, kategoriId]);

  const fetchFilters = async () => {
    try {
      // Fetch perusahaan
      const perusahaanResponse = await apiServices.perusahaan.getAll();
      if (perusahaanResponse.data.success) {
        setPerusahaan(perusahaanResponse.data.data);
      }

      // Fetch kategori
      const kategoriResponse = await apiServices.kategori.getAll();
      if (kategoriResponse.data.success) {
        setKategori(kategoriResponse.data.data);
      }

      // Fetch years
      const yearsResponse = await apiServices.surat.getAvailableYears();
      if (yearsResponse.data.success) {
        setYears(yearsResponse.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching filters:', error);
    }
  };

  const fetchLaporan = async () => {
    try {
      setLoading(true);
      
      const params: any = {};
      if (bulan !== 'all') params.bulan = bulan;
      if (tahun !== 'all') params.tahun = tahun;
      if (perusahaanId !== 'all') params.perusahaan = perusahaanId;
      if (kategoriId !== 'all') params.kategori = kategoriId;

      const response = await apiServices.laporan.getLaporan(params);
      if (response.data.success) {
        const data = response.data.data;
        setSurat(data.surat || []);
        setSummary(data.summary || { total: 0, byPerusahaan: [], byKategori: [] });
      }
    } catch (error: any) {
      console.error('Error fetching laporan:', error);
      toast.error('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setLoading(true);
      
      const params: any = {};
      if (bulan !== 'all') params.bulan = bulan;
      if (tahun !== 'all') params.tahun = tahun;
      if (perusahaanId !== 'all') params.perusahaan = perusahaanId;
      if (kategoriId !== 'all') params.kategori = kategoriId;

      const response = await apiServices.laporan.exportPDF(params);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-surat-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF berhasil diexport');
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      toast.error('Gagal export PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      
      const params: any = {};
      if (bulan !== 'all') params.bulan = bulan;
      if (tahun !== 'all') params.tahun = tahun;
      if (perusahaanId !== 'all') params.perusahaan = perusahaanId;
      if (kategoriId !== 'all') params.kategori = kategoriId;

      const response = await apiServices.laporan.exportExcel(params);
      
      // Create blob and download
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-surat-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Excel berhasil diexport');
    } catch (error: any) {
      console.error('Error exporting Excel:', error);
      toast.error('Gagal export Excel');
    } finally {
      setLoading(false);
    }
  };

  const months = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ];

  // Filter perusahaan berdasarkan role
  const filteredPerusahaan = isSuperAdminUser 
    ? perusahaan 
    : perusahaan.filter(p => p.id === user?.perusahaan_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl text-slate-900 mb-1">Laporan Surat</h2>
          <p className="text-slate-600">Rekap dan laporan data surat</p>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="p-6">
        <h3 className="text-lg text-slate-900 mb-4">Filter Laporan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Bulan</Label>
            <Select value={bulan} onValueChange={setBulan}>
              <SelectTrigger><SelectValue placeholder="Pilih bulan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Bulan</SelectItem>
                {months.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tahun</Label>
            <Select value={tahun} onValueChange={setTahun}>
              <SelectTrigger><SelectValue placeholder="Pilih tahun" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahun</SelectItem>
                {years.map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Perusahaan</Label>
            <Select value={perusahaanId} onValueChange={setPerusahaanId}>
              <SelectTrigger><SelectValue placeholder="Pilih perusahaan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Perusahaan</SelectItem>
                {filteredPerusahaan.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={kategoriId} onValueChange={setKategoriId}>
              <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {kategori.map(k => (
                  <SelectItem key={k.id} value={k.id.toString()}>{k.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleExportPDF} variant="outline" disabled={loading}>
            <FileDown className="w-4 h-4 mr-2" />
            {loading ? 'Memproses...' : 'Export PDF'}
          </Button>
          <Button onClick={handleExportExcel} variant="outline" disabled={loading}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            {loading ? 'Memproses...' : 'Export Excel'}
          </Button>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Surat</p>
              <p className="text-3xl text-slate-900">{summary.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileBarChart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-slate-600 mb-3">Per Perusahaan</p>
          <div className="space-y-2">
            {summary.byPerusahaan.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{item.nama}</span>
                <span className="text-slate-900">{item.jumlah}</span>
              </div>
            ))}
            {summary.byPerusahaan.length === 0 && (
              <p className="text-slate-500 text-sm">Tidak ada data</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-slate-600 mb-3">Per Kategori</p>
          <div className="space-y-2">
            {summary.byKategori.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{item.nama}</span>
                <span className="text-slate-900">{item.jumlah}</span>
              </div>
            ))}
            {summary.byKategori.length === 0 && (
              <p className="text-slate-500 text-sm">Tidak ada data</p>
            )}
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="p-6">
        <h3 className="text-lg text-slate-900 mb-4">Detail Data Surat</h3>
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nomor Surat</TableHead>
                  <TableHead>Perihal</TableHead>
                  <TableHead>Perusahaan</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : surat.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      Tidak ada data sesuai filter
                    </TableCell>
                  </TableRow>
                ) : (
                  surat.map((suratItem, index) => (
                    <TableRow key={suratItem.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{suratItem.nomor_surat}</TableCell>
                      <TableCell className="max-w-xs truncate">{suratItem.perihal}</TableCell>
                      <TableCell>{suratItem.perusahaan_nama}</TableCell>
                      <TableCell>{suratItem.kategori_nama}</TableCell>
                      <TableCell>
                        {new Date(suratItem.tanggal).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        {!loading && surat.length > 0 && (
          <div className="mt-4 text-sm text-slate-600">
            Menampilkan {surat.length} surat
          </div>
        )}
      </Card>
    </div>
  );
}