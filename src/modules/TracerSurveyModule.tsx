import React, { useState, useEffect } from 'react';
import { useSinkron } from '../context/SinkronContext';
import { useToast } from '../components/Toast';
import { api } from '../services/api';
import {
  GraduationCap,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  Building,
  HelpCircle,
  ArrowRight,
  Download,
  AlertCircle,
  Trash2,
  FileText,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';

interface TracerSurveyModuleProps {
  onNavigate?: (tab: string) => void;
  initialTab?: 'survey' | 'privacy';
  token?: string;
}

export const TracerSurveyModule: React.FC<TracerSurveyModuleProps> = ({ onNavigate, initialTab = 'survey', token }) => {
  const {
    alumniRecords,
    tracerResponses,
    submitTracerSurvey,
    competencies,
    sectors,
    regions,
    userSubjectRequests,
    submitUserSubjectRequest,
  } = useSinkron();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'survey' | 'privacy'>(initialTab);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const activeToken = token || (typeof window !== 'undefined' && window.location.pathname.startsWith('/survei/') ? window.location.pathname.replace('/survei/', '').trim() : '');

  const [isLoadingToken, setIsLoadingToken] = useState<boolean>(!!activeToken);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [alumniInfo, setAlumniInfo] = useState<{
    alumniName: string;
    schoolName: string;
    programName: string;
    graduationYear: number;
    alreadySubmitted: boolean;
    existingResponse: any;
  } | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (!activeToken) return;
    setIsLoadingToken(true);
    setTokenError(null);
    api
      .getSurveyByToken(activeToken)
      .then((data) => {
        setAlumniInfo(data);
        if (data.alreadySubmitted) {
          setIsSubmitted(true);
        }
      })
      .catch((err) => {
        setTokenError(err.message || 'Tautan survei tidak ditemukan atau sudah kedaluwarsa.');
      })
      .finally(() => {
        setIsLoadingToken(false);
      });
  }, [activeToken]);

  // Survey Form States
  const [statusCurrent, setStatusCurrent] = useState<
    'Bekerja Penuh' | 'Bekerja Kontrak/Paruh Waktu' | 'Wirausaha' | 'Magang' | 'Melanjutkan Studi' | 'Mencari Kerja' | 'Lainnya'
  >('Bekerja Penuh');
  const [sectorId, setSectorId] = useState<string>('sec_manufaktur');
  const [positionTitle, setPositionTitle] = useState<string>('Operator Mesin & Fabrikasi');
  const [employerName, setEmployerName] = useState<string>('PT Krakatau Posco');
  const [workRegionId, setWorkRegionId] = useState<string>('cilegon');
  const [fieldMatch, setFieldMatch] = useState<'Sangat Sesuai' | 'Sebagian Sesuai' | 'Tidak Sesuai'>('Sangat Sesuai');
  const [monthsToFirstJob, setMonthsToFirstJob] = useState<number>(2);
  const [incomeRange, setIncomeRange] = useState<'< UMR' | '1x - 1.5x UMR' | '1.5x - 2x UMR' | '> 2x UMR'>('1.5x - 2x UMR');
  const [barriers, setBarriers] = useState<string[]>([]);
  const [missingCompetencies, setMissingCompetencies] = useState<string[]>([
    'Pengelasan Pipa SMAW & GTAW Posisi 6G',
  ]);
  const [usefulCompetencies, setUsefulCompetencies] = useState<string[]>([
    'Penerapan Keselamatan & Kesehatan Kerja (K3) Industri',
    'Membaca Gambar Teknik Mesin',
  ]);
  const [consentContact, setConsentContact] = useState<boolean>(true);
  const [consentResearch, setConsentResearch] = useState<boolean>(true);

  const isWorking =
    statusCurrent === 'Bekerja Penuh' ||
    statusCurrent === 'Bekerja Kontrak/Paruh Waktu' ||
    statusCurrent === 'Wirausaha' ||
    statusCurrent === 'Magang';

  const handleToggleBarrier = (item: string) => {
    if (barriers.includes(item)) {
      setBarriers(barriers.filter((b) => b !== item));
    } else {
      setBarriers([...barriers, item]);
    }
  };

  const handleSubmitSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        invitationToken: activeToken || 'TRC-BANTEN-7A8B9C',
        statusCurrent,
        sectorId: isWorking ? sectorId : undefined,
        positionTitle: isWorking ? positionTitle : undefined,
        employerName: isWorking ? employerName : undefined,
        workRegionId: isWorking ? workRegionId : undefined,
        fieldMatch,
        monthsToFirstJob: isWorking ? monthsToFirstJob : undefined,
        incomeRange: isWorking ? incomeRange : undefined,
        barriers,
        missingCompetencies,
        usefulCompetencies,
        consentContactJobOffer: consentContact,
        consentAnonymizedResearch: consentResearch,
      };

      await api.submitSurvey(payload);
      setIsSubmitted(true);
      showToast('Survei Pelacakan Tersimpan', 'Terima kasih atas partisipasi Anda dalam memajukan vokasi Banten.', 'success');
    } catch (err: any) {
      showToast('Gagal Mengirim Survei', err.message || 'Terjadi kesalahan saat menyimpan respons survei.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadMyData = () => {
    submitUserSubjectRequest('Unduh Salinan Data', 'Unduh riwayat respons tracer study & consent');
    const myData = {
      subjek_data: 'Ahmad Rizky Pratama',
      sekolah: 'SMKN 1 Cilegon',
      jurusan: 'Teknik Pengelasan & Fabrikasi Logam',
      tahun_lulus: 2025,
      pelacakan_6_bulan: {
        status: statusCurrent,
        kesesuaian_keahlian: fieldMatch,
        waktu_tunggu_bulan: monthsToFirstJob,
        sektor: sectorId,
        wilayah_kerja: workRegionId,
      },
      hak_persetujuan: {
        kontak_lowongan: consentContact,
        riset_teranonimkan: consentResearch,
      },
      hukum_rujukan: 'Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)',
      diunduh_pada: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(myData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SINKRON_Data_Pribadi_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner & Sub-Tabs */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              {alumniInfo ? alumniInfo.schoolName : 'Alumni SMK/SMA Banten'}
            </span>
            <span className="text-xs text-slate-500 font-mono">Token: {activeToken || 'TRC-BANTEN-7A8B9C'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            {alumniInfo ? `Pelacakan Lulusan: ${alumniInfo.alumniName}` : 'Pelacakan Lulusan Vokasi 6 Bulan (Tracer Study)'}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            {alumniInfo
              ? `Program Keahlian: ${alumniInfo.programName} (Lulus ${alumniInfo.graduationYear}). Umpan balik Anda adalah dasar penyelarasan kurikulum vokasi Banten.`
              : 'Umpan balik Anda adalah dasar hukum dan data riil untuk memperbaiki kurikulum SMK dan menambah slot magang di Banten.'}
          </p>
        </div>

        {/* Tab switch between Survey and Privacy Rights */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('survey')}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === 'survey' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Formulir Survei (±3 Menit)
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
              activeTab === 'privacy' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Privasi Saya (UU PDP)
          </button>
        </div>
      </div>

      {isLoadingToken ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-12 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-800">Memverifikasi tautan survei...</p>
          <p className="text-xs text-slate-500 mt-1">Memuat identitas alumni dan data undangan resmi sekolah.</p>
        </div>
      ) : tokenError ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
            <AlertCircle className="w-5 h-5" />
            <span>Tautan Survei Tidak Valid atau Kedaluwarsa</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {tokenError} Silakan hubungi koordinator BKK sekolah asal Anda untuk mendapatkan tautan undangan resmi terbaru.
          </p>
        </div>
      ) : activeTab === 'survey' ? (
        !isSubmitted ? (
          <form onSubmit={handleSubmitSurvey} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-6 text-xs">
            {/* Short Privacy Statement in compliance with PDP law */}
            <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-3 text-slate-700 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-blue-900 text-[11px] block">Jaminan Keamanan &amp; Kerahasiaan Data</span>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                  SINKRON Banten tidak meminta NIK atau nomor rekening bank. Informasi yang Anda berikan hanya digunakan secara agregat untuk evaluasi pendidikan daerah dan penawaran lowongan resmi tanpa biaya perantara.
                </p>
              </div>
            </div>

            {/* Step 1: Status Terkini */}
            <div className="space-y-3 pb-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-900 text-sm">
                  1. Bagaimana status utama kegiatan Anda saat ini (6 bulan pasca lulus)?
                </label>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">
                  Wajib Diisi
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'Bekerja Penuh', label: 'Bekerja Penuh Waktu (Karyawan / Buruh)' },
                  { id: 'Bekerja Kontrak/Paruh Waktu', label: 'Bekerja Kontrak / Harian / Freelance' },
                  { id: 'Wirausaha', label: 'Wirausaha / Membuka Usaha Sendiri' },
                  { id: 'Magang', label: 'Sedang Menjalani Pemagangan Industri' },
                  { id: 'Melanjutkan Studi', label: 'Melanjutkan Pendidikan Tinggi (Kuliah)' },
                  { id: 'Mencari Kerja', label: 'Sedang Aktif Mencari Pekerjaan' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      statusCurrent === opt.id
                        ? 'border-blue-600 bg-blue-50/60 font-bold text-blue-950'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="statusCurrent"
                      checked={statusCurrent === opt.id}
                      onChange={() => setStatusCurrent(opt.id as any)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 2: Kondisi Kerja (jika bekerja/wirausaha) atau Kendala (jika mencari) */}
            {isWorking ? (
              <div className="space-y-4 pb-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">
                  2. Rincian Pekerjaan &amp; Keselarasan Kompetensi Vokasi
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Sektor Bidang Industri:</label>
                    <select
                      value={sectorId}
                      onChange={(e) => setSectorId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900"
                    >
                      {sectors.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Kabupaten/Kota Tempat Bekerja:</label>
                    <select
                      value={workRegionId}
                      onChange={(e) => setWorkRegionId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900"
                    >
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                      <option value="luar_banten">Luar Provinsi Banten</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Posisi / Jabatan Pekerjaan:</label>
                    <input
                      type="text"
                      required
                      value={positionTitle}
                      onChange={(e) => setPositionTitle(e.target.value)}
                      placeholder="Contoh: Welder, Operator CNC, Teknisi IT"
                      className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Nama Perusahaan / Tempat Usaha (Opsional):
                    </label>
                    <input
                      type="text"
                      value={employerName}
                      onChange={(e) => setEmployerName(e.target.value)}
                      placeholder="Nama PT / CV / Usaha Mandiri"
                      className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Kesesuaian dengan Jurusan SMK Sekolah:
                    </label>
                    <select
                      value={fieldMatch}
                      onChange={(e) => setFieldMatch(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 font-medium"
                    >
                      <option value="Sangat Sesuai">Sangat Sesuai (Sesuai Kompetensi Inti)</option>
                      <option value="Sebagian Sesuai">Sebagian Sesuai (Latar Belakang Membantu)</option>
                      <option value="Tidak Sesuai">Tidak Sesuai (Lintas Bidang Sama Sekali)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Waktu Tunggu Hingga Mendapat Pekerjaan Pertama:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="24"
                        value={monthsToFirstJob}
                        onChange={(e) => setMonthsToFirstJob(Number(e.target.value))}
                        className="w-24 px-3 py-2 border border-slate-300 rounded text-slate-900"
                      />
                      <span className="text-slate-500">Bulan setelah tanggal kelulusan</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Rentang Penghasilan Bulanan (Opsional):
                    </label>
                    <select
                      value={incomeRange}
                      onChange={(e) => setIncomeRange(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900"
                    >
                      <option value="< UMR">&lt; Upah Minimum Regional (UMR)</option>
                      <option value="1x - 1.5x UMR">1x s/d 1.5x UMR (Standar Vokasi)</option>
                      <option value="1.5x - 2x UMR">1.5x s/d 2x UMR (Kompetensi Spesifik)</option>
                      <option value="> 2x UMR">&gt; 2x UMR (Teknisi Khusus / Senior)</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pb-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">
                  2. Kendala Utama dalam Memperoleh Kesempatan Kerja
                </h3>
                <p className="text-slate-500 text-xs">
                  Pilihlah tantangan yang paling Anda hadapi (bisa lebih dari satu) agar Pemda Banten dapat menyiapkan beasiswa pelatihan BLK yang tepat sasaran:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Kurang sertifikasi kompetensi resmi (BNSP/Kemenaker)',
                    'Pengalaman magang industri masih kurang lama',
                    'Kalah bersaing dalam tes keterampilan teknis mesin',
                    'Biaya transportasi/akomodasi ke kawasan industri',
                    'Kekurangan informasi lowongan kerja yang terverifikasi',
                    'Keterbatasan peralatan praktik di sekolah dulu',
                  ].map((barr) => (
                    <label
                      key={barr}
                      onClick={() => handleToggleBarrier(barr)}
                      className={`p-2.5 rounded border cursor-pointer transition flex items-center gap-2 ${
                        barriers.includes(barr)
                          ? 'border-blue-600 bg-blue-50/60 font-semibold text-blue-900'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={barriers.includes(barr)}
                        readOnly
                        className="text-blue-600 rounded"
                      />
                      <span>{barr}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Umpan Balik Kurikulum Vokasi */}
            <div className="space-y-3 pb-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                3. Umpan Balik Kebutuhan Materi Kurikulum Sekolah
              </h3>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Kompetensi yang paling terasa KURANG saat terjun ke dunia kerja:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {competencies.slice(0, 6).map((comp) => (
                    <label
                      key={comp.id}
                      className="p-2 border border-slate-200 rounded hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={missingCompetencies.includes(comp.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setMissingCompetencies([...missingCompetencies, comp.name]);
                          } else {
                            setMissingCompetencies(missingCompetencies.filter((m) => m !== comp.name));
                          }
                        }}
                      />
                      <span className="line-clamp-1">{comp.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 4: Persetujuan Eksplisit (UU PDP Consent) */}
            <div className="space-y-3 pb-4">
              <h3 className="font-bold text-slate-900 text-sm">
                4. Persetujuan Pemrosesan Data (UU PDP No. 27/2022)
              </h3>

              <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentContact}
                    onChange={(e) => setConsentContact(e.target.checked)}
                    className="mt-0.5 text-blue-600 rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">
                      Persetujuan Pemberitahuan Lowongan &amp; Pelatihan BLK
                    </span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Saya bersedia dihubungi via email/WhatsApp resmi BKK sekolah jika ada lowongan kerja atau program pelatihan vokasi bersubsidi yang relevan dengan profil saya.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-slate-200">
                  <input
                    type="checkbox"
                    checked={consentResearch}
                    onChange={(e) => setConsentResearch(e.target.checked)}
                    className="mt-0.5 text-blue-600 rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">
                      Persetujuan Analisis Statistik Teranonimkan
                    </span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Saya mengizinkan data jawaban saya digunakan dalam bentuk agregat teranonimkan untuk riset kebijakan vokasi Bappeda dan Disdik Banten.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-slate-500 text-[11px]">
                Data tersimpan terenkripsi sesuai UU Pelindungan Data Pribadi (UU PDP No. 27/2022).
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-blue-800 hover:bg-blue-900 text-white rounded-md font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menyimpan ke Server...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Respons Pelacak 6 Bulan</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Thank You Screen (Section 5.8 Spec) */
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Terima Kasih atas Kontribusi Anda!
            </h2>
            <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
              Data respons pelacakan lulusan Anda telah berhasil diverifikasi oleh sistem dan dicatat ke dalam agregat semesteran Provinsi Banten.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              {onNavigate && (
                <>
                  <button
                    onClick={() => onNavigate('alumni_lowongan')}
                    className="px-4 py-2 bg-blue-800 text-white rounded font-bold text-xs hover:bg-blue-900 transition"
                  >
                    Jelajah Lowongan &amp; Magang Relevan
                  </button>
                  <button
                    onClick={() => onNavigate('alumni_pelatihan')}
                    className="px-4 py-2 bg-slate-100 text-slate-800 rounded font-semibold text-xs hover:bg-slate-200 transition"
                  >
                    Katalog Pelatihan BLK Banten
                  </button>
                </>
              )}
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-4 py-2 border border-slate-300 text-slate-600 rounded font-medium text-xs hover:bg-slate-50 transition"
              >
                Tinjau Kembali Jawaban
              </button>
            </div>
          </div>
        )
      ) : (
        /* Privacy Rights Tab: UU PDP No. 27/2022 (Section 5.16 Spec) */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-6 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Pusat Transparansi &amp; Hak Subjek Data Anda
              </h2>
            </div>
            <p className="text-slate-600 mt-1">
              Berdasarkan UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi, Anda memiliki hak penuh untuk mengetahui data apa yang disimpan, mengunduh salinannya, mengubah izin persetujuan, atau meminta penghapusan akun.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Action 1: Download my data */}
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-900 block mb-1">Unduh Salinan Data Saya (Portabilitas)</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Dapatkan arsip lengkap berisi seluruh data profil, tahun kelulusan, dan riwayat jawaban survei Anda dalam format terstruktur JSON/CSV.
                </p>
              </div>
              <button
                onClick={handleDownloadMyData}
                className="mt-4 px-3 py-2 bg-white border border-slate-300 hover:bg-blue-50 hover:text-blue-800 text-slate-800 rounded font-bold transition flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Berkas Data JSON</span>
              </button>
            </div>

            {/* Action 2: Consent manager */}
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-900 block mb-1">Kelola Persetujuan (Consent Logs)</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Tarik atau perbarui izin penerimaan notifikasi lowongan dan pemanfaatan data agregat kapan saja tanpa memengaruhi hak layanan lainnya.
                </p>
              </div>
              <button
                onClick={() => {
                  submitUserSubjectRequest('Tarik Persetujuan', 'Alumni mematikan izin kontak lowongan');
                  setConsentContact(!consentContact);
                  showToast('Persetujuan Diperbarui', 'Status persetujuan berhasil diperbarui dan dicatat dalam audit log.', 'success');
                }}
                className="mt-4 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded font-semibold transition"
              >
                {consentContact ? 'Tarik Izin Kontak Lowongan' : 'Aktifkan Izin Kontak Lowongan'}
              </button>
            </div>
          </div>

          {/* User Subject Data Requests Log */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Riwayat Permintaan Hak Subjek Data</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="p-2.5">ID Permintaan</th>
                    <th className="p-2.5">Jenis Hak</th>
                    <th className="p-2.5">Tanggal Pengajuan</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Catatan DPO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userSubjectRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="p-2 font-mono text-slate-500">{req.id}</td>
                      <td className="p-2 font-semibold text-slate-900">{req.requestType}</td>
                      <td className="p-2 text-slate-600">{req.submittedAt}</td>
                      <td className="p-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {req.status}
                        </span>
                      </td>
                      <td className="p-2 text-slate-600">{req.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delete Account / Data Option */}
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-rose-900 block">Hak Penghapusan Data (Right to Erasure)</span>
              <p className="text-rose-700 text-[11px] mt-0.5">
                Mengajukan permohonan penghapusan permanen seluruh identitas kontak pribadi Anda dari server SINKRON Banten.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Ajukan permohonan penghapusan data akun kepada Data Protection Officer (DPO)?')) {
                  submitUserSubjectRequest('Penghapusan Data', 'Alumni mengajukan penghapusan kontak permanen.');
                  showToast('Permohonan Diajukan', 'Permohonan penghapusan telah diajukan dan diproses sesuai tenggat UU PDP.', 'success');
                }
              }}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold shrink-0 transition"
            >
              Ajukan Hapus Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
