import React, { useState, useEffect } from 'react';
import { useSinkron } from '../context/SinkronContext';
import { useAuth } from '../context/AuthContext';
import { DemandSignalItem, JobPosting } from '../types/sinkron';
import {
  Briefcase,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  Shield,
  Clock,
  Sparkles,
  ExternalLink,
  HelpCircle,
  Star,
  X,
} from 'lucide-react';

interface IndustryModuleProps {
  initialTab?: 'signals' | 'postings' | 'evaluations';
}

export const IndustryModule: React.FC<IndustryModuleProps> = ({ initialTab = 'signals' }) => {
  const {
    demandSignals,
    submitDemandSignal,
    jobPostings,
    addJobPosting,
    competencies,
    sectors,
    regions,
    activePeriod,
  } = useSinkron();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'signals' | 'postings' | 'evaluations'>(initialTab);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [showSignalModal, setShowSignalModal] = useState<boolean>(false);
  const [showJobModal, setShowJobModal] = useState<boolean>(false);

  // New Signal Form State
  const [companyName, setCompanyName] = useState<string>(
    currentUser?.institutionName || 'PT Chandra Asri Pacific Tbk'
  );
  const [sectorId, setSectorId] = useState<string>('sec_kimia');
  const [visibility, setVisibility] = useState<'anonim' | 'tampil'>('anonim');
  const [notes, setNotes] = useState<string>('Ekspansi unit produksi baru.');
  const [items, setItems] = useState<DemandSignalItem[]>([
    {
      id: 'item_draft_1',
      positionTitle: 'Junior Field Process Operator',
      competencyIds: ['comp_reaktor_kimia', 'comp_k3_umum'],
      educationMin: 'SMK',
      headcountMin: 20,
      headcountMax: 35,
      regionId: 'cilegon',
      contractType: 'PKWT (Kontrak)',
      priority: 'Tinggi',
      internshipSlots: 15,
      notes: 'Wajib bersedia bekerja dalam sistem shift.',
    },
  ]);

  // New Job State
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobType, setNewJobType] = useState<'Lowongan Kerja' | 'Magang Vokasi'>('Lowongan Kerja');
  const [newJobRegion, setNewJobRegion] = useState('cilegon');
  const [newJobSector, setNewJobSector] = useState('sec_manufaktur');
  const [newJobEducation, setNewJobEducation] = useState('SMK Teknik Mesin / Pengelasan');
  const [newJobHeadcount, setNewJobHeadcount] = useState(10);
  const [newJobSalaryMin, setNewJobSalaryMin] = useState(5000000);
  const [newJobSalaryMax, setNewJobSalaryMax] = useState(6500000);
  const [newJobDeadline, setNewJobDeadline] = useState('2026-12-15');
  const [newJobDesc, setNewJobDesc] = useState('');

  // Industry Evaluation Form State
  const [evalHiredCount, setEvalHiredCount] = useState<number>(35);
  const [evalTechRating, setEvalTechRating] = useState<number>(4);
  const [evalSoftRating, setEvalSoftRating] = useState<number>(4);
  const [evalMissingNotes, setEvalMissingNotes] = useState<string>(
    'Kemampuan membaca gambar teknik P&ID dan kedisiplinan APD K3 sudah sangat baik, namun jam terbang troubleshooting mesin otomatis perlu diperbanyak.'
  );
  const [evalInternshipInterest, setEvalInternshipInterest] = useState<boolean>(true);
  const [evalSubmitted, setEvalSubmitted] = useState<boolean>(false);

  const handleAddItemToSignal = () => {
    const newItem: DemandSignalItem = {
      id: `item_draft_${Date.now()}`,
      positionTitle: 'Operator Pemeliharaan Mesin',
      competencyIds: ['comp_plc_scada'],
      educationMin: 'SMK',
      headcountMin: 5,
      headcountMax: 10,
      regionId: 'cilegon',
      contractType: 'PKWT (Kontrak)',
      priority: 'Sedang',
      internshipSlots: 5,
    };
    setItems([...items, newItem]);
  };

  const handleSaveSignal = (e: React.FormEvent) => {
    e.preventDefault();
    submitDemandSignal({
      companyName,
      sectorId,
      visibility,
      notes,
      items,
    });
    setShowSignalModal(false);
    setFeedbackMsg('Sinyal kebutuhan kompetensi industri berhasil diajukan dan masuk ke antrean verifikasi!');
    setTimeout(() => setFeedbackMsg(null), 6000);
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    addJobPosting({
      title: newJobTitle,
      type: newJobType,
      regionId: newJobRegion,
      sectorId: newJobSector,
      educationMin: newJobEducation,
      headcount: newJobHeadcount,
      salaryMin: newJobSalaryMin,
      salaryMax: newJobSalaryMax,
      deadline: newJobDeadline,
      description: newJobDesc,
    });
    setShowJobModal(false);
    setFeedbackMsg('Lowongan/magang terverifikasi berhasil dipublikasikan!');
    setTimeout(() => setFeedbackMsg(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
              Portal Perusahaan &amp; HRD Kawasan
            </span>
            <span className="text-xs text-slate-500 font-medium">Periode Aktif: {activePeriod}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Pengelolaan Sinyal Industri &amp; Kemitraan Vokasi
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Sampaikan proyeksi kebutuhan tenaga kerja teknis dan slot pemagangan secara baku untuk mempengaruhi kurikulum 350+ SMK Banten dan bursa penempatan lulusan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSignalModal(true)}
            className="px-4 py-2 bg-[#1F5FA8] hover:bg-[#164985] text-white rounded-md text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Isi Sinyal Kebutuhan Baru</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-white border border-slate-200 p-1 rounded-lg text-xs font-semibold">
        <button
          onClick={() => setActiveTab('signals')}
          className={`px-4 py-2 rounded-md transition ${activeTab === 'signals' ? 'bg-blue-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          Daftar Sinyal Kebutuhan ({demandSignals.length})
        </button>
        <button
          onClick={() => setActiveTab('postings')}
          className={`px-4 py-2 rounded-md transition ${activeTab === 'postings' ? 'bg-blue-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          Lowongan &amp; Slot Magang ({jobPostings.length})
        </button>
        <button
          onClick={() => setActiveTab('evaluations')}
          className={`px-4 py-2 rounded-md transition ${activeTab === 'evaluations' ? 'bg-blue-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          Suara Industri: Penilaian Lulusan
        </button>
      </div>

      {activeTab === 'signals' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {demandSignals.map((sig) => {
              const totalHeadcount = sig.items.reduce((sum, item) => sum + item.headcountMax, 0);
              const totalIntern = sig.items.reduce((sum, item) => sum + item.internshipSlots, 0);
              const sectorObj = sectors.find((s) => s.id === sig.sectorId);

              return (
                <div key={sig.id} className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">{sig.companyName}</span>
                        {sig.visibility === 'anonim' ? (
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            Tampilan Publik: Anonim (Hanya Sektor &amp; Wilayah)
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            Tampilan Publik: Terbuka
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 mt-0.5 block">
                        Sektor: {sectorObj?.name} · Periode: {sig.periodId} · Diajukan: {sig.submittedAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
                        {sig.status}
                      </span>
                    </div>
                  </div>

                  {/* Signal Items Table */}
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                          <th className="p-2">Posisi Dibutuhkan</th>
                          <th className="p-2">Kompetensi Kamus (SKKNI)</th>
                          <th className="p-2">Wilayah</th>
                          <th className="p-2 text-right">Rentang Rekrutmen</th>
                          <th className="p-2 text-right">Slot Magang</th>
                          <th className="p-2 text-center">Prioritas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sig.items.map((it) => (
                          <tr key={it.id} className="hover:bg-slate-50">
                            <td className="p-2 font-bold text-slate-900">{it.positionTitle}</td>
                            <td className="p-2 text-slate-600">
                              <div className="flex flex-wrap gap-1">
                                {it.competencyIds.map((cid) => {
                                  const comp = competencies.find((c) => c.id === cid);
                                  return (
                                    <span key={cid} className="px-1.5 py-0.5 bg-blue-50 text-blue-800 rounded text-[10px] border border-blue-100">
                                      {comp?.name || cid}
                                    </span>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="p-2 text-slate-600 capitalize">{it.regionId}</td>
                            <td className="p-2 text-right font-bold text-slate-800">
                              {it.headcountMin} - {it.headcountMax} Orang
                            </td>
                            <td className="p-2 text-right font-semibold text-emerald-700">
                              {it.internshipSlots} Siswa
                            </td>
                            <td className="p-2 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  it.priority === 'Tinggi'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {it.priority}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Total Kuota: <strong>{totalHeadcount} orang</strong> · Magang: <strong>{totalIntern} slot</strong>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Diverifikasi oleh: {sig.verifiedBy || 'Dinas Tenaga Kerja Banten'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'postings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Lowongan &amp; Magang Vokasi</h3>
              <p className="text-xs text-slate-500">Publikasikan posisi resmi yang dapat dilamar langsung oleh alumni.</p>
            </div>
            <button
              onClick={() => setShowJobModal(true)}
              className="px-3.5 py-1.5 bg-blue-800 text-white rounded text-xs font-bold hover:bg-blue-900 transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tambah Lowongan / Magang</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobPostings.map((job) => (
              <div key={job.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        job.type === 'Magang Vokasi'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {job.type}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{job.title}</h3>
                    <span className="text-slate-500 text-[11px] block">{job.companyName}</span>
                  </div>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                    {job.status}
                  </span>
                </div>

                <p className="text-slate-600 line-clamp-2">{job.description}</p>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Kuota:</span>
                    <span className="font-bold text-slate-800">{job.headcount} Orang</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Pelamar Masuk:</span>
                    <span className="font-bold text-blue-800">{job.applicantsCount} Berkas</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Batas Lamaran: {job.deadline}</span>
                  <button className="text-blue-700 font-semibold hover:underline">
                    Kelola Pelamar ({job.applicantsCount}) &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'evaluations' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6 text-xs max-w-3xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-100 text-amber-800 rounded">
                <Star className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Survei Kepuasan Pengguna Lulusan (Suara Industri Banten)
              </h2>
            </div>
            <p className="text-slate-600 mt-1">
              Sebagai bagian dari siklus evaluasi semesteran, masukan Anda digunakan untuk menilai efektivitas lulusan SMK dan peserta pelatihan BLK di lingkungan kerja riil.
            </p>
          </div>

          {!evalSubmitted ? (
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  1. Perkiraan jumlah lulusan SMK/SMA Banten yang dipekerjakan dalam 1 tahun terakhir:
                </label>
                <input
                  type="number"
                  min="0"
                  value={evalHiredCount}
                  onChange={(e) => setEvalHiredCount(Number(e.target.value))}
                  className="w-32 px-3 py-1.5 border border-slate-300 rounded text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  2. Penilaian Penguasaan Keterampilan Teknis (Hard Skills) lulusan vokasi:
                </label>
                <div className="flex items-center gap-4 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEvalTechRating(star)}
                      className={`px-3 py-1.5 rounded border font-bold ${
                        evalTechRating === star
                          ? 'bg-blue-800 text-white border-blue-800'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Bintang {star} {star === 5 ? '(Sangat Mahir)' : star === 1 ? '(Kurang)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  3. Penilaian Sikap Kerja &amp; Kedisiplinan K3 (Soft Skills &amp; Work Ethic):
                </label>
                <div className="flex items-center gap-4 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEvalSoftRating(star)}
                      className={`px-3 py-1.5 rounded border font-bold ${
                        evalSoftRating === star
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Bintang {star} {star === 5 ? '(Sangat Baik)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  4. Catatan kompetensi yang paling mendesak perlu ditingkatkan oleh sekolah:
                </label>
                <textarea
                  rows={3}
                  value={evalMissingNotes}
                  onChange={(e) => setEvalMissingNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={evalInternshipInterest}
                    onChange={(e) => setEvalInternshipInterest(e.target.checked)}
                    className="text-blue-600 rounded"
                  />
                  <span>
                    Perusahaan bersedia menambah kuota slot magang bersertifikat untuk semester berikutnya.
                  </span>
                </label>
              </div>

              <button
                onClick={() => setEvalSubmitted(true)}
                className="px-6 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded shadow-xs transition"
              >
                Kirim Penilaian Evaluasi Lulusan
              </button>
            </div>
          ) : (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm">Umpan Balik Industri Berhasil Disimpan</h3>
              <p className="text-slate-600">
                Data penilaian Anda telah masuk ke dalam sinyal pendukung Peta Kecocokan Vokasi semester ini secara teragregasi.
              </p>
              <button
                onClick={() => setEvalSubmitted(false)}
                className="mt-3 px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-700 font-semibold"
              >
                Edit Jawaban
              </button>
            </div>
          )}
        </div>
      )}

      {/* New Signal Modal */}
      {showSignalModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form
            onSubmit={handleSaveSignal}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 border border-slate-200 text-xs space-y-4 my-8"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-700" />
                Formulir Sinyal Kebutuhan Tenaga Kerja Industri
              </h3>
              <button
                type="button"
                onClick={() => setShowSignalModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Nama Perusahaan / Kawasan:</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Sektor Industri:</label>
                <select
                  value={sectorId}
                  onChange={(e) => setSectorId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
                >
                  {sectors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Pilihan Visibilitas Publik:</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
                >
                  <option value="anonim">Anonim (Hanya Sektor &amp; Wilayah yang Tampil di Publik)</option>
                  <option value="tampil">Tampilkan Nama Perusahaan di Publik</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Periode Semester:</label>
                <input
                  type="text"
                  disabled
                  value={activePeriod}
                  className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-slate-600"
                />
              </div>
            </div>

            {/* List of positions */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Rincian Posisi yang Dibutuhkan:</span>
                <button
                  type="button"
                  onClick={handleAddItemToSignal}
                  className="text-blue-700 font-bold hover:underline flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Tambah Baris Posisi
                </button>
              </div>

              {items.map((it, idx) => (
                <div key={it.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Posisi #{idx + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setItems(items.filter((i) => i.id !== it.id))}
                        className="text-rose-600 hover:underline"
                      >
                        Hapus
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Nama Jabatan:</span>
                      <input
                        type="text"
                        value={it.positionTitle}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems(items.map((i) => (i.id === it.id ? { ...i, positionTitle: val } : i)));
                        }}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-900"
                      />
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">Kab/Kota Lokasi:</span>
                      <select
                        value={it.regionId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems(items.map((i) => (i.id === it.id ? { ...i, regionId: val } : i)));
                        }}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-900"
                      >
                        {regions.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">Kebutuhan (Orang):</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={it.headcountMin}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setItems(items.map((i) => (i.id === it.id ? { ...i, headcountMin: val } : i)));
                          }}
                          className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-slate-900"
                        />
                        <span>-</span>
                        <input
                          type="number"
                          value={it.headcountMax}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setItems(items.map((i) => (i.id === it.id ? { ...i, headcountMax: val } : i)));
                          }}
                          className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSignalModal(false)}
                className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded font-bold shadow-xs"
              >
                Kirim Sinyal Kebutuhan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSaveJob}
            className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-slate-200 text-xs space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-700" />
                Publikasikan Lowongan / Magang Vokasi
              </h3>
              <button
                type="button"
                onClick={() => setShowJobModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Judul Posisi:</label>
              <input
                type="text"
                required
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
                placeholder="Contoh: Welder GTAW Posisi 6G"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Jenis Program:</label>
                <select
                  value={newJobType}
                  onChange={(e) => setNewJobType(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
                >
                  <option value="Lowongan Kerja">Lowongan Kerja (PKWT/PKWTT)</option>
                  <option value="Magang Vokasi">Magang Vokasi 6 Bulan</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Lokasi Kab/Kota:</label>
                <select
                  value={newJobRegion}
                  onChange={(e) => setNewJobRegion(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
                >
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Deskripsi &amp; Persyaratan:</label>
              <textarea
                rows={3}
                required
                value={newJobDesc}
                onChange={(e) => setNewJobDesc(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
                placeholder="Jelaskan kriteria keahlian dan fasilitas yang didapatkan siswa/lulusan..."
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowJobModal(false)}
                className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded font-bold shadow-xs"
              >
                Publikasikan ke Bursa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Action feedback notification */}
      {feedbackMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl text-xs max-w-md flex items-center justify-between gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-white font-bold text-sm px-1"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};
