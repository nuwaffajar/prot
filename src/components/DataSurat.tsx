import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { 
  Search, Filter, Download, Trash2, Eye, Edit, FileText, Upload, X,
  Calendar, Building, Tag, User, FileUp, CheckCircle2, Lock, Info,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { getAuthUser, isSuperAdmin } from '../utils/auth';
import { apiServices } from '../services/apiServices';
import type { Surat, Perusahaan, KategoriSurat } from '../utils/types';
import { toast } from 'sonner';

// 🆕 Import komponen pagination
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from './ui/pagination';

interface DataSuratProps {
  onNavigate: (page: string) => void;
}

export function DataSurat({ onNavigate }: DataSuratProps) {
  const user = getAuthUser();
  const isSuperAdminUser = isSuperAdmin();
  
  // State untuk filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPerusahaan, setFilterPerusahaan] = useState('all');
  const [filterKategori, setFilterKategori] = useState('all');
  const [filterTahun, setFilterTahun] = useState('all');
  
  // State untuk operasi CRUD
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // State untuk modal view/edit
  const [selectedSurat, setSelectedSurat] = useState<Surat | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | null>(null);
  const [editForm, setEditForm] = useState({
    perihal: '',
    tujuan: '',
  });
  const [editLoading, setEditLoading] = useState(false);
  
  // State untuk data
  const [allSurat, setAllSurat] = useState<Surat[]>([]); // 🆕 Semua data
  const [surat, setSurat] = useState<Surat[]>([]); // 🆕 Data yang ditampilkan (dengan pagination)
  const [perusahaan, setPerusahaan] = useState<Perusahaan[]>([]);
  const [kategori, setKategori] = useState<KategoriSurat[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🆕 State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch data pertama kali
  useEffect(() => {
    fetchAllData();
    fetchFilters();
  }, []);

  // Fetch data saat filter berubah (reset ke halaman 1)
  useEffect(() => {
    if (!loading) {
      setCurrentPage(1);
      fetchAllData();
    }
  }, [searchQuery, filterPerusahaan, filterKategori, filterTahun]);

  // 🆕 Fungsi untuk fetch semua data (tanpa pagination)
  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const filters: any = {};
      if (searchQuery) filters.search = searchQuery;
      if (filterPerusahaan !== 'all') filters.perusahaan = filterPerusahaan;
      if (filterKategori !== 'all') filters.kategori = filterKategori;
      if (filterTahun !== 'all') filters.tahun = filterTahun;
      
      console.log('📡 Fetching all data with filters:', filters);
      
      const response = await apiServices.surat.getAll(filters);
      
      if (response.data.success) {
        const allData = response.data.data;
        console.log('📦 Total data from API:', allData.length);
        
        setAllSurat(allData);
        setTotalItems(allData.length);
        
        // Apply pagination ke data
        applyPagination(allData);
      } else {
        console.error('❌ API tidak sukses:', response.data);
        toast.error('Gagal memuat data surat');
      }
    } catch (error: any) {
      console.error('Error fetching surat:', error);
      toast.error('Gagal memuat data surat');
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Fungsi untuk apply pagination ke data
  const applyPagination = (data: Surat[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);
    
    const totalPages = Math.ceil(data.length / itemsPerPage);
    
    console.log('🔢 Pagination info:', {
      currentPage,
      itemsPerPage,
      totalData: data.length,
      startIndex,
      endIndex,
      paginatedDataLength: paginatedData.length,
      totalPages
    });
    
    setSurat(paginatedData);
    setTotalPages(totalPages);
  };

  // 🆕 Fungsi untuk fetch filters
  const fetchFilters = async () => {
    try {
      const [perusahaanResponse, kategoriResponse, yearsResponse] = await Promise.all([
        apiServices.perusahaan.getAll(),
        apiServices.kategori.getAll(),
        apiServices.surat.getAvailableYears()
      ]);

      if (perusahaanResponse.data.success) setPerusahaan(perusahaanResponse.data.data);
      if (kategoriResponse.data.success) setKategori(kategoriResponse.data.data);
      if (yearsResponse.data.success) setYears(yearsResponse.data.data);
    } catch (error: any) {
      console.error('Error fetching filters:', error);
      toast.error('Gagal memuat data filter');
    }
  };

  // 🆕 Fungsi untuk handle perubahan halaman
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    console.log('🔄 Changing to page:', page);
    setCurrentPage(page);
    
    // Apply pagination ke allSurat
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = allSurat.slice(startIndex, endIndex);
    
    setSurat(paginatedData);
    
    // Scroll ke atas tabel
    const tableElement = document.querySelector('[data-slot="table"]');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 🆕 PERBAIKAN: Fungsi untuk handle perubahan items per page
  const handleItemsPerPageChange = (value: string) => {
    const numValue = parseInt(value);
    console.log('📊 Changing items per page to:', numValue);
    
    setItemsPerPage(numValue);
    setCurrentPage(1); // reset ke halaman pertama
    
    // Re-apply pagination dengan itemsPerPage baru
    const startIndex = 0;
    const endIndex = numValue;
    const paginatedData = allSurat.slice(startIndex, endIndex);
    
    setSurat(paginatedData);
    setTotalPages(Math.ceil(allSurat.length / numValue));
  };

  // 🆕 Fungsi untuk generate page numbers dengan ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 2; // jumlah halaman sebelum dan sesudah current page
    
    console.log('🔢 Generating page numbers:', { totalPages, currentPage });
    
    if (totalPages <= 1) return [1];
    
    // Always show first page
    pages.push(1);
    
    // Calculate range
    let start = Math.max(2, currentPage - delta);
    let end = Math.min(totalPages - 1, currentPage + delta);
    
    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('...');
    }
    
    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (end < totalPages - 1) {
      pages.push('...');
    }
    
    // Always show last page if there is more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages.filter((page, index, array) => 
      page === '...' || array.indexOf(page) === index
    );
  };

  // Fungsi untuk buka modal view
  const openViewModal = (suratItem: Surat) => {
    setSelectedSurat(suratItem);
    setModalMode('view');
  };

  // Fungsi untuk buka modal edit
  const openEditModal = (suratItem: Surat) => {
    setSelectedSurat(suratItem);
    setModalMode('edit');
    setEditForm({
      perihal: suratItem.perihal,
      tujuan: suratItem.tujuan,
    });
  };

  // Fungsi untuk tutup modal
  const closeModal = () => {
    setSelectedSurat(null);
    setModalMode(null);
    setEditForm({
      perihal: '',
      tujuan: '',
    });
  };

  // Fungsi untuk handle edit surat
  const handleEditSurat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSurat) return;
    
    setEditLoading(true);
    try {
      const payload: any = {
        perihal: editForm.perihal.trim(),
        tujuan: editForm.tujuan.trim(),
      };
      
      const response = await apiServices.surat.update(selectedSurat.id, payload);
      
      if (response.data.success) {
        toast.success('Surat berhasil diperbarui', {
          description: 'Perihal dan tujuan telah diupdate.',
          duration: 4000
        });
        
        // Update data di state
        setAllSurat(allSurat.map(s => 
          s.id === selectedSurat.id 
            ? { 
                ...s, 
                perihal: editForm.perihal,
                tujuan: editForm.tujuan,
              }
            : s
        ));
        
        // Re-apply pagination
        applyPagination(allSurat.map(s => 
          s.id === selectedSurat.id 
            ? { 
                ...s, 
                perihal: editForm.perihal,
                tujuan: editForm.tujuan,
              }
            : s
        ));
        
        closeModal();
      } else {
        toast.error(response.data.error || 'Gagal memperbarui surat');
      }
    } catch (error: any) {
      console.error('Error updating surat:', error);
      toast.error(error.response?.data?.error || 'Terjadi kesalahan saat memperbarui surat');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await apiServices.surat.delete(id);
      if (response.data.success) {
        toast.success('Surat berhasil dihapus');
        
        // Update allSurat
        const updatedAllSurat = allSurat.filter(s => s.id !== id);
        setAllSurat(updatedAllSurat);
        setTotalItems(updatedAllSurat.length);
        
        // Jika setelah hapus data kurang dari threshold, pindah ke halaman sebelumnya
        if (surat.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
          handlePageChange(currentPage - 1);
        } else {
          // Re-apply pagination
          applyPagination(updatedAllSurat);
        }
        
        setDeleteId(null);
      } else {
        toast.error(response.data.error || 'Gagal menghapus surat');
      }
    } catch {
      toast.error('Gagal menghapus surat');
    }
  };

  const handleUploadBukti = async () => {
    if (!selectedFile || !uploadingId) return;

    try {
      const response = await apiServices.surat.uploadBukti(uploadingId, selectedFile);
      if (response.data.success) {
        toast.success('Bukti surat berhasil diupload');
        setAllSurat(allSurat.map(s => 
          s.id === uploadingId 
            ? { ...s, bukti_file: response.data.data?.file_url }
            : s
        ));
        applyPagination(allSurat.map(s => 
          s.id === uploadingId 
            ? { ...s, bukti_file: response.data.data?.file_url }
            : s
        ));
        setSelectedFile(null);
        setUploadingId(null);
      } else {
        toast.error(response.data.error || 'Gagal upload bukti');
      }
    } catch {
      toast.error('Gagal upload bukti');
    }
  };

  const handleExport = () => {
    toast.info('Export fitur tersedia di halaman Laporan');
    onNavigate('laporan');
  };

  const filteredPerusahaan = useMemo(() => {
    if (isSuperAdminUser) return perusahaan;
    return perusahaan.filter(p => p.id === user?.perusahaan_id);
  }, [perusahaan, isSuperAdminUser, user]);

  // 🆕 Komponen PaginationControls
  const PaginationControls = () => {
    if (totalPages <= 1 || loading) return null;

    console.log('🎯 Rendering pagination controls:', { totalPages, totalItems, currentPage });

    return (
      <div className="mt-6 space-y-4">
        {/* Pagination Component */}
        <Pagination>
          <PaginationContent>
            {/* First Page Button */}
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(1);
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                title="Halaman pertama"
              />
            </PaginationItem>

            {/* Previous Page Button */}
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                title="Halaman sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </PaginationLink>
            </PaginationItem>

            {/* Page Numbers with Ellipsis */}
            {getPageNumbers().map((page, index) => (
              <PaginationItem key={index}>
                {page === '...' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page as number);
                    }}
                    isActive={currentPage === page}
                    className="cursor-pointer min-w-[40px] justify-center"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            {/* Next Page Button */}
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) handlePageChange(currentPage + 1);
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                title="Halaman berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </PaginationLink>
            </PaginationItem>

            {/* Last Page Button */}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) handlePageChange(totalPages);
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                title="Halaman terakhir"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        {/* Items per page selector and info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span className="text-slate-700">Items per page:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value: string) => handleItemsPerPageChange(value)}
            >
              <SelectTrigger className="w-[80px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-center sm:text-right">
            <p className="text-slate-700">
              Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>-
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, totalItems)}
              </span> dari <span className="font-medium">{totalItems}</span> surat
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Halaman <span className="font-medium">{currentPage}</span> dari{' '}
              <span className="font-medium">{totalPages}</span>
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl text-slate-900 mb-1">Data Surat</h2>
          <p className="text-slate-600">Kelola semua surat yang telah dibuat</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => onNavigate('tambah-surat')}>
            <FileText className="w-4 h-4 mr-2" />
            Tambah Surat
          </Button>
        </div>
      </div>

      {/* Filter & Table */}
      <Card className="p-6">
        <div className="space-y-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Cari nomor surat, perihal, atau tujuan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => e.key === 'Enter' && fetchAllData()}
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select value={filterPerusahaan} onValueChange={setFilterPerusahaan}>
              <SelectTrigger>
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Perusahaan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Perusahaan</SelectItem>
                {filteredPerusahaan.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterKategori} onValueChange={setFilterKategori}>
              <SelectTrigger>
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {kategori.map((k) => (
                  <SelectItem key={k.id} value={k.id.toString()}>{k.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterTahun} onValueChange={setFilterTahun}>
              <SelectTrigger>
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahun</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => fetchAllData()} 
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Memuat...' : 'Terapkan Filter'}
            </Button>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setFilterPerusahaan('all');
              setFilterKategori('all');
              setFilterTahun('all');
              fetchAllData();
            }}>
              Reset
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full table-fixed" data-slot="table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%] lg:w-[22%] xl:w-[20%]">Nomor Surat</TableHead>
                  <TableHead className="w-[20%] lg:w-[25%] xl:w-[25%]">Perihal</TableHead>
                  <TableHead className="w-[15%] lg:w-[18%] xl:w-[15%]">Perusahaan</TableHead>
                  <TableHead className="w-[12%] lg:w-[10%] xl:w-[12%]">Kategori</TableHead>
                  <TableHead className="w-[13%] lg:w-[10%] xl:w-[13%]">Tanggal</TableHead>
                  <TableHead className="w-[15%] lg:w-[15%] xl:w-[15%] text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-600">Memuat data surat...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : surat.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <FileText className="w-16 h-16 opacity-30" />
                        <div>
                          <p className="font-medium text-slate-700">Tidak ada data surat</p>
                          <p className="text-sm text-slate-500 mt-1">
                            {searchQuery || filterPerusahaan !== 'all' || filterKategori !== 'all' || filterTahun !== 'all' 
                              ? 'Coba ubah filter pencarian Anda' 
                              : 'Tambahkan surat pertama Anda'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  surat.map((suratItem) => (
                    <TableRow key={suratItem.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium font-mono text-sm truncate" title={suratItem.nomor_surat}>
                        {suratItem.nomor_surat}
                      </TableCell>
                      <TableCell className="truncate" title={suratItem.perihal}>
                        <div className="truncate">{suratItem.perihal}</div>
                      </TableCell>
                      <TableCell className="truncate" title={suratItem.perusahaan_nama}>
                        {suratItem.perusahaan_nama}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full truncate inline-block max-w-full">
                          {suratItem.kategori_nama}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm truncate">
                        {new Date(suratItem.tanggal).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openViewModal(suratItem)}
                            title="Lihat Detail"
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditModal(suratItem)}
                            title="Edit Surat (Hanya perihal & tujuan)"
                            className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setUploadingId(suratItem.id)}
                            title="Upload Bukti"
                            className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-700"
                          >
                            <Upload className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setDeleteId(suratItem.id)}
                            title="Hapus Surat"
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* 🆕 Debug Info - Hapus ini setelah testing 
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 font-medium">Debug Info:</p>
          <div className="text-xs text-yellow-700 mt-1 grid grid-cols-2 gap-1">
            <span>Total Data: {allSurat.length}</span>
            <span>Displayed: {surat.length}</span>
            <span>Total Pages: {totalPages}</span>
            <span>Current Page: {currentPage}</span>
            <span>Items Per Page: {itemsPerPage}</span>
            <span>Total Items: {totalItems}</span>
          </div>
        </div>
        */}

        {/* 🆕 Pagination Controls */}
        {!loading && totalItems > itemsPerPage && <PaginationControls />}
        
        {/* Info footer */}
        {!loading && surat.length > 0 && (
          <div className="mt-4 text-sm text-slate-600 flex justify-between items-center pt-4 border-t">
            <span className="text-slate-700">
              Total ditemukan: <span className="font-medium">{totalItems}</span> surat
            </span>
            <span className="text-xs text-slate-400">
              Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID')}
            </span>
          </div>
        )}
      </Card>

      {/* 🆕 MODAL VIEW SURAT */}
      <Dialog open={modalMode === 'view' && !!selectedSurat} onOpenChange={closeModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Detail Surat
              </DialogTitle>
            </div>
            <DialogDescription>
              Informasi lengkap surat
            </DialogDescription>
          </DialogHeader>

          {selectedSurat && (
            <div className="space-y-6 py-2">
              {/* Nomor Surat Highlight */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">Nomor Surat</p>
                    <h3 className="text-2xl font-bold text-blue-900 font-mono tracking-tight">
                      {selectedSurat.nomor_surat}
                    </h3>
                  </div>
                  {selectedSurat.bukti_file && (
                    <a 
                      href={selectedSurat.bukti_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <FileUp className="w-4 h-4" />
                      Lihat Bukti
                    </a>
                  )}
                </div>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Building className="w-4 h-4" />
                      <span className="text-sm font-medium">Perusahaan</span>
                    </div>
                    <p className="font-medium text-slate-900">{selectedSurat.perusahaan_nama}</p>
                    <p className="text-xs text-slate-500 mt-1">Kode: {selectedSurat.perusahaan_kode}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Tag className="w-4 h-4" />
                      <span className="text-sm font-medium">Kategori</span>
                    </div>
                    <p className="font-medium text-slate-900">{selectedSurat.kategori_nama}</p>
                    <p className="text-xs text-slate-500 mt-1">Kode: {selectedSurat.kategori_kode}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Tanggal</span>
                    </div>
                    <p className="font-medium text-slate-900">
                      {new Date(selectedSurat.tanggal).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">Dibuat Oleh</span>
                    </div>
                    <p className="font-medium text-slate-900">
                      {selectedSurat.created_by_name || 'Tidak diketahui'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Perihal */}
              <div>
                <Label className="text-slate-700 mb-2 block">Perihal</Label>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-slate-900 font-medium">{selectedSurat.perihal}</p>
                </div>
              </div>

              {/* Tujuan */}
              <div>
                <Label className="text-slate-700 mb-2 block">Tujuan Surat</Label>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 whitespace-pre-line">
                  <p className="text-slate-900">{selectedSurat.tujuan}</p>
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={closeModal}>Tutup</Button>
                <Button onClick={() => {
                  closeModal();
                  openEditModal(selectedSurat);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Surat
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 🆕 MODAL EDIT SURAT */}
      <Dialog open={modalMode === 'edit' && !!selectedSurat} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl flex items-center gap-2">
                <Edit className="w-5 h-5 text-green-600" />
                Edit Surat
              </DialogTitle>
            </div>
            <DialogDescription>
              Ubah data surat. <span className="text-amber-600 font-medium">Kategori, perusahaan, dan tanggal tidak dapat diubah.</span>
            </DialogDescription>
          </DialogHeader>

          {selectedSurat && (
            <form onSubmit={handleEditSurat} className="space-y-5 py-2">
              {/* Nomor Surat (Read-only) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Nomor Surat</p>
                    <h3 className="text-xl font-bold text-slate-900 font-mono">
                      {selectedSurat.nomor_surat}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Nomor tetap, tidak dapat diubah</span>
                  </div>
                </div>
                
                {/* 🆕 Warning tentang field yang tidak bisa diubah */}
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-xs text-slate-600">
                    <span className="font-medium">Format:</span> {selectedSurat.nomor_surat}
                    <br />
                    <span className="text-amber-600">⚠️ Kategori, perusahaan, dan tanggal terkunci untuk menjaga konsistensi nomor surat.</span>
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Perusahaan (Read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="edit-perusahaan">
                    Perusahaan <span className="text-slate-400">(Tidak dapat diubah)</span>
                  </Label>
                  <div className="relative">
                    <Select 
                      value={selectedSurat.perusahaan_id.toString()} 
                      disabled={true}
                    >
                      <SelectTrigger id="edit-perusahaan" className="bg-slate-50 cursor-not-allowed">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-slate-400" />
                            <span>{selectedSurat.perusahaan_nama}</span>
                            <span className="text-slate-400">({selectedSurat.perusahaan_kode})</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={selectedSurat.perusahaan_id.toString()}>
                          {selectedSurat.perusahaan_nama} ({selectedSurat.perusahaan_kode})
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Kategori (Read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="edit-kategori">
                    Kategori Surat <span className="text-slate-400">(Tidak dapat diubah)</span>
                  </Label>
                  <div className="relative">
                    <Select 
                      value={selectedSurat.kategori_id.toString()} 
                      disabled={true}
                    >
                      <SelectTrigger id="edit-kategori" className="bg-slate-50 cursor-not-allowed">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-slate-400" />
                            <span>{selectedSurat.kategori_nama}</span>
                            <span className="text-slate-400">({selectedSurat.kategori_kode})</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={selectedSurat.kategori_id.toString()}>
                          {selectedSurat.kategori_nama} ({selectedSurat.kategori_kode})
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Tanggal (Read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="edit-tanggal">
                    Tanggal Surat <span className="text-slate-400">(Tidak dapat diubah)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit-tanggal"
                      type="date"
                      value={selectedSurat.tanggal.split('T')[0]}
                      disabled={true}
                      className="bg-slate-50 cursor-not-allowed"
                      readOnly
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Info tentang field yang bisa diedit */}
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    <Info className="w-4 h-4 inline mr-2" />
                    Field yang dapat diedit:
                  </p>
                  <ul className="text-xs text-blue-600 space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <span>Perihal - Konten utama surat</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <span>Tujuan - Penerima surat</span>
                    </li>
                  </ul>
                </div>

                {/* Perihal (Editable) */}
                <div className="space-y-2">
                  <Label htmlFor="edit-perihal">
                    Perihal <span className="text-red-500">*</span>
                    <span className="ml-2 text-xs text-green-600 font-medium">(Dapat diedit)</span>
                  </Label>
                  <Input
                    id="edit-perihal"
                    type="text"
                    placeholder="Masukkan perihal surat"
                    value={editForm.perihal}
                    onChange={(e) => setEditForm({...editForm, perihal: e.target.value})}
                    required
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                  <p className="text-xs text-slate-500">
                    Deskripsi singkat tentang isi surat
                  </p>
                </div>

                {/* Tujuan (Editable) */}
                <div className="space-y-2">
                  <Label htmlFor="edit-tujuan">
                    Tujuan Surat <span className="text-red-500">*</span>
                    <span className="ml-2 text-xs text-green-600 font-medium">(Dapat diedit)</span>
                  </Label>
                  <Textarea
                    id="edit-tujuan"
                    placeholder="Masukkan tujuan surat"
                    value={editForm.tujuan}
                    onChange={(e) => setEditForm({...editForm, tujuan: e.target.value})}
                    rows={5}
                    required
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                  <p className="text-xs text-slate-500">
                    Alamat/nama penerima surat
                  </p>
                </div>
              </div>

              <DialogFooter className="pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={closeModal}
                  disabled={editLoading}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={editLoading || !editForm.perihal || !editForm.tujuan}
                  className="min-w-[120px] bg-green-600 hover:bg-green-700"
                >
                  {editLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Perubahan'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus surat ini? Tindakan ini tidak dapat dibatalkan.
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

      {/* Upload Bukti Dialog */}
      <AlertDialog open={uploadingId !== null} onOpenChange={(open) => !open && setUploadingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upload Bukti Surat (Optional)</AlertDialogTitle>
            <AlertDialogDescription>
              File maksimal 500MB. Format: PDF, DOCX, JPG, PNG.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-5 flex items-center gap-3">
            <label
              htmlFor="upload-bukti"
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition-all"
            >
              <Upload className="w-4 h-4 mr-2" />
              Pilih File
            </label>
            <input
              id="upload-bukti"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />

            {selectedFile ? (
              <p className="text-sm text-slate-700 border border-slate-200 rounded-md px-3 py-2 bg-slate-50 flex-1 truncate">
                📄 {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            ) : (
              <p className="text-sm text-slate-500 italic flex-1 border border-dashed border-slate-300 rounded-md px-3 py-2 bg-slate-50">
                Belum ada file dipilih
              </p>
            )}
          </div>

          <AlertDialogFooter className="mt-5">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleUploadBukti}>Upload</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}