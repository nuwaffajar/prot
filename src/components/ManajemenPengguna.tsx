import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { getAuthUser } from "../utils/auth";
import { apiServices } from "../services/apiServices";
import type { User, UserRole, Perusahaan } from "../utils/types";
import { Plus, Trash2, Edit, Users as UsersIcon, Key } from "lucide-react";
import { toast } from "sonner";

export function ManajemenPengguna() {
  const currentUser = getAuthUser();
  const [users, setUsers] = useState<User[]>([]);
  const [perusahaan, setPerusahaan] = useState<Perusahaan[]>([]);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("admin");
  const [perusahaanId, setPerusahaanId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch users
      const usersResponse = await apiServices.users.getAll();
      if (usersResponse.data.success) {
        setUsers(usersResponse.data.data);
      }

      // Fetch perusahaan
      const perusahaanResponse = await apiServices.perusahaan.getAll();
      if (perusahaanResponse.data.success) {
        setPerusahaan(perusahaanResponse.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("admin");
    setPerusahaanId("");
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPassword(""); // leave empty unless changed
    setRole(user.role);
    setPerusahaanId(user.perusahaan_id?.toString() || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("admin");
    setPerusahaanId("");
  };

  const handleSave = async () => {
    if (!currentUser) {
      toast.error("Anda belum terautentikasi");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        // edit
        const data: any = { name, email, role };
        if (password) data.password = password;
        if (perusahaanId) data.perusahaan_id = parseInt(perusahaanId);
        
        const response = await apiServices.users.update(editingId, data);
        if (response.data.success) {
          toast.success("Pengguna berhasil diubah");
          fetchData();
          closeModal();
        } else {
          toast.error(response.data.error || "Gagal mengubah pengguna");
        }
      } else {
        // create
        const data: any = { 
          name, 
          email, 
          password, 
          role 
        };
        if (perusahaanId) data.perusahaan_id = parseInt(perusahaanId);
        
        const response = await apiServices.users.create(data);
        if (response.data.success) {
          toast.success("Pengguna berhasil ditambahkan");
          fetchData();
          closeModal();
        } else {
          toast.error(response.data.error || "Gagal menambah pengguna");
        }
      }
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast.error(error.response?.data?.error || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!currentUser) return;
    
    if (id === currentUser.id) {
      toast.error("Anda tidak dapat menghapus akun Anda sendiri");
      return;
    }

    if (!confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      return;
    }

    try {
      const response = await apiServices.users.delete(id);
      if (response.data.success) {
        toast.success("Pengguna berhasil dihapus");
        setUsers(users.filter(u => u.id !== id));
      } else {
        toast.error(response.data.error || "Gagal menghapus pengguna");
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.error || "Terjadi kesalahan");
    }
  };

  const handleResetPassword = async (id: number) => {
    if (!currentUser) return;
    
    const newPassword = "admin123";
    if (!confirm(`Reset password untuk pengguna ini menjadi "${newPassword}"?`)) {
      return;
    }

    try {
      const response = await apiServices.users.resetPassword(id, newPassword);
      if (response.data.success) {
        toast.success(`Password berhasil direset ke: ${newPassword}`);
      } else {
        toast.error(response.data.error || "Gagal reset password");
      }
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.error || "Terjadi kesalahan");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Manajemen Pengguna</h2>
          <p className="text-sm text-slate-600">Kelola akun Admin & Super Admin</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Pengguna
        </Button>
      </div>

      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-2 text-left">Nama</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Perusahaan</th>
                <th className="p-2 text-left">Dibuat</th>
                <th className="p-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <UsersIcon className="w-12 h-12 mx-auto opacity-40" />
                    <div className="text-slate-600 mt-2">Tidak ada data pengguna</div>
                  </td>
                </tr>
              ) : (
                users.map(u => {
                  const perusahaanItem = perusahaan.find(p => p.id === u.perusahaan_id);
                  return (
                    <tr key={u.id} className="border-t">
                      <td className="p-2">{u.name}</td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2">{u.role === "super_admin" ? "Super Admin" : "Admin"}</td>
                      <td className="p-2">{perusahaanItem ? perusahaanItem.nama : "-"}</td>
                      <td className="p-2">{new Date(u.created_at).toLocaleDateString("id-ID")}</td>
                      <td className="p-2 text-right">
                        <div className="inline-flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleResetPassword(u.id)} 
                            title="Reset Password"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openEditModal(u)} 
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(u.id)} 
                            disabled={u.id === currentUser?.id} 
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Simple modal - overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6 z-10">
            <h3 className="text-lg font-medium mb-4">{editingId ? "Edit Pengguna" : "Tambah Pengguna Baru"}</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nama</Label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Nama lengkap" 
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="email@example.com" 
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Password {editingId ? "(kosongkan jika tidak diubah)" : ""}</Label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder={editingId ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"} 
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <select 
                  className="w-full border rounded p-2" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  disabled={loading}
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              {role === "admin" && (
                <div className="space-y-2">
                  <Label>Perusahaan (opsional)</Label>
                  <select 
                    className="w-full border rounded p-2" 
                    value={perusahaanId} 
                    onChange={(e) => setPerusahaanId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Tidak ada</option>
                    {perusahaan.map(p => <option key={p.id} value={p.id.toString()}>{p.nama}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={closeModal} disabled={loading}>
                Batal
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!name || !email || (!editingId && !password) || loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Menyimpan...
                  </>
                ) : editingId ? "Simpan" : "Tambah"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManajemenPengguna;