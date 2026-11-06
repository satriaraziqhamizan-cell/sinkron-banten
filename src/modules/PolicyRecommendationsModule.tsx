import React, { useState } from 'react';
import { useSinkron } from '../context/SinkronContext';
import { Recommendation } from '../types/sinkron';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  UserCheck,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface PolicyRecommendationsModuleProps {
  initialTab?: 'recommendations' | 'policy_qa' | 'report';
}

export const PolicyRecommendationsModule: React.FC<PolicyRecommendationsModuleProps> = ({ initialTab = 'recommendations' }) => {
  const {
    recommendations,
    updateRecommendationStatus,
    activePeriod,
    regions,
    sectors,
    activeRole,
  } = useSinkron();

  const [activeTab, setActiveTab] = useState<'recommendations' | 'policy_qa' | 'report'>(initialTab);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [reasonInput, setReasonInput] = useState('');

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const filteredRecs = recommendations.filter((r) => {
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
    return true;
  });

  const getStatusBadge = (status: Recommendation['status']) => {
    switch (status) {
      case 'Dijalankan':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Dijalankan</span>;
      case 'Diterima':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Diterima</span>;
      case 'Dalam Pembahasan':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Dalam Pembahasan</span>;
      case 'Selesai':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">Selesai</span>;
      case 'Ditolak':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Ditolak</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">Usulan</span>;
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
              Dasbor Kebijakan Pemerintah Daerah
            </span>
            <span className="text-xs text-slate-500 font-medium">Disdik · Disnaker · Bappeda Banten</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Tindak Lanjut Rekomendasi &amp; Keputusan Kebijakan Vokasi
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Mengubah temuan kesenjangan kompetensi menjadi instruksi operasional terukur bagi sekolah, balai latihan kerja, dan konsorsium industri kawasan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintReport}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-md text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Cetak Laporan Resmi</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-white border border-slate-200 p-1 rounded-lg text-xs font-semibold no-print">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 rounded-md transition ${activeTab === 'recommendations' ? 'bg-blue-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          Papan Rekomendasi ({recommendations.length})
        </button>
        <button
          onClick={() => setActiveTab('policy_qa')}
          className={`px-4 py-2 rounded-md transition ${activeTab === 'policy_qa' ? 'bg-blue-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          6 Pertanyaan Kunci Kebijakan Daerah
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 rounded-md transition ${activeTab === 'report' ? 'bg-blue-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          Pratinjau Laporan Semester Resmi (PDF/Print)
        </button>
      </div>

      {/* TAB 1: Recommendations Action Board */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Filter Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium"
              >
                <option value="all">Semua Status</option>
                <option value="Usulan">Usulan Baru</option>
                <option value="Dalam Pembahasan">Dalam Pembahasan</option>
                <option value="Diterima">Diterima</option>
                <option value="Dijalankan">Dijalankan</option>
                <option value="Selesai">Selesai</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>
            <span className="text-slate-500 font-medium">{filteredRecs.length} Rekomendasi Tercatat</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredRecs.map((rec) => (
              <div key={rec.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] text-slate-500 font-bold">{rec.code}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        Tipe: {rec.type}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{rec.title}</h3>
                  </div>
                  <div className="shrink-0">{getStatusBadge(rec.status)}</div>
                </div>

                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
                  {rec.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-2 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400 block">Institusi Sasaran:</span>
                    <span className="font-bold text-slate-800">{rec.targetInstitution}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Penanggung Jawab:</span>
                    <span className="font-bold text-slate-800">{rec.assignedTo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Target KPI / Capaian:</span>
                    <span className="font-bold text-blue-900">{rec.kpiTarget || 'Peningkatan penyerapan lulusan'}</span>
                  </div>
                </div>

                {/* Status Updater Controller */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">Tenggat Waktu: {rec.dueDate}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-medium">Ubah Status:</span>
                    {(['Dalam Pembahasan', 'Diterima', 'Dijalankan', 'Selesai', 'Ditolak'] as Recommendation['status'][]).map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => {
                            const reason = st === 'Ditolak' ? prompt('Alasan penolakan rekomendasi:') : undefined;
                            updateRecommendationStatus(rec.id, st, reason || undefined);
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-semibold transition border ${
                            rec.status === st
                              ? 'bg-slate-800 text-white border-slate-800'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: The 6 Key Policy Questions (Section 5.12 of Spec) */}
      {activeTab === 'policy_qa' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6 text-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              6 Pertanyaan Kunci Pengambil Kebijakan (Disdik, Disnaker, Bappeda)
            </h2>
            <p className="text-slate-500 mt-1">
              Setiap dasbor SINKRON dirancang untuk langsung menjawab pertanyaan evaluasi RPJMD &amp; SDGs Banten:
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-blue-900 block text-sm">
                1. Kompetensi apa yang paling dibutuhkan industri per sektor &amp; wilayah?
              </span>
              <p className="text-slate-700 leading-relaxed">
                Pengelasan Pipa SMAW/GTAW 6G di Kota Cilegon (950 posisi), PLC Otomasi di Serang &amp; Tangerang (1.180 posisi), dan Warehouse Management System &amp; Forklift di Tangerang (1.420 posisi).
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-blue-900 block text-sm">
                2. Jurusan/wilayah mana yang memiliki kesenjangan kompetensi terbesar?
              </span>
              <p className="text-slate-700 leading-relaxed">
                Jurusan Pengelasan di Cilegon &amp; Serang memiliki kesenjangan kualifikasi 6G (sekolah baru melatih 3G/5G), dan Jurusan Logistik di Kab. Tangerang memiliki kesenjangan praktik software WMS &amp; SIO Forklift.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-blue-900 block text-sm">
                3. Bagaimana tingkat penyerapan lulusan per kabupaten/kota dan trennya?
              </span>
              <p className="text-slate-700 leading-relaxed">
                Rata-rata provinsi Banten mencapai 68,4% (naik 2,8% dari semester lalu). Kota Tangerang Selatan (78,9%) dan Kota Tangerang (74,5%) tertinggi; Pandeglang (58,2%) dan Lebak (56,5%) membutuhkan stimulus program magang.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-blue-900 block text-sm">
                4. Apakah pelatihan UPTD BLK berhasil mengantar peserta bekerja?
              </span>
              <p className="text-slate-700 leading-relaxed">
                Tingkat keterserapan kerja peserta BLK Banten dalam 6 bulan mencapai 82,5% (tertinggi pada kejuruan las 6G dan operator warehouse berlisensi Kemnaker).
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-blue-900 block text-sm">
                5. Rekomendasi mana yang sudah dijalankan dan apa hasilnya?
              </span>
              <p className="text-slate-700 leading-relaxed">
                Rekomendasi REK-DISDIK-2026-01 (pengadaan konsumabel las 6G) sedang berjalan dengan dukungan instruktur tamu PT Krakatau Steel, dengan proyeksi peningkatan kelulusan uji sertifikasi menjadi 80%.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-blue-900 block text-sm">
                6. Seberapa baik partisipasi industri dan sekolah (tingkat respons)?
              </span>
              <p className="text-slate-700 leading-relaxed">
                Tingkat respons survei pelacak lulusan kohort mencapai 78,4% (memenuhi ambang validitas Bappeda &ge; 70%), dengan 1.471 industri aktif mengisi sinyal semester berjalan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Printable Official Semester Report (PDF) */}
      {activeTab === 'report' && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-2xs space-y-6 text-xs print:border-none print:shadow-none print:p-0">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <h2 className="font-bold uppercase tracking-widest text-slate-800 text-sm">
              PEMERINTAH PROVINSI BANTEN
            </h2>
            <h3 className="font-extrabold uppercase tracking-wide text-slate-900 text-lg">
              TIM KOORDINASI DAERAH VOKASI (TKDV) PROVINSI BANTEN
            </h3>
            <p className="text-[11px] text-slate-600">
              Kawasan Pusat Pemerintahan Provinsi Banten (KP3B) Jl. Syekh Nawawi Al-Bantani, Curug, Kota Serang 42171
            </p>
            <div className="pt-2 text-[10px] text-slate-500 font-mono">
              NOMOR LAPORAN: LAP-SINKRON/TKDV-BANTEN/2026/SMT-GANJIL
            </div>
          </div>

          <div className="text-center pt-2">
            <h4 className="font-extrabold text-base text-slate-900 uppercase">
              RINGKASAN EKSEKUTIF KINERJA PENYELARASAN VOKASI &amp; INDUSTRI
            </h4>
            <span className="text-slate-500 text-xs">Semester Ganjil Tahun Ajaran 2026/2027</span>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <h5 className="font-bold text-slate-900 mb-1">I. Ringkasan Indikator Kunci Provinsi Banten</h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Penyerapan Lulusan:</span>
                  <span className="font-bold text-slate-900">68,4%</span>
                </div>
                <div>
                  <span className="text-slate-500 block">TPT Rujukan BPS:</span>
                  <span className="font-bold text-slate-900">7,45%</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tingkat Respons Tracer:</span>
                  <span className="font-bold text-slate-900">78,4% (Valid)</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Penyerapan Pelatihan BLK:</span>
                  <span className="font-bold text-slate-900">82,5%</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <h5 className="font-bold text-slate-900 mb-1">II. Temuan Kesenjangan Kompetensi Terbesar</h5>
              <p className="text-slate-700 leading-relaxed">
                Terdapat ketidaksesuaian spesifikasi pada kompetensi Pengelasan Pipa 6G di sentra industri baja Kota Cilegon dan sistem manajemen pergudangan (WMS &amp; SIO Forklift) di koridor industri Balaraja Kabupaten Tangerang.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <h5 className="font-bold text-slate-900 mb-1">III. Rekomendasi Tindak Lanjut yang Sedang Berjalan</h5>
              <ul className="list-disc list-inside text-slate-700 space-y-1">
                {recommendations.slice(0, 3).map((r) => (
                  <li key={r.id}>
                    <strong>{r.title}</strong> — Ditugaskan kepada: {r.assignedTo} (Status: {r.status})
                  </li>
                ))}
              </ul>
            </div>

            {/* Signature Block */}
            <div className="pt-8 grid grid-cols-2 text-center text-xs">
              <div>
                <span className="text-slate-500 block">Mengetahui,</span>
                <span className="font-bold text-slate-900 block mt-1">
                  Kepala Dinas Pendidikan Prov. Banten
                </span>
                <div className="h-16"></div>
                <span className="font-bold underline text-slate-900">Dr. H. Tabrani, M.Pd</span>
                <span className="text-[10px] text-slate-500 block">NIP. 19680412 199303 1 004</span>
              </div>
              <div>
                <span className="text-slate-500 block">Serang, 3 November 2026</span>
                <span className="font-bold text-slate-900 block mt-1">
                  Kepala Disnakertrans Prov. Banten
                </span>
                <div className="h-16"></div>
                <span className="font-bold underline text-slate-900">Drs. H. Septo Kalnadi, MM</span>
                <span className="text-[10px] text-slate-500 block">NIP. 19690918 199403 1 003</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
