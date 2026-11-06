import React, { useState } from 'react';
import { useSinkron } from '../context/SinkronContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { MatchResult } from '../types/sinkron';
import {
  Sparkles,
  CheckCircle,
  AlertCircle,
  Clock,
  Filter,
  Download,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  UserCheck,
  HelpCircle,
  PlusCircle,
  X,
} from 'lucide-react';

export const MatchMatrixView: React.FC = () => {
  const {
    matchResults,
    schoolPrograms,
    sectors,
    regions,
    reviewMatchResult,
    runMatchAnalysis,
    addRecommendation,
    activeRole,
  } = useSinkron();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [filterGap, setFilterGap] = useState<string>('all');
  const [activeDetail, setActiveDetail] = useState<MatchResult | null>(null);
  const [showRecModal, setShowRecModal] = useState<MatchResult | null>(null);
  const [recTitle, setRecTitle] = useState('');
  const [recDesc, setRecDesc] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');

  // Filtered match results
  const filtered = matchResults.filter((m) => {
    if (selectedSector !== 'all' && m.sectorId !== selectedSector) return false;
    if (selectedRegion !== 'all' && m.regionId !== selectedRegion) return false;
    if (filterGap !== 'all' && m.gapLevel !== filterGap) return false;
    return true;
  });

  const getGapBadge = (gapLevel: MatchResult['gapLevel'], coverage: number) => {
    if (coverage === 1.0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          Tercakup Penuh (100%)
        </span>
      );
    }
    if (coverage === 0.5) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          Celah Sebagian (50%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
        Belum Tercakup (Celah Tinggi)
      </span>
    );
  };

  const handleCreateRecommendation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRecModal) return;

    addRecommendation({
      title: recTitle || `Penyesuaian Kurikulum: ${showRecModal.demandCompetencyName}`,
      description: recDesc || showRecModal.aiSuggestedAdjustment || '',
      type: 'kurikulum',
      targetInstitution: showRecModal.schoolName,
      regionId: showRecModal.regionId,
      sectorId: showRecModal.sectorId,
      dueDate: '2026-12-31',
    });

    setShowRecModal(null);
    setRecTitle('');
    setRecDesc('');
    showToast('Rekomendasi Diterbitkan', 'Rekomendasi resmi berhasil diterbitkan dan masuk ke papan tindak lanjut.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              Modul Inti Penyesuaian
            </span>
            <span className="text-xs text-slate-500 font-medium">Algoritma Penyelarasan Vokasi v2.1</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Peta Kecocokan: Kebutuhan Industri vs Kurikulum Sekolah
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Menganalisis kesenjangan antara kompetensi riil yang diminta sinyal industri Banten dengan silabus praktikum jurusan SMK. Setiap celah dilengkapi bukti konkret, rekomendasi terarah, dan rekam jejak keputusan verifikasi manusia.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <select
            value={selectedProgramId}
            onChange={(e) => setSelectedProgramId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-2 text-xs font-medium text-slate-800"
            aria-label="Pilih Program Keahlian SMK"
          >
            <option value="">-- Semua Jurusan / Otomatis --</option>
            {schoolPrograms.map((p) => (
              <option key={p.id} value={p.id}>
                {p.schoolName} - {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => runMatchAnalysis(selectedProgramId || undefined)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1F5FA8] hover:bg-[#164985] text-white rounded-md text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Kalkulasi Ulang Peta</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" /> Filter:
          </span>

          {/* Sektor Filter */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium"
          >
            <option value="all">Semua Sektor Industri</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Region Filter */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium"
          >
            <option value="all">Semua Kabupaten/Kota Banten</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Gap Level Filter */}
          <select
            value={filterGap}
            onChange={(e) => setFilterGap(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium"
          >
            <option value="all">Semua Status Celah</option>
            <option value="Tinggi">Celah Tinggi (&lt; 50%)</option>
            <option value="Sedang">Celah Sebagian (50%)</option>
            <option value="Sesuai">Sesuai Penuh (100%)</option>
          </select>
        </div>

        <span className="text-slate-500 font-medium">
          Menampilkan <strong>{filtered.length}</strong> titik analisis kurikulum
        </span>
      </div>

      {/* Match Results Table & Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table list */}
        <div className="lg:col-span-8 space-y-3">
          {filtered.map((item) => {
            const isSelected = activeDetail?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setActiveDetail(item)}
                className={`p-4 rounded-lg bg-white border cursor-pointer transition shadow-2xs hover:border-blue-400 ${
                  isSelected ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                        {item.schoolName}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {item.programName}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{item.demandCompetencyName}</h3>
                  </div>

                  <div className="shrink-0">{getGapBadge(item.gapLevel, item.curriculumCoverage)}</div>
                </div>

                {/* Evidence snippet */}
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 bg-slate-50 p-2.5 rounded border border-slate-100">
                  <strong className="text-slate-800">Bukti Celah:</strong> {item.evidence}
                </p>

                {/* Status Bar */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">
                      Bobot Permintaan Industri: <strong className="text-slate-800">{item.demandWeight}/100</strong>
                    </span>
                    {item.aiConfidence && (
                      <span className="text-blue-800 font-medium flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded text-[11px] border border-blue-200">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        AI Confidence: {item.aiConfidence}%
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.humanReviewed ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                        <UserCheck className="w-3.5 h-3.5" />
                        Ditinjau ({item.decision})
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold flex items-center gap-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        Menunggu Tinjauan Manusia
                      </span>
                    )}
                    <span className="text-blue-700 font-semibold text-xs flex items-center">
                      Detail <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel & Human Decision Controller (Section 11 Spec: Manusia Memutuskan) */}
        <div className="lg:col-span-4">
          {activeDetail ? (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 sticky top-20 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="font-bold text-slate-900 text-sm">Lembar Bukti &amp; Verifikasi</span>
                <span className="text-[10px] text-slate-400 font-mono">ID: {activeDetail.id}</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Kompetensi yang Dicocokkan:</span>
                <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {activeDetail.demandCompetencyName}
                </h4>
                <p className="text-slate-600 mt-1">
                  Satuan Pendidikan: <strong>{activeDetail.schoolName}</strong> ({activeDetail.programName})
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-800 text-[11px] block">Bukti Analisis Kurikulum vs Lapangan:</span>
                <p className="text-slate-700 leading-relaxed text-[11px]">{activeDetail.evidence}</p>
              </div>

              {activeDetail.aiSuggestedAdjustment && (
                <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 text-[11px] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Saran AI (Tingkat Keyakinan: {activeDetail.aiConfidence}%)
                    </span>
                    <span className="text-[9px] uppercase tracking-wider bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-800 font-semibold">
                      Saran Sistem
                    </span>
                  </div>
                  <p className="text-blue-950 leading-relaxed text-[11px]">
                    {activeDetail.aiSuggestedAdjustment}
                  </p>
                  <span className="text-[10px] text-slate-500 italic block mt-1">
                    *AI bertindak sebagai asisten analisis data; kewenangan penetapan kurikulum tetap pada instansi berwenang.
                  </span>
                </div>
              )}

              {/* Decision Box */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <div>
                  <span className="font-bold text-slate-900 block mb-1">
                    Verifikasi Peninjau Manusia (Human-in-the-Loop)
                  </span>
                  <p className="text-slate-500 text-[11px]">
                    Status saat ini:{' '}
                    <strong className="text-slate-800">
                      {activeDetail.humanReviewed ? `${activeDetail.decision} oleh ${activeDetail.reviewedBy}` : 'Belum Diputuskan'}
                    </strong>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const reviewer = currentUser?.name
                        ? `${currentUser.name} (${currentUser.institutionName || activeRole.toUpperCase()})`
                        : `Pejabat Vokasi (${activeRole.toUpperCase()})`;
                      reviewMatchResult(activeDetail.id, 'Diterima');
                      setActiveDetail({
                        ...activeDetail,
                        humanReviewed: true,
                        decision: 'Diterima',
                        reviewedBy: reviewer,
                      });
                    }}
                    className="py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-xs transition"
                  >
                    Setujui Temuan
                  </button>
                  <button
                    onClick={() => {
                      const reviewer = currentUser?.name
                        ? `${currentUser.name} (${currentUser.institutionName || activeRole.toUpperCase()})`
                        : `Pejabat Vokasi (${activeRole.toUpperCase()})`;
                      reviewMatchResult(activeDetail.id, 'Ditolak');
                      setActiveDetail({
                        ...activeDetail,
                        humanReviewed: true,
                        decision: 'Ditolak',
                        reviewedBy: reviewer,
                      });
                    }}
                    className="py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-bold text-xs transition"
                  >
                    Tolak / Koreksi
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowRecModal(activeDetail);
                    setRecTitle(`Penyesuaian Modul: ${activeDetail.demandCompetencyName}`);
                    setRecDesc(activeDetail.aiSuggestedAdjustment || activeDetail.evidence);
                  }}
                  className="w-full py-2 px-3 bg-blue-900 hover:bg-blue-950 text-white rounded font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Jadikan Rekomendasi Resmi
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-800">Pilih baris pada tabel</p>
              <p className="text-slate-400 mt-1">
                Untuk memeriksa bukti perbandingan silabus kurikulum, saran penyesuaian, dan catatan verifikator.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recommendation Creator Modal */}
      {showRecModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateRecommendation}
            className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-slate-200 text-xs space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-700" />
                Terbitkan Rekomendasi Resmi Kebijakan
              </h3>
              <button
                type="button"
                onClick={() => setShowRecModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Judul Rekomendasi Tindak Lanjut:</label>
              <input
                type="text"
                required
                value={recTitle}
                onChange={(e) => setRecTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 focus:outline-blue-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Sekolah / Lembaga Sasaran:</label>
              <input
                type="text"
                disabled
                value={showRecModal.schoolName}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded text-slate-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Rincian Tindakan Konkret:</label>
              <textarea
                rows={4}
                required
                value={recDesc}
                onChange={(e) => setRecDesc(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 focus:outline-blue-600"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRecModal(null)}
                className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded font-bold shadow-xs"
              >
                Kirim ke Papan Rekomendasi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
