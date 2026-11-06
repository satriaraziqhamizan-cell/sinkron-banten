import React, { useState, useEffect } from 'react';
import { useSinkron } from '../context/SinkronContext';
import { useToast } from '../components/Toast';
import {
  Building2,
  GraduationCap,
  Users,
  Send,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Award,
  Layers,
  ArrowRight,
  PlusCircle,
  Search,
  Filter,
} from 'lucide-react';

interface SchoolModuleProps {
  initialTab?: 'programs' | 'tracer' | 'import' | 'rapor';
}

export const SchoolModule: React.FC<SchoolModuleProps> = ({ initialTab = 'programs' }) => {
  const {
    schoolPrograms,
    alumniRecords,
    tracerResponses,
    sendSurveyInvitation,
    importAlumniCsv,
    verifyTracerResponse,
    competencies,
    recommendations,
  } = useSinkron();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'programs' | 'tracer' | 'import' | 'rapor'>(initialTab);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [selectedProgramId, setSelectedProgramId] = useState<string>(schoolPrograms[0]?.id || '');
  const [csvText, setCsvText] = useState<string>(
    `nama,jurusan,tahun_lulus,email,phone\nIndra Kusuma,Teknik Pengelasan,2025,indra.kusuma@gmail.com,081299443322\nNabila Putri,Teknik Pengelasan,2025,nabila.putri@yahoo.com,081388776655\nRian Hidayat,Teknik Pengelasan,2025,rian.hidayat@outlook.com,085711442233`
  );

  const selectedProgram = schoolPrograms.find((p) => p.id === selectedProgramId) || schoolPrograms[0];

  // Calculate school tracer response rate
  const totalAlumni = alumniRecords.length;
  const completedSurveys = alumniRecords.filter((a) => a.invitationStatus === 'Selesai').length;
  const responseRate = totalAlumni > 0 ? ((completedSurveys / totalAlumni) * 100).toFixed(1) : '0';

  const handleImportSampleCsv = () => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return;
    const records = lines.slice(1).map((line) => {
      const parts = line.split(',');
      return {
        name: parts[0]?.trim(),
        email: parts[3]?.trim(),
        phone: parts[4]?.trim(),
        graduationYear: 2025,
        schoolId: selectedProgram.schoolId,
        programId: selectedProgram.id,
      };
    });

    importAlumniCsv(records);
    setFeedbackMsg(`Berhasil mengimpor ${records.length} data alumni baru ke kohort pelacakan lulusan.`);
    setTimeout(() => setFeedbackMsg(null), 6000);
    setActiveTab('tracer');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              Portal Satuan Pendidikan Vokasi
            </span>
            <span className="text-xs text-slate-500 font-medium">BKK &amp; Kurikulum SMK</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Manajemen Kurikulum Vokasi &amp; Pelacakan Lulusan (BKK)
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Kelola peta kompetensi praktikum per jurusan, impor daftar kohort lulusan, kirim undangan pelacak 6 bulan via tautan unik, dan pantau rapor keterserapan kerja lulusan sekolah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded font-bold border border-slate-200">
            {selectedProgram?.schoolName}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-white border border-slate-200 p-1 rounded-lg text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('programs')}
          className={`px-4 py-2 rounded-md transition shrink-0 ${activeTab === 'programs' ? 'bg-blue-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          Kurikulum Jurusan ({schoolPrograms.length})
        </button>
        <button
          onClick={() => setActiveTab('tracer')}
          className={`px-4 py-2 rounded-md transition shrink-0 ${activeTab === 'tracer' ? 'bg-blue-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          Pelacak Lulusan 6 Bulan ({alumniRecords.length} Kohort)
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2 rounded-md transition shrink-0 ${activeTab === 'import' ? 'bg-blue-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          Impor Alumni (CSV/Excel)
        </button>
        <button
          onClick={() => setActiveTab('rapor')}
          className={`px-4 py-2 rounded-md transition shrink-0 ${activeTab === 'rapor' ? 'bg-blue-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          Rapor Vokasi Sekolah
        </button>
      </div>

      {/* TAB 1: Programs & Curriculum Competencies */}
      {activeTab === 'programs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Pilih Jurusan Vokasi:
            </span>
            {schoolPrograms.map((prog) => (
              <button
                key={prog.id}
                onClick={() => setSelectedProgramId(prog.id)}
                className={`w-full text-left p-3.5 rounded-lg border transition text-xs ${
                  selectedProgram.id === prog.id
                    ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-400 font-bold">{prog.programCode}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    Akreditasi {prog.accreditation}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 mt-1">{prog.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {prog.graduatesPerYear} Lulusan/Tahun · {prog.competencies.length} Modul Inti
                </p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Rincian Kompetensi Diajarkan:</span>
                <h3 className="font-extrabold text-slate-900 text-base">{selectedProgram.name}</h3>
              </div>
              <span className="text-xs text-slate-500">{selectedProgram.schoolName}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-2.5">Kompetensi (Kamus SKKNI)</th>
                    <th className="p-2.5 text-center">Tingkat Penguasaan</th>
                    <th className="p-2.5 text-center">Porsi Praktik (%)</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedProgram.competencies.map((compMap) => {
                    const comp = competencies.find((c) => c.id === compMap.competencyId);
                    return (
                      <tr key={compMap.competencyId} className="hover:bg-slate-50">
                        <td className="p-2.5">
                          <span className="font-bold text-slate-900 block">{comp?.name || compMap.competencyId}</span>
                          <span className="text-[11px] text-slate-500">{comp?.skkniCode}</span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            Skala {compMap.masteryLevel}/5
                          </span>
                        </td>
                        <td className="p-2.5 text-center font-bold text-blue-900">
                          {compMap.practiceShare}% Jam Praktik
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {compMap.isCore ? 'Kompetensi Inti' : 'Peminatan'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-600 flex items-center justify-between text-[11px]">
              <span>Kurikulum diselaraskan dengan standar SKKNI Banten semester aktif.</span>
              <button className="text-blue-700 font-bold hover:underline">
                Perbarui Kurikulum Jurusan &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Tracer Study Cohort & Responses */}
      {activeTab === 'tracer' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 block">Total Kohort Terdaftar:</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{totalAlumni} Alumni</span>
              <span className="text-[11px] text-slate-400">Tahun Lulusan: 2025</span>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 block">Survei Selesai Diisi:</span>
              <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">{completedSurveys} Alumni</span>
              <span className="text-[11px] text-emerald-600 font-medium">Terverifikasi sistem BKK</span>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 block">Tingkat Respons (Response Rate):</span>
              <span className="text-2xl font-extrabold text-blue-900 mt-1 block">{responseRate}%</span>
              <span className="text-[11px] text-slate-400">Target Dinas: &ge; 70%</span>
            </div>
          </div>

          {/* Alumni Records List with Pair-System Follow Up */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-3 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Daftar Pelacakan Kohort Alumni</h3>
                <p className="text-slate-500 text-[11px]">
                  Kirim undangan atau ingatkan alumni yang belum merespons menggunakan metode pair-system guru &amp; rekan sebaya.
                </p>
              </div>

              <button
                onClick={() => {
                  let count = 0;
                  alumniRecords.forEach((a) => {
                    if (a.invitationStatus === 'Belum Dikirim') {
                      sendSurveyInvitation(a.id);
                      count++;
                    }
                  });
                  setFeedbackMsg(`Undangan survei pelacakan dengan tautan unik terkirim ke ${count || 'seluruh'} alumni.`);
                  setTimeout(() => setFeedbackMsg(null), 6000);
                }}
                className="px-3 py-1.5 bg-blue-800 text-white rounded font-bold hover:bg-blue-900 transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Massal Undangan Tautan</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-2.5">Nama Alumni</th>
                    <th className="p-2.5">Tautan Unik (Token)</th>
                    <th className="p-2.5">Kontak</th>
                    <th className="p-2.5 text-center">Pengingat</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {alumniRecords.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{a.name}</td>
                      <td className="p-2.5 font-mono text-[11px] text-blue-800">
                        /survei/{a.invitationToken}
                      </td>
                      <td className="p-2.5 text-slate-500 text-[11px]">
                        {a.email} <br />
                        <span className="font-mono text-slate-400">{a.phone}</span>
                      </td>
                      <td className="p-2.5 text-center text-slate-600 font-semibold">
                        {a.reminderCount}x
                      </td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            a.invitationStatus === 'Selesai'
                              ? 'bg-emerald-100 text-emerald-800'
                              : a.invitationStatus === 'Dibuka'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {a.invitationStatus}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        {a.invitationStatus !== 'Selesai' ? (
                          <button
                            onClick={() => {
                              sendSurveyInvitation(a.id);
                              showToast('Pengingat Terkirim', `Pengingat survei berhasil dikirimkan ke kontak ${a.name}.`, 'success');
                            }}
                            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-blue-800 rounded font-semibold text-[11px]"
                          >
                            Kirim Ulang
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CSV Import */}
      {activeTab === 'import' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-800 rounded">
              <Upload className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Impor Data Kohort Alumni (Format CSV / Excel)</h2>
          </div>
          <p className="text-slate-600">
            Sistem secara otomatis memvalidasi format kontak, mendeteksi duplikasi, dan menghasilkan tautan token unik pelacakan untuk setiap lulusan.
          </p>

          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Data CSV (Kolom: nama, jurusan, tahun_lulus, email, phone):
            </label>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full p-3 font-mono text-[11px] border border-slate-300 rounded bg-slate-50 text-slate-900"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              *Tidak memerlukan nomor identitas kependudukan (NIK).
            </span>
            <button
              onClick={handleImportSampleCsv}
              className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded font-bold shadow-xs transition"
            >
              Proses Impor Alumni
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Rapor Vokasi Sekolah */}
      {activeTab === 'rapor' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase text-blue-800">Evaluasi Internal</span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Rapor Kinerja Vokasi: {selectedProgram.schoolName}
              </h2>
            </div>
            <span className="text-xs text-slate-500">Semester Ganjil 2026/Ganjil</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-1">Serapan Lulusan Sekolah</span>
              <span className="text-2xl font-extrabold text-[#1F5FA8]">74.5%</span>
              <span className="text-[11px] text-emerald-700 font-bold block mt-1">
                +6.1% di atas rerata provinsi (68.4%)
              </span>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-1">Kesesuaian dengan Jurusan</span>
              <span className="text-2xl font-extrabold text-blue-900">82.0%</span>
              <span className="text-[11px] text-emerald-700 font-bold block mt-1">
                Kategori Sangat Tinggi
              </span>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-1">Rata-rata Waktu Tunggu</span>
              <span className="text-2xl font-extrabold text-slate-800">2.1 Bulan</span>
              <span className="text-[11px] text-slate-500 block mt-1">Hingga pekerjaan pertama</span>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-1">Tingkat Respons Tracer</span>
              <span className="text-2xl font-extrabold text-emerald-700">{responseRate}%</span>
              <span className="text-[11px] text-emerald-700 font-bold block mt-1">Memenuhi Standar Bappeda</span>
            </div>
          </div>
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
