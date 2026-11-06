import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { UserRole } from '../types/sinkron';
import {
  Users,
  GraduationCap,
  Building2,
  School,
  Briefcase,
  FileCheck2,
  TrendingUp,
  BookOpen,
  Compass,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Play,
  Layers,
} from 'lucide-react';

interface DemoPageProps {
  onNavigate: (tab: string) => void;
}

interface DemoRoleCard {
  role: UserRole;
  title: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  summary: string;
  accessibleMenus: string[];
  defaultTab: string;
  seedAccountNote: string;
}

export const DemoPage: React.FC<DemoPageProps> = ({ onNavigate }) => {
  const { currentUser, demoLogin, isDemoModeAllowed, logout } = useAuth();
  const { showToast } = useToast();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleRoleSelect = async (role: string, targetTab: string) => {
    try {
      setLoadingRole(role);
      const user = await demoLogin(role);
      onNavigate(targetTab);
    } catch (err: any) {
      showToast('Gagal Masuk Demo', err.message || 'Terjadi kesalahan saat masuk mode demo.', 'error');
    } finally {
      setLoadingRole(null);
    }
  };

  const roleCards: DemoRoleCard[] = [
    {
      role: 'public',
      title: 'Masyarakat & Publik Umum',
      badge: 'Tanpa Login',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
      icon: <Users className="w-5 h-5 text-slate-700" />,
      summary:
        'Akses terbuka bagi masyarakat luas untuk memantau agregat statistik ketenagakerjaan daerah, bursa lowongan & magang industri yang terverifikasi, serta direktori program pelatihan vokasi UPTD BLK se-Provinsi Banten.',
      accessibleMenus: [
        'Beranda Resmi SINKRON',
        'Dasbor Publik Agregat Banten',
        'Bursa Lowongan & Magang Kerja',
        'Katalog Pelatihan UPTD BLK Daerah',
        'Kamus Kompetensi Kerja Terbuka',
      ],
      defaultTab: 'beranda',
      seedAccountNote: 'Sesi publik terbuka tanpa kredensial.',
    },
    {
      role: 'alumni',
      title: 'Alumni SMK / SMA Banten',
      badge: 'Pencari Kerja & Pekerja',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <GraduationCap className="w-5 h-5 text-blue-700" />,
      summary:
        'Lulusan vokasi yang berpartisipasi dalam penelusuran lulusan (tracer study) 6 bulan, menyampaikan evaluasi relevansi materi ajar, mengelola hak privasi data (UU PDP), dan mengakses bursa kerja terpercaya.',
      accessibleMenus: [
        'Pengisian Tracer Study 6 Bulan (3 Menit)',
        'Dasbor Portofolio Alumni & Status Kerja',
        'Bursa Lowongan Terverifikasi Bebas Calo',
        'Pendaftaran Pelatihan BLK Daerah Gratis',
        'Kelola Izin & Ekspor Salinan Data (UU PDP)',
      ],
      defaultTab: 'alumni_tracer',
      seedAccountNote: 'Alumni SMKN 1 Cilegon (Kohort 2025)',
    },
    {
      role: 'industry',
      title: 'Perusahaan & HRD Industri Kawasan',
      badge: 'Mitra Usaha & Industri',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: <Building2 className="w-5 h-5 text-amber-700" />,
      summary:
        'Pelaku usaha di 8 kabupaten/kota yang menyampaikan proyeksi kebutuhan tenaga kerja dan kompetensi teknis terstandar untuk memandu kurikulum SMK serta mempublikasikan lowongan kerja dan kuota pemagangan.',
      accessibleMenus: [
        'Input Sinyal Kebutuhan Kerja (Anonim/Terbuka)',
        'Publikasi Lowongan Kerja & Magang Vokasi',
        'Suara Industri: Evaluasi Kinerja Lulusan',
        'Repositori Kemitraan MoU & PKS Pabrik',
      ],
      defaultTab: 'industry_signals',
      seedAccountNote: 'HRD PT Chandra Asri Pacific Tbk',
    },
    {
      role: 'school',
      title: 'Satuan Pendidikan SMK & BKK',
      badge: 'Satuan Pendidikan Vokasi',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: <School className="w-5 h-5 text-emerald-700" />,
      summary:
        'Pengelola Bursa Kerja Khusus (BKK) dan tim kurikulum sekolah untuk memetakan capaian pembelajaran praktikum per jurusan, mengimpor kohort lulusan via CSV, serta mengirim undangan pelacakan lulusan.',
      accessibleMenus: [
        'Manajemen Silabus Kompetensi Jurusan (SKKNI)',
        'Impor Daftar Kohort Alumni (Format CSV/Excel)',
        'Kirim Undangan & Pengingat Tautan Unik',
        'Rapor Kinerja Vokasi & Keterserapan Sekolah',
      ],
      defaultTab: 'school_programs',
      seedAccountNote: 'BKK SMKN 1 Cilegon',
    },
    {
      role: 'disnaker',
      title: 'Dinas Tenaga Kerja & Transmigrasi',
      badge: 'Pemerintah Provinsi',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      icon: <Briefcase className="w-5 h-5 text-cyan-700" />,
      summary:
        'Organisasi Perangkat Daerah yang bertugas memverifikasi sinyal kebutuhan industri kawasan, mengawasi bursa lowongan dari penipuan/calo, serta menyelaraskan kuota pelatihan UPTD BLK dengan lowongan riil.',
      accessibleMenus: [
        'Verifikasi Berkas Sinyal Kebutuhan Industri',
        'Pengawasan Bursa Kerja Daerah & Lapor Pungli',
        'Sinkronisasi Kuota Pelatihan BLK Provinsi',
        'Rekomendasi Kebijakan Pelatihan Daerah',
      ],
      defaultTab: 'rekomendasi_kebijakan',
      seedAccountNote: 'Dinas Tenaga Kerja & Transmigrasi Prov. Banten',
    },
    {
      role: 'disdik',
      title: 'Dinas Pendidikan & Kebudayaan',
      badge: 'Pemerintah Provinsi',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: <FileCheck2 className="w-5 h-5 text-indigo-700" />,
      summary:
        'Pengampu kebijakan pendidikan menengah kejuruan untuk menganalisis kesenjangan silabus vs tuntutan industri, menerbitkan instruksi penyesuaian kurikulum SMK, dan mengevaluasi konsorsium kejuruan.',
      accessibleMenus: [
        'Peta Kecocokan Kurikulum vs Kebutuhan Kerja',
        'Kalkulasi Skor Keselarasan & Analisis Gap AI',
        'Penerbitan Rekomendasi Kurikulum SMK',
        'Evaluasi Kinerja 350+ SMK Se-Banten',
      ],
      defaultTab: 'peta_kecocokan',
      seedAccountNote: 'Bidang Pembinaan SMK Disdikbud Banten',
    },
    {
      role: 'bappeda',
      title: 'Badan Perencanaan Pembangunan Daerah',
      badge: 'Pemerintah Provinsi',
      badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
      icon: <TrendingUp className="w-5 h-5 text-violet-700" />,
      summary:
        'Badan perencana pembangunan yang memantau indikator makro penyerapan vokasi, tingkat pengangguran terbuka (TPT), efisiensi belanja APBD vokasi, serta mengunduh dokumen laporan resmi semesteran.',
      accessibleMenus: [
        'Indikator Makro Ketenagakerjaan Vokasi',
        'Dasbor 6 Pertanyaan Kunci Kebijakan Daerah',
        'Pratinjau & Cetak Laporan Semesteran Resmi (PDF)',
        'Perencanaan Program Intervensi Daerah',
      ],
      defaultTab: 'rekomendasi_kebijakan',
      seedAccountNote: 'Bappeda Provinsi Banten (Bidang PPM)',
    },
    {
      role: 'akademisi',
      title: 'Akademisi Perguruan Tinggi & Riset',
      badge: 'Pentahelix: Akademisi',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      icon: <BookOpen className="w-5 h-5 text-teal-700" />,
      summary:
        'Mitra riset pendidikan dan ketenagakerjaan yang bertugas meninjau istilah kamus kompetensi SKKNI, mengusulkan standar kejuruan baru, serta mengajukan izin akses dataset teranonimkan untuk penelitian.',
      accessibleMenus: [
        'Kamus Kompetensi Kerja (Satu Bahasa Vokasi)',
        'Antrean Tinjauan Usulan Istilah Baru',
        'Pengajuan Dataset Riset Teranonimkan (PDP)',
        'Publikasi Kajian Ilmiah Vokasi Banten',
      ],
      defaultTab: 'kamus_kompetensi',
      seedAccountNote: 'Fakultas Teknik Universitas Sultan Ageng Tirtayasa',
    },
    {
      role: 'koordinator',
      title: 'Tim Koordinasi Vokasi Daerah (TKDV)',
      badge: 'Tata Kelola Lintas Unsur',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: <Compass className="w-5 h-5 text-rose-700" />,
      summary:
        'Lembaga koordinasi lintas sektor berdasarkan Perpres No. 68/2022 untuk memfasilitasi forum musyawarah 5 unsur (Pentahelix), memonitor penandatanganan MoU/PKS, serta mengawal penyelarasan kebijakan.',
      accessibleMenus: [
        'Forum Musyawarah Pentahelix Banten (5 Unsur)',
        'Repositori Penandatanganan MoU & PKS Nyata',
        'Pemantauan Sesi Rembug Vokasi Berkala',
        'Evaluasi Keselarasan Multi-Pihak Daerah',
      ],
      defaultTab: 'forum_pentahelix',
      seedAccountNote: 'Sekretariat TKDV Provinsi Banten',
    },
    {
      role: 'admin',
      title: 'Administrator Sistem & Keamanan Data',
      badge: 'Tata Kelola & Hak Akses',
      badgeColor: 'bg-slate-900 text-white border-slate-900',
      icon: <ShieldCheck className="w-5 h-5 text-slate-100" />,
      summary:
        'Pengelola infrastruktur dan kepatuhan sistem yang memverifikasi legalitas pendaftaran institusi sekolah & industri baru, membuka/menutup siklus semesteran, dan mengaudit jejak aktivitas.',
      accessibleMenus: [
        'Antrean Verifikasi Legalitas Sekolah & Industri',
        'Manajemen Siklus & Periode Sinyal Semester',
        'Jejak Audit Keamanan Sistem & Kepatuhan PDP',
        'Pemulihan Data & Pemeliharaan Sistem',
      ],
      defaultTab: 'admin_console',
      seedAccountNote: 'Super Admin Diskominfo & TKDV Banten',
    },
  ];

  const judgingSteps = [
    {
      step: '1',
      title: 'Perusahaan Mengisi Sinyal Kebutuhan',
      role: 'industry',
      tab: 'industry_signals',
      desc: 'HRD PT Chandra Asri mengajukan sinyal proyeksi 35 posisi operator proses reaktor kimia untuk semester 2026/Ganjil.',
      actionLabel: 'Coba sebagai HRD Industri',
    },
    {
      step: '2',
      title: 'Disnaker Memverifikasi Sinyal Industri',
      role: 'disnaker',
      tab: 'rekomendasi_kebijakan',
      desc: 'Petugas Disnaker memeriksa legalitas perusahaan dan keaslian proyeksi tenaga kerja sebelum dibuka ke jaringan vokasi.',
      actionLabel: 'Coba sebagai Disnaker Banten',
    },
    {
      step: '3',
      title: 'Sekolah Mengimpor Alumni & Kirim Undangan',
      role: 'school',
      tab: 'school_alumni_import',
      desc: 'BKK SMKN 1 Cilegon mengimpor berkas CSV lulusan 2025 dan menerbitkan tautan survei unik pelacakan lulusan 6 bulan.',
      actionLabel: 'Coba sebagai BKK SMK',
    },
    {
      step: '4',
      title: 'Alumni Mengisi Survei Pelacakan (3 Menit)',
      role: 'alumni',
      tab: 'alumni_tracer',
      desc: 'Alumni mengisi riwayat status kerja, mengevaluasi materi praktik pengelasan 6G, dan mengatur consent data pribadi.',
      actionLabel: 'Coba sebagai Alumni Vokasi',
    },
    {
      step: '5',
      title: 'Disdik & Pemda Menerbitkan Rekomendasi Kurikulum',
      role: 'disdik',
      tab: 'peta_kecocokan',
      desc: 'Disdik meninjau skor keselarasan, menyetujui rekomendasi pengadaan konsumabel las 6G, dan mencetak laporan semester resmi.',
      actionLabel: 'Coba sebagai Disdik Banten',
    },
  ];

  if (!isDemoModeAllowed) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center max-w-lg mx-auto my-12 space-y-4">
        <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Mode Demo Dinonaktifkan</h2>
        <p className="text-xs text-slate-600">
          Halaman simulasi demo untuk juri dinonaktifkan dalam lingkungan produksi nyata demi keamanan sistem.
        </p>
        <button
          onClick={() => onNavigate('beranda')}
          className="px-4 py-2 bg-blue-800 text-white rounded text-xs font-bold"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs">
              <img
                src="/brand/logo-mark-128.png"
                srcSet="/brand/logo-mark-128.png 1x, /brand/logo-mark-256.png 2x"
                alt="Logo SINKRON Banten"
                width="48"
                height="48"
                decoding="async"
                onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider bg-amber-500 text-slate-900 px-2.5 py-0.5 rounded-md">
                  Panel Simulasi Penjurian
                </span>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">SINKRON Banten (Prototipe Evaluasi)</span>
              </div>
              <div className="text-xs text-slate-500 font-medium sm:hidden mt-0.5">SINKRON Banten (Prototipe Evaluasi)</div>
            </div>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-600">
                Sesi Aktif: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.role.toUpperCase()})
              </span>
              <button
                onClick={logout}
                className="text-rose-700 hover:text-rose-900 font-bold ml-2 underline text-[11px]"
              >
                Keluar Sesi
              </button>
            </div>
          ) : (
            <span className="text-xs font-medium text-slate-500">
              Pilih salah satu peran di bawah untuk menguji alur kerja secara instan tanpa perlu mendaftar.
            </span>
          )}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pusat Pengujian &amp; Simulasi Peran SINKRON Banten
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-4xl leading-relaxed">
            Halaman ini disediakan khusus untuk Dewan Juri &amp; Tim Evaluator guna menguji secara menyeluruh 12 modul aplikasi dari sudut pandang 9 pemangku kepentingan vokasi Banten. Seluruh data di bawah merupakan data sintetis representatif sesuai profil ketenagakerjaan Provinsi Banten.
          </p>
        </div>
      </div>

      {/* 5-Minute Judging Guide Sequence */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-blue-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-blue-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-black text-sm">
              <Clock className="w-4 h-4 text-blue-800" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Panduan Penjurian 5 Menit: Alur Inti Penyelarasan Vokasi
              </h2>
              <p className="text-xs text-slate-600">
                Urutan simulasi yang disarankan untuk memverifikasi siklus lengkap sinyal kebutuhan hingga rekomendasi kurikulum.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
            Siklus Lengkap 5 Langkah
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {judgingSteps.map((step) => (
            <div
              key={step.step}
              className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-3 hover:border-blue-300 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-blue-800 text-white font-black text-xs flex items-center justify-center">
                    {step.step}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Langkah {step.step}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-xs leading-snug">{step.title}</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">{step.desc}</p>
              </div>

              <button
                onClick={() => handleRoleSelect(step.role, step.tab)}
                disabled={loadingRole === step.role}
                className="w-full mt-2 py-1.5 px-2 bg-white hover:bg-blue-50 text-blue-900 font-bold border border-blue-200 rounded text-[11px] transition flex items-center justify-center gap-1 shadow-2xs group"
              >
                <span>{step.actionLabel}</span>
                <ChevronRight className="w-3.5 h-3.5 text-blue-700 group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Katalog Simulasi 9 Peran Pemangku Kepentingan
            </h2>
            <p className="text-xs text-slate-600">
              Pilih peran di bawah untuk menguji batasan hak akses (RBAC), modul kerja internal, dan alur operasional per institusi.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roleCards.map((card) => {
            const isCurrent = currentUser?.role === card.role || (!currentUser && card.role === 'public');
            const isLoading = loadingRole === card.role;

            return (
              <div
                key={card.role}
                className={`bg-white rounded-xl border transition flex flex-col justify-between p-5 space-y-4 shadow-2xs ${
                  isCurrent
                    ? 'border-blue-600 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                        {card.icon}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">{card.title}</h3>
                        <span className="text-[10px] text-slate-500 block font-medium">
                          {card.seedAccountNote}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${card.badgeColor}`}
                    >
                      {card.badge}
                    </span>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-600 leading-relaxed">{card.summary}</p>

                  {/* Accessible Menus */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Akses Modul Utama:
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-700">
                      {card.accessibleMenus.map((menu, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{menu}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleRoleSelect(card.role, card.defaultTab)}
                    disabled={isLoading}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs ${
                      isCurrent
                        ? 'bg-blue-800 text-white hover:bg-blue-900'
                        : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 hover:border-slate-400'
                    }`}
                  >
                    {isLoading ? (
                      <span>Menyiapkan sesi...</span>
                    ) : isCurrent ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-200" />
                        <span>Sedang Aktif (Buka Modul)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Masuk sebagai peran ini</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
