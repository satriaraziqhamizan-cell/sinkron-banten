import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSinkron } from '../context/SinkronContext';
import { useToast } from '../components/Toast';
import {
  ShieldCheck,
  Building2,
  Users,
  Calendar,
  Lock,
  Database,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download,
  Filter,
  Search,
} from 'lucide-react';

interface AdminConsoleModuleProps {
  initialTab?: 'verification' | 'periods' | 'audit' | 'system';
}

export const AdminConsoleModule: React.FC<AdminConsoleModuleProps> = ({ initialTab = 'verification' }) => {
  const { isDemoModeAllowed } = useAuth();
  const {
    auditLogs,
    activePeriod,
    setActivePeriod,
    demandSignals,
    verifyDemandSignal,
    resetAllData,
  } = useSinkron();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'verification' | 'periods' | 'audit' | 'system'>(initialTab);
  const [logSearch, setLogSearch] = useState('');

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Sample institutions for verification queue
  const [institutions, setInstitutions] = useState([
    {
      id: 'inst_1',
      name: 'PT Asahimas Chemical Cilegon',
      type: 'Perusahaan Industri',
      region: 'Kota Cilegon',
      status: 'Menunggu Verifikasi',
      submittedAt: '2026-11-01',
    },
    {
      id: 'inst_2',
      name: 'SMK Negeri 1 Rangkasbitung',
      type: 'Sekolah Vokasi',
      region: 'Kabupaten Lebak',
      status: 'Terverifikasi',
      submittedAt: '2026-10-15',
    },
    {
      id: 'inst_3',
      name: 'PT Surya Toto Indonesia (Balaraja)',
      type: 'Perusahaan Industri',
      region: 'Kabupaten Tangerang',
      status: 'Menunggu Verifikasi',
      submittedAt: '2026-11-02',
    },
  ]);

  const filteredLogs = auditLogs.filter((log) => {
    if (!logSearch) return true;
    return (
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.actorName.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase())
    );
  });

  const handleVerifyInst = (id: string) => {
    setInstitutions(
      institutions.map((inst) => (inst.id === id ? { ...inst, status: 'Terverifikasi' } : inst))
    );
    showToast('Institusi Terverifikasi', 'Institusi berhasil diverifikasi dan diberikan akses resmi ke sistem SINKRON.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-red-100 text-red-800 px-2 py-0.5 rounded">
              Konsol Administrator Teknis
            </span>
            <span className="text-xs text-slate-500 font-medium">Hak Akses Super Admin SINKRON</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Manajemen Institusi, Konfigurasi Periode &amp; Audit Log
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Pusat kendali parameter operasional, verifikasi legalitas institusi pemohon, pengawasan jejak audit yang tidak dapat diubah (append-only), dan konfigurasi siklus semesteran.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sistem Operasional Normal
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-white border border-slate-200 p-1 rounded-lg text-xs font-semibold">
        <button
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-2 rounded-md transition ${activeTab === 'verification' ? 'bg-blue-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          Verifikasi Institusi ({institutions.filter((i) => i.status === 'Menunggu Verifikasi').length} Menunggu)
        </button>
        <button
          onClick={() => setActiveTab('periods')}
          className={`px-4 py-2 rounded-md transition ${activeTab === 'periods' ? 'bg-blue-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          Konfigurasi Periode &amp; Ambang
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-md transition ${activeTab === 'audit' ? 'bg-blue-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          Audit Log Sistem ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 rounded-md transition ${activeTab === 'system' ? 'bg-blue-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          Kesehatan &amp; Cadangan Data
        </button>
      </div>

      {/* TAB 1: Institution Verification Queue */}
      {activeTab === 'verification' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">Antrean Verifikasi Legalitas Institusi</h2>
            <p className="text-slate-500">
              Sesuai SOP keamanan SINKRON, setiap akun perusahaan, sekolah, atau asosiasi wajib diverifikasi sebelum dapat memasukkan sinyal atau mengelola data alumni.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="p-2.5">Nama Institusi / Lembaga</th>
                  <th className="p-2.5">Jenis Entitas</th>
                  <th className="p-2.5">Wilayah</th>
                  <th className="p-2.5">Tanggal Daftar</th>
                  <th className="p-2.5 text-center">Status</th>
                  <th className="p-2.5 text-center">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {institutions.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">{inst.name}</td>
                    <td className="p-2.5 text-slate-600">{inst.type}</td>
                    <td className="p-2.5 text-slate-600">{inst.region}</td>
                    <td className="p-2.5 text-slate-500 text-[11px]">{inst.submittedAt}</td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inst.status === 'Terverifikasi'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inst.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      {inst.status === 'Menunggu Verifikasi' ? (
                        <button
                          onClick={() => handleVerifyInst(inst.id)}
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-[11px] transition shadow-xs"
                        >
                          Verifikasi Resmi
                        </button>
                      ) : (
                        <span className="text-slate-400 font-medium text-[11px]">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Period & Threshold Configurations */}
      {activeTab === 'periods' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6 text-xs max-w-2xl">
          <div>
            <h2 className="text-base font-bold text-slate-900">Pengaturan Periode Semester &amp; Kebijakan Privasi</h2>
            <p className="text-slate-500">
              Mengatur jendela pengisian sinyal industri dan pelacakan lulusan untuk seluruh Provinsi Banten.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Periode Semester Aktif:</label>
              <select
                value={activePeriod}
                onChange={(e) => setActivePeriod(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 font-bold"
              >
                <option value="2026/Ganjil">Tahun Ajaran 2026/2027 - Semester Ganjil (Aktif)</option>
                <option value="2025/Genap">Tahun Ajaran 2025/2026 - Semester Genap (Tutup / Arsip)</option>
                <option value="2025/Ganjil">Tahun Ajaran 2025/2026 - Semester Ganjil (Arsip)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Buka Sinyal Industri:</label>
                <input
                  type="date"
                  defaultValue="2026-09-01"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Tutup Sinyal Industri:</label>
                <input
                  type="date"
                  defaultValue="2026-11-30"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">Ambang Batas Penekanan Data (Small-Cell Threshold):</span>
              <p className="text-slate-500 text-[11px]">
                Jumlah minimum responden agar sel statistik di dasbor publik diizinkan tampil secara visual:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="30"
                  defaultValue="10"
                  className="w-20 px-2 py-1 bg-white border border-slate-300 rounded font-bold text-center"
                />
                <span className="text-slate-600 font-medium">Responden per sel agregat</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Kebijakan Autentikasi Dua Faktor (2FA / TOTP):</span>
                  <span className="text-[11px] text-slate-500">Kewajiban 2FA untuk akun dinas &amp; admin sekolah.</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Dalam pengembangan
                </span>
              </div>
            </div>

            <button
              onClick={() => showToast('Simulasi Pengaturan', 'Fitur simulasi untuk demo — belum terhubung ke layanan nyata', 'info')}
              className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded font-bold shadow-xs transition"
            >
              Simpan Pengaturan Sistem
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Audit Logs (Append-Only) */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Rekam Jejak Audit Sistem (Append-Only Log)</h2>
              <p className="text-slate-500 text-[11px]">
                Seluruh aktivitas krusial dicatat secara permanen dengan stempel waktu, identitas IP, dan aktor pelaksana.
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Saring aksi atau aktor log..."
                className="pl-8 pr-3 py-1.5 border border-slate-300 rounded text-slate-900 text-xs w-60"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                  <th className="p-2">Waktu (WIB)</th>
                  <th className="p-2">Aktor Pelaksana</th>
                  <th className="p-2">Tindakan (Action)</th>
                  <th className="p-2">Objek</th>
                  <th className="p-2">Alamat IP</th>
                  <th className="p-2">Rincian Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-2 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-2 font-bold text-slate-800">{log.actorName}</td>
                    <td className="p-2 font-bold text-blue-900">{log.action}</td>
                    <td className="p-2 text-slate-600">{log.objectType}</td>
                    <td className="p-2 text-slate-400">{log.ip}</td>
                    <td className="p-2 text-slate-700 font-sans text-xs">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: System Health & Backup */}
      {activeTab === 'system' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6 text-xs max-w-2xl">
          <div>
            <h2 className="text-base font-bold text-slate-900">Kesehatan Layanan &amp; Manajemen Pencadangan</h2>
            <p className="text-slate-500">
              Monitoring infrastruktur Cloud Run dan penjadwalan backup database harian.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Status Layanan API &amp; Server Web:</span>
                <span className="text-[11px] text-slate-500">Uptime: 99.98% · Wilayah: Asia Tenggara (ID)</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                Normal / Online
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Pencadangan Terakhir (Database Snapshot):</span>
                <span className="text-[11px] text-slate-500">3 November 2026, 03:00 WIB (Otomatis Harian)</span>
              </div>
              <button
                onClick={() => showToast('Pencadangan Manual', 'Fitur simulasi untuk demo — belum terhubung ke layanan nyata', 'info')}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded font-semibold text-xs transition"
              >
                Picu Backup Manual
              </button>
            </div>

            {isDemoModeAllowed && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg space-y-2">
                <span className="font-bold text-rose-900 block">Pemulihan Data &amp; Reset Demo</span>
                <p className="text-rose-700 text-[11px]">
                  Mengembalikan seluruh data simulasi kembali ke kondisi seed awal spesifikasi SINKRON Provinsi Banten.
                </p>
                <button
                  onClick={async () => {
                    if (window.confirm('Reset seluruh data ke kondisi awal spesifikasi? Tindakan ini akan mengembalikan seluruh data ke seed default.')) {
                      await resetAllData();
                    }
                  }}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset ke Data Awal Spesifikasi</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
