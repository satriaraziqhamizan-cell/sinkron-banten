import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSinkron } from '../context/SinkronContext';
import { UserRole } from '../types/sinkron';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Building2,
  GraduationCap,
  Briefcase,
  Landmark,
  BookOpen,
  Users2,
  ShieldCheck,
  Globe,
  ExternalLink,
  RotateCcw,
  LogIn,
  LogOut,
  User,
  AlertCircle,
  Sparkles,
  X,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onNavigate }) => {
  const { currentUser, logout, isDemoData, activePeriod, isDemoModeAllowed } = useAuth();
  const { notifications, markNotificationsAsRead, resetAllData } = useSinkron();

  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('sinkron_demo_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    try {
      sessionStorage.setItem('sinkron_demo_banner_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  const activeRole: UserRole = currentUser ? currentUser.role : 'public';
  const unreadCount = notifications.filter((n) => !n.read).length;

  const roleLabels: Record<UserRole, { label: string; icon: React.ReactNode }> = {
    public: { label: 'Masyarakat / Publik', icon: <Globe className="w-4 h-4 text-slate-600" /> },
    alumni: { label: 'Alumni SMK/SMA', icon: <GraduationCap className="w-4 h-4 text-blue-700" /> },
    industry: { label: 'Perusahaan (HRD)', icon: <Briefcase className="w-4 h-4 text-amber-700" /> },
    school: { label: 'Sekolah (BKK SMK)', icon: <Building2 className="w-4 h-4 text-emerald-700" /> },
    disdik: { label: 'Dinas Pendidikan', icon: <Landmark className="w-4 h-4 text-blue-800" /> },
    disnaker: { label: 'Dinas Tenaga Kerja', icon: <Building2 className="w-4 h-4 text-indigo-700" /> },
    bappeda: { label: 'Bappeda Banten', icon: <Landmark className="w-4 h-4 text-purple-800" /> },
    akademisi: { label: 'Akademisi / Riset', icon: <BookOpen className="w-4 h-4 text-cyan-800" /> },
    koordinator: { label: 'Sekretariat Vokasi', icon: <Users2 className="w-4 h-4 text-rose-700" /> },
    admin: { label: 'Super Admin', icon: <ShieldCheck className="w-4 h-4 text-red-700" /> },
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Thin dismissible demo banner (only on first session visit, hidden if dismissed or non-demo) */}
      {(isDemoData || isDemoModeAllowed) && !bannerDismissed && (
        <div className="bg-amber-400 text-slate-950 px-3 sm:px-4 py-1 text-[11px] font-semibold border-b border-amber-500 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 mx-auto text-center">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Mode demo — data contoh untuk penjurian, bukan data resmi.</span>
          </div>
          <button
            onClick={handleDismissBanner}
            aria-label="Tutup pemberitahuan mode demo"
            className="p-0.5 hover:bg-amber-500 rounded text-slate-950 transition cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Official Top Governmental Ribbon */}
      <div className="bg-[#133E6E] text-white text-[11px] px-3 sm:px-4 py-1.5 font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="font-bold tracking-wider uppercase text-blue-200 shrink-0 text-[10px] sm:text-[11px]">
              PEMERINTAH PROVINSI BANTEN
            </span>
            <span className="text-blue-300 hidden xs:inline">|</span>
            <span className="text-slate-200 hidden md:inline truncate">
              Sistem Integrasi Kebutuhan Industri dan Kompetensi Vokasi
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-blue-950/60 px-2 py-0.5 rounded text-[10px] sm:text-[11px]">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-200">Periode:</span>
              <span className="font-bold text-amber-300">{activePeriod}</span>
            </div>

            {/* Small DEMO badge next to Period indicator with tooltip */}
            {isDemoData && (
              <div className="relative group">
                <button
                  type="button"
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded shadow-2xs tracking-wider cursor-help"
                  title="Data contoh untuk penjurian. Bukan data resmi."
                >
                  DEMO
                </button>
                <div className="absolute right-0 top-full mt-1 hidden group-hover:block group-focus:block z-50 w-52 p-2 bg-slate-900 text-slate-100 text-[11px] rounded shadow-md border border-slate-700 pointer-events-none text-left">
                  Data contoh untuk penjurian. Bukan data resmi.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Small Demo Active Bar */}
      {currentUser && isDemoModeAllowed && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-950 px-4 py-1 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
              <span>
                Anda masuk sebagai <strong>{roleLabels[activeRole]?.label || activeRole}</strong> (mode demo)
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-[11px]">
              <button
                onClick={() => onNavigate('demo')}
                className="text-blue-800 hover:text-blue-950 font-bold underline cursor-pointer"
              >
                Ganti peran
              </button>
              <span className="text-amber-300">|</span>
              <button
                onClick={() => {
                  logout();
                  onNavigate('beranda');
                }}
                className="text-rose-700 hover:text-rose-900 font-bold cursor-pointer"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Portal Identity */}
          <div
            onClick={() => onNavigate('beranda')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none min-w-0"
          >
            {!logoError ? (
              <img
                src="/brand/logo-mark-128.png"
                srcSet="/brand/logo-mark-128.png 1x, /brand/logo-mark-256.png 2x"
                alt="Logo SINKRON Banten"
                width="36"
                height="36"
                decoding="async"
                onError={() => setLogoError(true)}
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0"
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded bg-[#1F5FA8] flex items-center justify-center text-white font-extrabold text-sm sm:text-base shadow-sm border border-blue-900 group-hover:bg-[#164985] transition shrink-0">
                <span className="tracking-tighter">SKR</span>
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 truncate">
                  SINKRON <span className="text-[#1F5FA8]">Banten</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                  PROTOTIPE V1.0
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 leading-tight hidden md:block">
                Menyambungkan Sinyal Industri, Kurikulum Sekolah &amp; Pelacakan Lulusan
              </p>
            </div>
          </div>

          {/* User Account Controls (Replacing dropdown with Auth menu - Fase 2 #1) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Demo Link button for Jury */}
            {isDemoModeAllowed && (
              <button
                onClick={() => onNavigate('demo')}
                className={`px-2 sm:px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-bold transition flex items-center gap-1 sm:gap-1.5 shadow-2xs ${
                  currentTab === 'demo'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="hidden sm:inline">Demo untuk Juri</span>
                <span className="sm:hidden">Demo</span>
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markNotificationsAsRead();
                }}
                className="p-2 rounded-md hover:bg-slate-100 text-slate-600 transition relative"
                aria-label="Notifikasi Sistem"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 text-xs">
                  <div className="p-3 border-b border-slate-100 flex items-center justify-between font-bold text-slate-900">
                    <span>Notifikasi Transaksional</span>
                    <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {notifications.length} Pesan
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 hover:bg-slate-50 transition">
                        <p className="text-slate-800 leading-relaxed">{n.text}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Account Menu (Masuk/Keluar) */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-800 text-white flex items-center justify-center font-bold text-[10px]">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-slate-400 leading-none">
                      {roleLabels[currentUser.role]?.label || currentUser.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {showAccountDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-50 p-2 text-xs">
                    <div className="p-2 border-b border-slate-100 mb-1">
                      <span className="font-bold text-slate-900 block">{currentUser.name}</span>
                      <span className="text-[11px] text-slate-500">{currentUser.email}</span>
                      {currentUser.status === 'menunggu' && (
                        <span className="mt-1 inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                          Menunggu Verifikasi Legalitas
                        </span>
                      )}
                      <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span>2FA (TOTP):</span>
                        <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          Dalam pengembangan
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowAccountDropdown(false);
                        onNavigate('alumni_privasi');
                      }}
                      className="w-full text-left p-2 rounded hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>Profil &amp; Privasi Saya</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowAccountDropdown(false);
                        logout();
                        onNavigate('beranda');
                      }}
                      className="w-full text-left p-2 rounded hover:bg-rose-50 text-rose-700 flex items-center gap-2 mt-1 border-t border-slate-100"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('masuk')}
                  className="px-3.5 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk</span>
                </button>
                <button
                  onClick={() => onNavigate('daftar')}
                  className="px-3.5 py-1.5 rounded-md bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold transition shadow-xs"
                >
                  Daftar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role-Specific Navigation Tabs */}
      <div className="bg-slate-50 border-t border-slate-200 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1 scrollbar-none text-xs font-semibold">
          {/* Public / Unauthenticated Navigation */}
          {(!currentUser || currentUser.role === 'public') && (
            <>
              <button
                onClick={() => onNavigate('beranda')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'beranda' ? 'bg-[#1F5FA8] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'}`}
              >
                Beranda
              </button>
              <button
                onClick={() => onNavigate('dasbor_publik')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'dasbor_publik' ? 'bg-[#1F5FA8] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'}`}
              >
                Dasbor Publik &amp; Peta
              </button>
              <button
                onClick={() => onNavigate('lowongan_publik')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'lowongan_publik' ? 'bg-[#1F5FA8] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'}`}
              >
                Katalog Lowongan &amp; Magang
              </button>
              <button
                onClick={() => onNavigate('pelatihan_publik')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'pelatihan_publik' ? 'bg-[#1F5FA8] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'}`}
              >
                Pelatihan BLK Banten
              </button>
              <button
                onClick={() => onNavigate('cara_kerja')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'cara_kerja' ? 'bg-[#1F5FA8] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'}`}
              >
                Siklus &amp; Cara Kerja
              </button>
              <button
                onClick={() => onNavigate('ruang_media')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'ruang_media' ? 'bg-[#1F5FA8] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'}`}
              >
                Ruang Media &amp; Data
              </button>
              <button
                onClick={() => onNavigate('bantuan_faq')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'bantuan_faq' ? 'bg-[#1F5FA8] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'}`}
              >
                Pusat Bantuan &amp; FAQ
              </button>
              <button
                onClick={() => onNavigate('privasi_legal')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'privasi_legal' ? 'bg-[#1F5FA8] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'}`}
              >
                Privasi &amp; Syarat
              </button>
            </>
          )}

          {/* Authenticated Alumni Navigation */}
          {currentUser?.role === 'alumni' && (
            <>
              <button
                onClick={() => onNavigate('alumni_dashboard')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'alumni_dashboard' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Beranda Alumni
              </button>
              <button
                onClick={() => onNavigate('alumni_tracer')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'alumni_tracer' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Survei 6 Bulan
              </button>
              <button
                onClick={() => onNavigate('alumni_lowongan')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'alumni_lowongan' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Peluang Lowongan &amp; Magang
              </button>
              <button
                onClick={() => onNavigate('alumni_pelatihan')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'alumni_pelatihan' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Pelatihan BLK Daerah
              </button>
              <button
                onClick={() => onNavigate('alumni_privasi')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'alumni_privasi' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Privasi Saya (UU PDP)
              </button>
            </>
          )}

          {/* Authenticated Industry Navigation */}
          {currentUser?.role === 'industry' && (
            <>
              <button
                onClick={() => onNavigate('industry_signals')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'industry_signals' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Sinyal Kebutuhan Semesteran
              </button>
              <button
                onClick={() => onNavigate('industry_postings')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'industry_postings' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Kelola Lowongan &amp; Magang
              </button>
              <button
                onClick={() => onNavigate('industry_evaluations')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'industry_evaluations' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Penilaian Pengguna Lulusan
              </button>
              <button
                onClick={() => onNavigate('peta_kecocokan')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'peta_kecocokan' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Peta Kecocokan
              </button>
            </>
          )}

          {/* Authenticated School Navigation */}
          {currentUser?.role === 'school' && (
            <>
              <button
                onClick={() => onNavigate('school_programs')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'school_programs' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Jurusan &amp; Kurikulum
              </button>
              <button
                onClick={() => onNavigate('school_tracer')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'school_tracer' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Pelacak Lulusan (Tracer Study)
              </button>
              <button
                onClick={() => onNavigate('school_alumni_import')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'school_alumni_import' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Impor Alumni CSV
              </button>
              <button
                onClick={() => onNavigate('school_rapor')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'school_rapor' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Rapor Vokasi Sekolah
              </button>
              <button
                onClick={() => onNavigate('peta_kecocokan')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'peta_kecocokan' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Celah Kompetensi Jurusan
              </button>
            </>
          )}

          {/* Authenticated Government Navigation */}
          {(currentUser?.role === 'disdik' || currentUser?.role === 'disnaker' || currentUser?.role === 'bappeda') && (
            <>
              <button
                onClick={() => onNavigate('peta_kecocokan')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'peta_kecocokan' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Peta Kecocokan Vokasi &amp; Industri
              </button>
              <button
                onClick={() => onNavigate('dasbor_kebijakan')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'dasbor_kebijakan' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Dasbor Kebijakan Daerah (6 KPI)
              </button>
              <button
                onClick={() => onNavigate('rekomendasi_kebijakan')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'rekomendasi_kebijakan' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Tindak Lanjut &amp; Rekomendasi
              </button>
              <button
                onClick={() => onNavigate('pelatihan_blk_disnaker')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'pelatihan_blk_disnaker' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Pelatihan BLK Berbasis Celah
              </button>
              <button
                onClick={() => onNavigate('laporan_semester')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'laporan_semester' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Ekspor Laporan Resmi (PDF/CSV)
              </button>
            </>
          )}

          {/* Authenticated Academic Navigation */}
          {currentUser?.role === 'akademisi' && (
            <>
              <button
                onClick={() => onNavigate('kamus_kompetensi')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'kamus_kompetensi' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Kamus Kompetensi SKKNI/KKNI
              </button>
              <button
                onClick={() => onNavigate('antrean_tinjauan_kamus')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'antrean_tinjauan_kamus' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Antrean Tinjauan Usulan
              </button>
              <button
                onClick={() => onNavigate('data_riset_teranonim')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'data_riset_teranonim' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Permintaan Akses Data Riset
              </button>
            </>
          )}

          {/* Authenticated Pentahelix Coordinator Navigation */}
          {currentUser?.role === 'koordinator' && (
            <>
              <button
                onClick={() => onNavigate('forum_pentahelix')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'forum_pentahelix' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Direktori &amp; Agenda Forum 5 Unsur
              </button>
              <button
                onClick={() => onNavigate('repositori_mou')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'repositori_mou' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Repositori Kesepakatan (MoU/PKS)
              </button>
              <button
                onClick={() => onNavigate('rekomendasi_kebijakan')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'rekomendasi_kebijakan' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Papan Tindak Lanjut Bersama
              </button>
            </>
          )}

          {/* Authenticated Admin Navigation */}
          {currentUser?.role === 'admin' && (
            <>
              <button
                onClick={() => onNavigate('admin_console')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'admin_console' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Verifikasi Institusi
              </button>
              <button
                onClick={() => onNavigate('admin_periode')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'admin_periode' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Konfigurasi Periode &amp; Ambang
              </button>
              <button
                onClick={() => onNavigate('admin_audit')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'admin_audit' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Audit Log Sistem
              </button>
              <button
                onClick={() => onNavigate('peta_kecocokan')}
                className={`px-3 py-2 rounded-md transition ${currentTab === 'peta_kecocokan' ? 'bg-[#1F5FA8] text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}
              >
                Peta Kecocokan
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
