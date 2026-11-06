import React from 'react';
import { useSinkron } from '../context/SinkronContext';
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Building2,
  GraduationCap,
  Briefcase,
  Layers,
  FileCheck,
  ShieldAlert,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface PublicHomeProps {
  onNavigate: (tab: string) => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({ onNavigate }) => {
  const { activePeriod, regions } = useSinkron();

  // Aggregate stats
  const totalOpenSlots = regions.reduce((acc, r) => acc + r.openJobSlots, 0);
  const totalCompanies = regions.reduce((acc, r) => acc + r.activeCompanies, 0);

  return (
    <div className="space-y-10">
      {/* Hero Section: Official, Crisp, White & Formal Blue */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Inisiatif Resmi Tim Koordinasi Daerah Vokasi (TKDV) Banten</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Menyambungkan Kurikulum Vokasi, Sinyal Industri, dan Penyerapan Lulusan di Banten
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            SINKRON Banten adalah sistem integrasi tiga tahap berkelanjutan yang menghubungkan data riil kebutuhan kompetensi dari 1.400+ kawasan industri di Banten langsung ke kurikulum 350+ SMK/SMA dan balai latihan kerja (BLK).
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('dasbor_publik')}
              className="px-5 py-2.5 rounded-lg bg-[#1F5FA8] hover:bg-[#164985] text-white text-xs font-bold transition shadow-xs flex items-center gap-2"
            >
              <span>Buka Dasbor Agregat &amp; Peta</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('cara_kerja')}
              className="px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              Pelajari Alur 3 Tahap
            </button>
          </div>
        </div>

        {/* Quick Badge at Bottom of Hero */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Status Periode Aktif</span>
            <span className="font-bold text-slate-800 text-sm">{activePeriod}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Lowongan / Magang Tersedia</span>
            <span className="font-bold text-emerald-700 text-sm">{totalOpenSlots.toLocaleString('id-ID')} Posisi</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Industri Mitra Terverifikasi</span>
            <span className="font-bold text-slate-800 text-sm">{totalCompanies} Perusahaan</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Pelacakan Lulusan (Tracer)</span>
            <span className="font-bold text-blue-800 text-sm">6 Bulan Pasca Lulus</span>
          </div>
        </div>
      </section>

      {/* 5 Key Aggregate KPI Cards (Transparent with definitions & methodology disclosure) */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Indikator Kunci Kinerja Vokasi Daerah</h2>
            <p className="text-xs text-slate-500">
              Data agregat resmi per semester — setiap angka memuat definisi baku dan ambang privasi.
            </p>
          </div>
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
            Sumber: Survei Pelacak Lulusan &amp; Sinyal Industri Banten
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* KPI 1 */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-blue-300 transition">
            <span className="text-[11px] font-medium text-slate-500 block mb-1">
              Tingkat Penyerapan Lulusan
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#1F5FA8]">68.4%</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +2.8%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
              Persentase lulusan SMK/SMA yang bekerja, wirausaha, atau studi dalam 6 bulan.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
              <span>n = 14.820 alumni</span>
              <span>Resp: 78.4%</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-blue-300 transition">
            <span className="text-[11px] font-medium text-slate-500 block mb-1">
              TPT Terbuka Banten
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-800">7.45%</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> -0.42%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
              Tingkat Pengangguran Terbuka Banten rujukan BPS (target turun berkelanjutan).
            </p>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
              <span>BPS Prov. Banten</span>
              <span>Agustus 2026</span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-blue-300 transition">
            <span className="text-[11px] font-medium text-slate-500 block mb-1">
              Kesesuaian Jurusan Kerja
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-blue-900">71.8%</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +3.5%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
              Lulusan bekerja di bidang yang selaras dengan rumpun keahlian vokasi sekolah.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
              <span>n = 10.120 pekerja</span>
              <span>Metode: Self-report</span>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-blue-300 transition">
            <span className="text-[11px] font-medium text-slate-500 block mb-1">
              Jurusan Adopsi Peta SINKRON
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#E08A2E]">84.2%</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
              Jurusan SMK yang telah meninjau kurikulum berdasarkan peta kecocokan industri.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
              <span>Disdik Prov. Banten</span>
              <span>324 Jurusan</span>
            </div>
          </div>

          {/* KPI 5 */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-blue-300 transition">
            <span className="text-[11px] font-medium text-slate-500 block mb-1">
              Penyerapan Pelatihan BLK
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-emerald-700">82.5%</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +5.1%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
              Peserta lulusan UPTD BLK Banten yang langsung bekerja dalam 6 bulan.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
              <span>Disnakertrans</span>
              <span>Track 1-3-6 bln</span>
            </div>
          </div>
        </div>
      </section>

      {/* The 3-Phase Circular Feedback Cycle (Sinyal -> Penyesuaian -> Pelacakan) */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            Tata Kelola Terintegrasi
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Siklus Tiga Tahap SINKRON Banten
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Menghentikan pola kebijakan silo dan mencocokkan kurikulum berdasarkan bukti konkret setiap semester.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Stage 1: Sinyal */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 relative">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-extrabold flex items-center justify-center text-sm mb-3">
              1
            </div>
            <span className="text-[11px] font-bold uppercase text-blue-700 tracking-wider">
              Tahap Pertama
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">Sinyal Kebutuhan Industri</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Perusahaan di 8 kawasan industri mengisi format baku kebutuhan kompetensi tiap semester (posisi, jumlah rekrutmen, kompetensi teknis dari kamus SKKNI/KKNI, dan kesiapan menerima magang).
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span>Pengisian cepat &le; 10 menit</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span>Pilihan anonimitas data publik</span>
              </li>
            </ul>
          </div>

          {/* Stage 2: Penyesuaian */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 relative">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center text-sm mb-3">
              2
            </div>
            <span className="text-[11px] font-bold uppercase text-amber-700 tracking-wider">
              Tahap Kedua
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">Peta &amp; Penyesuaian Kebijakan</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Sistem membandingkan kebutuhan industri dengan kompetensi yang diajarkan di SMK dan BLK. Disdik, Disnaker, dan Sekolah membahas rekomendasi nyata di Forum Pentahelix.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Matriks celah kompetensi transparan</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Keputusan manusia berbukti konkret</span>
              </li>
            </ul>
          </div>

          {/* Stage 3: Pelacakan */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 relative">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-sm mb-3">
              3
            </div>
            <span className="text-[11px] font-bold uppercase text-emerald-700 tracking-wider">
              Tahap Ketiga
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">Pelacakan Hasil Lulusan (Tracer)</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Lulusan SMK/SMA dilacak tepat 6 bulan setelah kelulusan via tautan unik singkat (&le; 3 menit). Hasil penyerapan dan umpan balik menjadi dasar perbaikan semester berikutnya.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Privasi terjamin (UU PDP No. 27/2022)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Pair-system pelacakan teman sebaya</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Role Portals / Direct Access */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Akses Pintu Masuk Para Pihak</h2>
          <p className="text-xs text-slate-500">
            Setiap pemangku kepentingan memiliki alur kerja spesifik sesuai tugas dan kewenangannya.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Alumni card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 hover:border-blue-400 transition flex flex-col justify-between">
            <div>
              <span className="p-2 bg-blue-50 text-blue-700 rounded-md inline-block mb-3">
                <GraduationCap className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Alumni SMK / SMA</h3>
              <p className="text-xs text-slate-500 mt-1">
                Isi survei 6 bulan, lamar lowongan dan magang resmi, serta kelola hak data pribadi Anda.
              </p>
            </div>
            <button
              onClick={() => onNavigate('alumni_dashboard')}
              className="mt-4 w-full py-2 px-3 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 text-slate-700 rounded text-xs font-semibold transition"
            >
              Masuk Portal Alumni
            </button>
          </div>

          {/* Industry card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 hover:border-blue-400 transition flex flex-col justify-between">
            <div>
              <span className="p-2 bg-amber-50 text-amber-700 rounded-md inline-block mb-3">
                <Briefcase className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Perusahaan &amp; Industri</h3>
              <p className="text-xs text-slate-500 mt-1">
                Sampaikan kebutuhan tenaga kerja semester ini dan publikasikan lowongan/magang vokasi.
              </p>
            </div>
            <button
              onClick={() => onNavigate('industry_signals')}
              className="mt-4 w-full py-2 px-3 bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-700 rounded text-xs font-semibold transition"
            >
              Isi Sinyal Kebutuhan
            </button>
          </div>

          {/* School card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 hover:border-blue-400 transition flex flex-col justify-between">
            <div>
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-md inline-block mb-3">
                <Building2 className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Sekolah &amp; BKK</h3>
              <p className="text-xs text-slate-500 mt-1">
                Kelola profil jurusan, impor data alumni, kirim undangan pelacak, dan tinjau rapor sekolah.
              </p>
            </div>
            <button
              onClick={() => onNavigate('school_programs')}
              className="mt-4 w-full py-2 px-3 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded text-xs font-semibold transition"
            >
              Kelola Kurikulum &amp; Alumni
            </button>
          </div>

          {/* Government card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 hover:border-blue-400 transition flex flex-col justify-between">
            <div>
              <span className="p-2 bg-indigo-50 text-indigo-700 rounded-md inline-block mb-3">
                <Layers className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Disdik, Disnaker &amp; Bappeda</h3>
              <p className="text-xs text-slate-500 mt-1">
                Peta kecocokan, rekomendasi kebijakan, pengawasan pelatihan BLK dan laporan semester.
              </p>
            </div>
            <button
              onClick={() => onNavigate('peta_kecocokan')}
              className="mt-4 w-full py-2 px-3 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-800 text-slate-700 rounded text-xs font-semibold transition"
            >
              Akses Dasbor Kebijakan
            </button>
          </div>
        </div>
      </section>

      {/* Official News & Publications Feed */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Rilis Resmi &amp; Regulasi Vokasi Banten</h3>
            <p className="text-xs text-slate-500">Publikasi berkala kebijakan tenaga kerja dan pendidikan daerah.</p>
          </div>
          <button
            onClick={() => onNavigate('ruang_media')}
            className="text-xs font-semibold text-blue-800 hover:underline flex items-center gap-1"
          >
            Lihat Semua Publikasi <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white transition">
            <span className="text-[10px] font-bold text-blue-700 uppercase bg-blue-100 px-1.5 py-0.5 rounded">
              Regulasi
            </span>
            <h4 className="font-bold text-slate-900 text-sm mt-2">
              Pergub Banten No. 18/2026 tentang Revitalisasi Pendidikan &amp; Pelatihan Vokasi
            </h4>
            <p className="text-slate-600 mt-1 line-clamp-2">
              Menetapkan kewajiban penyelarasan kurikulum SMK dengan sinyal kebutuhan industri terakreditasi di kawasan ekonomi Banten.
            </p>
            <span className="text-[10px] text-slate-400 mt-2 block">Ditetapkan: 15 Oktober 2026</span>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white transition">
            <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100 px-1.5 py-0.5 rounded">
              Laporan Semester
            </span>
            <h4 className="font-bold text-slate-900 text-sm mt-2">
              Hasil Tracer Study Kohort 2025: Tingkat Penyerapan Vokasi Capai 68,4%
            </h4>
            <p className="text-slate-600 mt-1 line-clamp-2">
              Ringkasan komprehensif pelacakan 14.820 alumni dengan tingkat kesesuaian keahlian tertinggi pada sektor kimia &amp; manufaktur.
            </p>
            <span className="text-[10px] text-slate-400 mt-2 block">Diterbitkan: 28 Oktober 2026</span>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white transition">
            <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-100 px-1.5 py-0.5 rounded">
              Kerjasama
            </span>
            <h4 className="font-bold text-slate-900 text-sm mt-2">
              Kesepakatan Kuota 500 Magang Bersama Konsorsium Industri Baja &amp; Logistik
            </h4>
            <p className="text-slate-600 mt-1 line-clamp-2">
              Forum Pentahelix Banten menyepakati adendum MoU pemagangan 6 bulan dengan sertifikasi industri langsung.
            </p>
            <span className="text-[10px] text-slate-400 mt-2 block">Ditetapkan: 2 November 2026</span>
          </div>
        </div>
      </section>
    </div>
  );
};
