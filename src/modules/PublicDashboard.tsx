import React, { useState } from 'react';
import { useSinkron } from '../context/SinkronContext';
import { BantenMap } from '../components/BantenMap';
import {
  Filter,
  Info,
  TrendingUp,
  Download,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Building,
  GraduationCap,
  Briefcase,
  X,
} from 'lucide-react';

export const PublicDashboard: React.FC = () => {
  const { regions, sectors, demandSignals, tracerResponses, activePeriod } = useSinkron();

  const [selectedRegionId, setSelectedRegionId] = useState<string>('all');
  const [metricFilter, setMetricFilter] = useState<'absorption' | 'tpt' | 'openJobs' | 'companies'>('absorption');
  const [definitionModal, setDefinitionModal] = useState<{ title: string; definition: string; source: string; formula: string } | null>(null);

  // Filtered calculation
  const targetRegions = selectedRegionId === 'all' ? regions : regions.filter((r) => r.id === selectedRegionId);

  const avgAbsorption = (
    targetRegions.reduce((sum, r) => sum + r.graduateAbsorptionRate, 0) / targetRegions.length
  ).toFixed(1);

  const avgTpt = (
    targetRegions.reduce((sum, r) => sum + r.tpt, 0) / targetRegions.length
  ).toFixed(2);

  const totalJobs = targetRegions.reduce((sum, r) => sum + r.openJobSlots, 0);
  const totalSchools = targetRegions.reduce((sum, r) => sum + r.vocationalSchools, 0);

  // Top demanded competencies
  const topSectors = [...sectors].sort((a, b) => b.activeDemandCount - a.activeDemandCount);

  const handleExportCsv = () => {
    const headers = 'Kode,Kabupaten_Kota,Penyerapan_6bln_pct,TPT_pct,Industri_Aktif,SMK_Vokasi,Lowongan_Tersedia\n';
    const rows = regions
      .map(
        (r) =>
          `"${r.code}","${r.name}",${r.graduateAbsorptionRate},${r.tpt},${r.activeCompanies},${r.vocationalSchools},${r.openJobSlots}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SINKRON_Banten_Agregat_${activePeriod.replace('/', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Page Header & Global Controls */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              Data Terbuka Agregat
            </span>
            <span className="text-xs text-slate-500">Periode: {activePeriod}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Dasbor Publik Kinerja Vokasi &amp; Ketenagakerjaan Banten
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Menampilkan data capaian hasil pelacakan lulusan, keselarasan kurikulum, dan sinyal lowongan di 8 Kabupaten/Kota dengan prinsip transparansi dan perlindungan data pribadi (UU PDP).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Region selector filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedRegionId}
              onChange={(e) => setSelectedRegionId(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Seluruh Provinsi Banten (Agregat)</option>
              {regions.map((reg) => (
                <option key={reg.id} value={reg.id}>
                  {reg.name} ({reg.level})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Unduh CSV Agregat</span>
          </button>
        </div>
      </div>

      {/* Aggregate Cards for Selected Region */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Penyerapan Lulusan */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Penyerapan Lulusan 6 Bulan</span>
            <button
              onClick={() =>
                setDefinitionModal({
                  title: 'Penyerapan Lulusan 6 Bulan',
                  definition:
                    'Persentase kohort alumni SMK/SMA yang telah berstatus bekerja, berwirausaha, atau menempuh studi dalam rentang waktu 6 bulan setelah kelulusan.',
                  source: 'Survei Pelacak Lulusan (Tracer Study) Banten Semester Ganjil 2026/Ganjil.',
                  formula:
                    '(Jumlah alumni bekerja + wirausaha + kuliah) ÷ (Total responden valid dalam jendela 6 bulan) × 100%',
                })
              }
              className="text-slate-400 hover:text-blue-700"
              title="Lihat definisi & metodologi"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1F5FA8]">{avgAbsorption}%</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +2.4%
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>n = {selectedRegionId === 'all' ? '14.820' : '2.140'} alumni</span>
            <span className="text-emerald-700 font-medium">Resp. Rate: 78.4%</span>
          </div>
        </div>

        {/* Card 2: TPT */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Tingkat Pengangguran Terbuka (TPT)</span>
            <button
              onClick={() =>
                setDefinitionModal({
                  title: 'Tingkat Pengangguran Terbuka (TPT)',
                  definition:
                    'Rasio persentase jumlah penganggur terhadap total angkatan kerja di wilayah terkait berdasarkan rujukan rilis data BPS.',
                  source: 'BPS Provinsi Banten (Keadaan Ketenagakerjaan Terkini).',
                  formula: '(Jumlah Penganggur ÷ Total Angkatan Kerja) × 100%',
                })
              }
              className="text-slate-400 hover:text-blue-700"
              title="Lihat definisi & metodologi"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{avgTpt}%</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> -0.38%
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Wilayah: {selectedRegionId === 'all' ? 'Provinsi Banten' : targetRegions[0]?.name}</span>
            <span className="text-slate-400">Rujukan BPS</span>
          </div>
        </div>

        {/* Card 3: Lowongan & Magang */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Lowongan &amp; Magang Terverifikasi</span>
            <button
              onClick={() =>
                setDefinitionModal({
                  title: 'Lowongan & Magang Terverifikasi',
                  definition:
                    'Akumulasi kuota kebutuhan rekrutmen dan slot pemagangan resmi yang diajukan industri melalui Sinyal Kebutuhan SINKRON semester aktif.',
                  source: 'Modul Sinyal Industri & Bursa Vokasi SINKRON.',
                  formula: 'Total slot kebutuhan PKWT/PKWTT + slot magang industri aktif.',
                })
              }
              className="text-slate-400 hover:text-blue-700"
              title="Lihat definisi & metodologi"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700">{totalJobs.toLocaleString('id-ID')}</span>
            <span className="text-xs text-slate-500 font-medium">Slot</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Dari 142 Sinyal Aktif</span>
            <span className="text-emerald-700 font-medium">100% Bebas Biaya</span>
          </div>
        </div>

        {/* Card 4: Sekolah Vokasi */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Satuan Pendidikan Vokasi</span>
            <button
              onClick={() =>
                setDefinitionModal({
                  title: 'Satuan Pendidikan Vokasi Terhubung',
                  definition:
                    'Jumlah SMK/SMA vokasi negeri dan swasta yang kurikulumnya terdaftar dan terhubung dalam siklus penyelarasan kurikulum SINKRON.',
                  source: 'Dinas Pendidikan & Kebudayaan Provinsi Banten.',
                  formula: 'Total institusi sekolah yang terdaftar di basis data SINKRON.',
                })
              }
              className="text-slate-400 hover:text-blue-700"
              title="Lihat definisi & metodologi"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-900">{totalSchools}</span>
            <span className="text-xs text-slate-500 font-medium">SMK</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>84.2% Adopsi Kurikulum</span>
            <span className="text-blue-800 font-medium">Terakreditasi</span>
          </div>
        </div>
      </div>

      {/* Geospatial Map Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Peta Sebaran Kinerja Wilayah Banten</h2>
            <p className="text-xs text-slate-500">
              Pilih kabupaten/kota pada peta atau tabel untuk menyaring data agregat ketenagakerjaan.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs bg-white border border-slate-200 p-1 rounded-md">
            <button
              onClick={() => setMetricFilter('absorption')}
              className={`px-2.5 py-1 rounded transition font-medium ${metricFilter === 'absorption' ? 'bg-blue-800 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Serapan (%)
            </button>
            <button
              onClick={() => setMetricFilter('tpt')}
              className={`px-2.5 py-1 rounded transition font-medium ${metricFilter === 'tpt' ? 'bg-blue-800 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              TPT (%)
            </button>
          </div>
        </div>

        <BantenMap
          regions={regions}
          selectedRegionId={selectedRegionId === 'all' ? null : selectedRegionId}
          onSelectRegion={(id) => setSelectedRegionId(id)}
          metricType={metricFilter}
        />
      </section>

      {/* Demand by Priority Industrial Sectors in Banten */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Permintaan Kebutuhan Tenaga Kerja per Sektor Industri
          </h2>
          <p className="text-xs text-slate-500">
            Dihitung dari kompilasi sinyal kebutuhan resmi yang diajukan HRD industri kawasan Banten semester ini.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topSectors.map((sec) => {
            const pctOfTotal = ((sec.activeDemandCount / 8860) * 100).toFixed(0);
            return (
              <div key={sec.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">
                    {sec.code}
                  </span>
                  <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {sec.activeDemandCount.toLocaleString('id-ID')} Slot
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-xs line-clamp-1">{sec.name}</h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{sec.description}</p>
                <div className="mt-3">
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#1F5FA8] h-full rounded-full"
                      style={{ width: `${pctOfTotal}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block text-right font-medium">
                    {pctOfTotal}% dari total permintaan daerah
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Small-cell privacy suppression disclosure notice (Section 10.6 of Spec) */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4 text-xs text-blue-950 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Prinsip Privasi &amp; Ambang Agregasi Data (Small-Cell Suppression)</span>
          <p className="text-slate-600 mt-0.5 leading-relaxed">
            Untuk melindungi kerahasiaan alumni dan subjek data, seluruh indikator publik di dasbor ini disajikan dalam bentuk agregat statistik. Sel kelompok data dengan jumlah responden kurang dari 10 (n &lt; 10) secara otomatis ditekan (suppressed) dan diberi label <em>&quot;data belum cukup&quot;</em> untuk mencegah identifikasi ulang sesuai Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27/2022).
          </p>
        </div>
      </div>

      {/* Definition & Methodology Modal */}
      {definitionModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-slate-200 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-700" />
                Definisi &amp; Metodologi Indikator
              </h3>
              <button
                onClick={() => setDefinitionModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Nama Indikator:</span>
              <p className="font-bold text-slate-900 text-sm">{definitionModal.title}</p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Definisi Operasional:</span>
              <p className="text-slate-700 leading-relaxed mt-0.5">{definitionModal.definition}</p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Rumus Perhitungan:</span>
              <p className="bg-slate-100 p-2.5 rounded font-mono text-[11px] text-slate-800 border border-slate-200 mt-0.5">
                {definitionModal.formula}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Sumber Data:</span>
              <p className="text-slate-600 mt-0.5">{definitionModal.source}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setDefinitionModal(null)}
                className="px-4 py-2 bg-blue-800 text-white rounded font-semibold hover:bg-blue-900 transition"
              >
                Tutup Informasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
