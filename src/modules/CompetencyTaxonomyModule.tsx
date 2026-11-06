import React, { useState, useEffect } from 'react';
import { useSinkron } from '../context/SinkronContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Competency } from '../types/sinkron';
import {
  BookOpen,
  Search,
  Filter,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  Download,
  X,
} from 'lucide-react';

interface CompetencyTaxonomyModuleProps {
  initialTab?: 'dictionary' | 'proposals' | 'research';
}

export const CompetencyTaxonomyModule: React.FC<CompetencyTaxonomyModuleProps> = ({ initialTab = 'dictionary' }) => {
  const {
    competencies,
    sectors,
    addCompetencyProposal,
    approveCompetency,
    activeRole,
  } = useSinkron();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'dictionary' | 'proposals' | 'research'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Proposal form state
  const [propName, setPropName] = useState('');
  const [propSector, setPropSector] = useState('sec_manufaktur');
  const [propDesc, setPropDesc] = useState('');
  const [propSkkni, setPropSkkni] = useState('');
  const [propLevel, setPropLevel] = useState(3);
  const [propSynonyms, setPropSynonyms] = useState('');

  // Research data request form
  const [researcherName, setResearcherName] = useState(
    currentUser?.name || 'Dr. Ir. Wahyu Susihono, MT'
  );
  const [institutionName, setInstitutionName] = useState(
    currentUser?.institutionName || 'Fakultas Teknik Universitas Sultan Ageng Tirtayasa (UNTIRTA)'
  );
  const [researchTopic, setResearchTopic] = useState('Evaluasi Ekonometrika Keselarasan Kurikulum Vokasi terhadap Penyerapan Tenaga Kerja Industri Kimia Banten');
  const [ethicsApproval, setEthicsApproval] = useState('Nomor Surat Izin Riset: 104/UN43/LPPM/2026');
  const [researchSubmitted, setResearchSubmitted] = useState(false);

  const filtered = competencies.filter((c) => {
    if (selectedSector !== 'all' && c.sectorId !== selectedSector) return false;
    if (searchTerm) {
      const matchName = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCode = c.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSyn = c.synonyms.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchName && !matchCode && !matchSyn) return false;
    }
    return true;
  });

  const pendingProposals = competencies.filter((c) => c.status === 'ditinjau');

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    addCompetencyProposal({
      name: propName,
      sectorId: propSector,
      description: propDesc,
      skkniCode: propSkkni || 'Rujukan Standar Industri Daerah Banten',
      levelScale: propLevel,
      synonyms: propSynonyms.split(',').map((s) => s.trim()).filter(Boolean),
    });
    setShowProposalModal(false);
    setPropName('');
    setPropDesc('');
    setPropSkkni('');
    setPropSynonyms('');
    setFeedbackMsg('Usulan kompetensi baru berhasil diajukan dan masuk ke antrean verifikasi tim akademisi!');
    setTimeout(() => setFeedbackMsg(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded">
              Taksonomi Bersama Vokasi &amp; Industri
            </span>
            <span className="text-xs text-slate-500 font-medium">Standar SKKNI &amp; KKNI</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Kamus Kompetensi Kerja (Satu Bahasa Vokasi Banten)
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Bahasa baku bersama agar sinyal kebutuhan HRD industri, silabus kurikulum sekolah, dan hasil survei lulusan dapat dibandingkan secara matematis dan objektif.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProposalModal(true)}
            className="px-4 py-2 bg-[#1F5FA8] hover:bg-[#164985] text-white rounded-md text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Usulkan Istilah Kompetensi Baru</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-white border border-slate-200 p-1 rounded-lg text-xs font-semibold">
        <button
          onClick={() => setActiveTab('dictionary')}
          className={`px-4 py-2 rounded-md transition ${activeTab === 'dictionary' ? 'bg-blue-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          Daftar Kompetensi Terstandar ({competencies.length})
        </button>
        <button
          onClick={() => setActiveTab('proposals')}
          className={`px-4 py-2 rounded-md transition flex items-center gap-1.5 ${
            activeTab === 'proposals' ? 'bg-blue-800 text-white' : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>Antrean Tinjauan Akademisi</span>
          {pendingProposals.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-bold">
              {pendingProposals.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('research')}
          className={`px-4 py-2 rounded-md transition ${activeTab === 'research' ? 'bg-blue-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          Permintaan Akses Data Riset Akademik
        </button>
      </div>

      {/* TAB 1: Dictionary Exploration */}
      {activeTab === 'dictionary' && (
        <div className="space-y-4">
          {/* Search Toolbar */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama kompetensi, kode SKKNI, atau kata kunci..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-blue-600"
                />
              </div>

              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-medium"
              >
                <option value="all">Semua Sektor Industri</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-slate-500 font-medium">
              Menampilkan <strong>{filtered.length}</strong> kompetensi terverifikasi
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((comp) => {
              const sec = sectors.find((s) => s.id === comp.sectorId);
              return (
                <div key={comp.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-3 text-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {comp.code}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          comp.status === 'disetujui'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {comp.status === 'disetujui' ? 'Resmi SKKNI' : 'Draf Usulan'}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{comp.name}</h3>

                    <p className="text-slate-600 leading-relaxed line-clamp-3 bg-slate-50 p-2.5 rounded border border-slate-100">
                      {comp.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px]">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Sektor: <strong className="text-slate-700">{sec?.name.split(',')[0]}</strong></span>
                      <span className="font-semibold text-blue-900">Level KKNI: {comp.kkniLevel || 3}</span>
                    </div>

                    {comp.synonyms.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {comp.synonyms.map((syn, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
                            {syn}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Proposals Review Queue */}
      {activeTab === 'proposals' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Antrean Tinjauan Usulan Kompetensi Baru (Tim Akademisi &amp; Asosiasi)
            </h2>
            <p className="text-slate-500 mt-0.5">
              Setiap kali industri atau sekolah mengusulkan istilah keahlian baru yang belum tercatat, tim ahli menelaah pemetaan ke SKKNI sebelum diintegrasikan ke kamus resmi.
            </p>
          </div>

          {pendingProposals.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="font-bold text-slate-700">Tidak ada usulan yang menunggu tinjauan</p>
              <p className="text-xs mt-1">Seluruh istilah kompetensi telah berstatus resmi disetujui.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingProposals.map((item) => (
                <div key={item.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {item.code}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{item.name}</h3>
                      <p className="text-slate-500 text-[11px] mt-0.5">{item.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          approveCompetency(item.id);
                          showToast('Standar Disetujui', `Kompetensi "${item.name}" disetujui menjadi standar resmi.`, 'success');
                        }}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-xs transition"
                      >
                        Setujui Standar
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 flex items-center justify-between">
                    <span>Diusulkan oleh: {item.proposedBy || 'Pengguna Industri'}</span>
                    <span>Rujukan: {item.skkniCode}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Academic Research Data Access Request */}
      {activeTab === 'research' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6 text-xs max-w-3xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-purple-100 text-purple-800 rounded">
                <FileText className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Permohonan Akses Kumpulan Data Riset Teranonimkan
              </h2>
            </div>
            <p className="text-slate-600 mt-1">
              Dosen, peneliti, dan lembaga akademisi dapat mengajukan permohonan akses dataset mikro teranonimkan untuk evaluasi dampak kebijakan, skripsi, tesis, atau riset jurnal internasional dengan perjanjian penggunaan data.
            </p>
          </div>

          {!researchSubmitted ? (
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Nama Peneliti Utama / Pemohon:</label>
                <input
                  type="text"
                  value={researcherName}
                  onChange={(e) => setResearcherName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Institusi Perguruan Tinggi / Lembaga Riset:</label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Judul Riset / Tujuan Penggunaan Data:</label>
                <textarea
                  rows={3}
                  value={researchTopic}
                  onChange={(e) => setResearchTopic(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Nomor Izin Penelitian / Klirens Etik:</label>
                <input
                  type="text"
                  value={ethicsApproval}
                  onChange={(e) => setEthicsApproval(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200 text-slate-600 leading-relaxed text-[11px]">
                <strong className="text-slate-800 block mb-1">Pakta Integritas Penggunaan Data:</strong>
                Pemohon berkomitmen tidak melakukan upaya identifikasi ulang (re-identification) terhadap alumni atau individu mana pun, serta wajib mencantumkan sitasi resmi SINKRON Provinsi Banten pada publikasi akhir.
              </div>

              <button
                onClick={() => setResearchSubmitted(true)}
                className="px-6 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded shadow-xs transition"
              >
                Ajukan Perjanjian Akses Dataset
              </button>
            </div>
          ) : (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm">Permohonan Riset Disetujui (Akses Terkontrol)</h3>
              <p className="text-slate-600">
                Token akses terbatas waktu telah diterbitkan untuk dataset teranonimkan kohort 2024-2026.
              </p>
              <button
                onClick={() => {
                  showToast('Simulasi Pengunduhan Dataset', 'Fitur simulasi untuk demo — belum terhubung ke layanan nyata', 'info');
                  setResearchSubmitted(false);
                }}
                className="mt-3 px-4 py-2 bg-blue-800 text-white rounded font-bold hover:bg-blue-900"
              >
                Unduh Dataset Mikro (.CSV Teranonim)
              </button>
            </div>
          )}
        </div>
      )}

      {/* New Competency Modal */}
      {showProposalModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateProposal}
            className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-slate-200 text-xs space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-700" />
                Usulkan Kompetensi Baru ke Kamus
              </h3>
              <button
                type="button"
                onClick={() => setShowProposalModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Nama Kompetensi / Keahlian Teknis:</label>
              <input
                type="text"
                required
                value={propName}
                onChange={(e) => setPropName(e.target.value)}
                placeholder="Contoh: Operasi Pompa Slurry Bertekanan Tinggi"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Sektor Industri:</label>
                <select
                  value={propSector}
                  onChange={(e) => setPropSector(e.target.value)}
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
                <label className="font-bold text-slate-800 block mb-1">Skala Level KKNI (1-5):</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={propLevel}
                  onChange={(e) => setPropLevel(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Deskripsi Ruang Lingkup Kerja:</label>
              <textarea
                rows={3}
                required
                value={propDesc}
                onChange={(e) => setPropDesc(e.target.value)}
                placeholder="Jelaskan keterampilan apa yang dilakukan di pabrik atau tempat kerja..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Istilah Lain / Sinonim (Pisahkan koma):</label>
              <input
                type="text"
                value={propSynonyms}
                onChange={(e) => setPropSynonyms(e.target.value)}
                placeholder="Slurry Pump Operator, Teknisi Pompa Pabrik"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowProposalModal(false)}
                className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded font-bold shadow-xs"
              >
                Kirim Usulan Istilah
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
