// src/App.tsx
import { useEffect, useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { DashboardLayout } from "./components/DashboardLayout";
import { DashboardHome } from "./components/DashboardHome";
import { DataSurat } from "./components/DataSurat";
import { TambahSurat } from "./components/TambahSurat";
import { KategoriSurat } from "./components/KategoriSurat";
import { ManajemenPengguna } from "./components/ManajemenPengguna";
import { DataPerusahaan } from "./components/DataPerusahaan";
import { LaporanSurat } from "./components/LaporanSurat";
import { PengaturanSistem } from "./components/PengaturanSistem";
import { ProfilSaya } from "./components/ProfilSaya";
import { isAuthenticated, getAuthUser } from "./utils/auth";

type Page =
  | "login"
  | "register"
  | "dashboard"
  | "data-surat"
  | "tambah-surat"
  | "kategori-surat"
  | "manajemen-pengguna"
  | "data-perusahaan"
  | "laporan"
  | "pengaturan"
  | "profil";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = () => {
      const auth = isAuthenticated();
      setAuthenticated(auth);
      
      if (auth) {
        const user = getAuthUser();
        if (user) {
          setCurrentPage("dashboard");
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setAuthenticated(true);
    setCurrentPage("dashboard");
  };

  const handleRegisterSuccess = () => {
    setCurrentPage("login");
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setCurrentPage("login");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  // Render login/register pages
  if (!authenticated) {
    if (currentPage === "register") {
      return (
        <>
          <RegisterPage
            onRegisterSuccess={handleRegisterSuccess}
            onNavigateToLogin={() => setCurrentPage("login")}
          />
          <Toaster />
        </>
      );
    }

    return (
      <>
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={() => setCurrentPage("register")}
        />
        <Toaster />
      </>
    );
  }

  // Render dashboard pages
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardHome onNavigate={handleNavigate} />;
      case "data-surat":
        return <DataSurat onNavigate={handleNavigate} />;
      case "tambah-surat":
        return <TambahSurat onNavigate={handleNavigate} />;
      case "kategori-surat":
        return <KategoriSurat />;
      case "manajemen-pengguna":
        return <ManajemenPengguna />;
      case "data-perusahaan":
        return <DataPerusahaan />;
      case "laporan":
        return <LaporanSurat />;
      case "pengaturan":
        return <PengaturanSistem />;
      case "profil":
        return <ProfilSaya />;
      default:
        return <DashboardHome onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <DashboardLayout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        {renderPage()}
      </DashboardLayout>
      <Toaster />
    </>
  );
}