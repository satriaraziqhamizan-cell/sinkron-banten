import React, { useState } from 'react';
import { useSinkron } from '../context/SinkronContext';
import { useToast } from '../components/Toast';
import {
  Users2,
  FileCheck2,
  Calendar,
  Building,
  GraduationCap,
  Briefcase,
  Globe,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  MapPin,
  X,
} from 'lucide-react';

interface PentahelixForumModuleProps {
  initialTab?: 'partners' | 'mou' | 'sessions';
}

export const PentahelixForumModule: React.FC<PentahelixForumModuleProps> = ({ initialTab = 'partners' }) => {
  const { pentahelixPartners, mouAgreements, forumSessions } = useSinkron();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'partners' | 'mou' | 'sessions'>(initialTab);
  const [selectedPartnerCategory, setSelectedPartnerCategory] = useState<string>('all');
  const [showMouModal, setShowMouModal] = useState<boolean>(false);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const filteredPartners = pentahelixPartners.filter((p) => {
    if (selectedPartnerCategory !== 'all' && p.category !== selectedPartnerCategory) return false;
    return true;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'Pemerintah':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Pemerintah</span>;
      case 'Bisnis/Industri':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Bisnis / Industri</span>;
      case 'Akademisi':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">Akademisi</span>;
      case 'Komunitas/Asosiasi':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Komunitas / BKK</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Media Massa</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
              Kolaborasi Multi-Pihak
            </span>
            <span className="text-xs text-slate-500 font-medium">Tata Kelola 5 Unsur Banten</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Forum Pentahelix &amp; Kemitraan Strategis Vokasi
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Wadah kolaborasi formal lima unsur: Pemerintah Daerah, Industri/Bisnis, Akademisi Perguruan Tinggi, Komunitas Guru/BKK, dan Media Massa untuk merumuskan aksi nyata secara transparan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMouModal(true)}
            className="px-4 py-2 bg-[#1F5FA8] hover:bg-[#164985] text-white rounded-md text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Daftarkan MoU / PKS Baru</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-white border border-slate-200 p-1 rounded-lg text-xs font-semibold">
        <button
          onClick={() => setActiveTab('partners')}
          className={`px-4 py-2 rounded-md transition ${activeTab === 'partners' ? 'bg-blue-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          Direktori Mitra 5 Unsur ({pentahelixPartners.length})
        </button>
        <button
          onClick={() => setActiveTab('mou')}
          className={`px-4 py-2 rounded-md transition ${activeTab === 'mou' ? 'bg-blue-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          Repositori Kesepakatan (MoU / PKS) ({mouAgreements.length})
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 rounded-md transition ${activeTab === 'sessions' ? 'bg-blue-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          Agenda &amp; Notulen Rapat Semesteran
        </button>
      </div>

      {/* TAB 1: Partners Directory */}
      {activeTab === 'partners' && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Filter Unsur Pentahelix:</span>
              <select
                value={selectedPartnerCategory}
                onChange={(e) => setSelectedPartnerCategory(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium"
              >
                <option value="all">Semua Unsur</option>
                <option value="Pemerintah">Pemerintah</option>
                <option value="Bisnis/Industri">Bisnis / Industri</option>
                <option value="Akademisi">Akademisi</option>
                <option value="Komunitas/Asosiasi">Komunitas / Asosiasi</option>
                <option value="Media">Media Massa</option>
              </select>
            </div>
            <span className="text-slate-500 font-medium">{filteredPartners.length} Institusi Terdaftar</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPartners.map((part) => (
              <div key={part.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-3 text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    {getCategoryBadge(part.category)}
                    <span className="text-[11px] text-slate-400 font-medium">{part.region}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{part.name}</h3>
                  <p className="text-slate-600 mt-2 bg-slate-50 p-2.5 rounded border border-slate-100">
                    <strong className="text-slate-700 block text-[11px]">Bentuk Kolaborasi Aktif:</strong>
                    {part.activeCollab}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Kontak: <strong>{part.contactPerson}</strong></span>
                  <span className="font-semibold text-blue-800">{part.mouCount} PKS Aktif</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MoU / PKS Repository */}
      {activeTab === 'mou' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">Repositori Perjanjian Kerjasama (MoU &amp; PKS)</h2>
            <p className="text-slate-500">
              Dokumen resmi kesepakatan pemagangan, penyelarasan kurikulum, dan rekrutmen lulusan yang dapat dipantau masa berlakunya.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="p-2.5">Nomor Register / Kode</th>
                  <th className="p-2.5">Judul Perjanjian Kerjasama</th>
                  <th className="p-2.5">Para Pihak yang Terikat</th>
                  <th className="p-2.5">Masa Berlaku</th>
                  <th className="p-2.5 text-center">Status</th>
                  <th className="p-2.5 text-center">Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mouAgreements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono text-[11px] font-bold text-slate-500">{m.code}</td>
                    <td className="p-2.5 font-bold text-slate-900">{m.title}</td>
                    <td className="p-2.5 text-slate-600">
                      <div className="flex flex-wrap gap-1">
                        {m.parties.map((p, i) => (
                          <span key={i} className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-2.5 text-slate-600 text-[11px]">
                      {m.startDate} s/d {m.endDate}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {m.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => showToast('Simulasi Berkas MoU', 'Fitur simulasi untuk demo — belum terhubung ke layanan nyata', 'info')}
                        className="text-blue-700 font-bold hover:underline"
                      >
                        Lihat Naskah PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Semester Forum Sessions & Minutes */}
      {activeTab === 'sessions' && (
        <div className="space-y-4 text-xs">
          {forumSessions.map((fs) => (
            <div key={fs.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    Periode: {fs.periodId}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base mt-1">{fs.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {fs.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {fs.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users2 className="w-3.5 h-3.5" /> Hadir: {fs.attendeesCount} Peserta 5 Unsur
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => showToast('Simulasi Notulen Rapat', 'Fitur simulasi untuk demo — belum terhubung ke layanan nyata', 'info')}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded font-semibold text-xs transition"
                >
                  Unduh Notulen PDF
                </button>
              </div>

              {/* Agenda & Minutes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-800">Agenda Pembahasan Rapat:</h4>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    {fs.agendaItems.map((ag, i) => (
                      <li key={i}>{ag}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-800">Ringkasan Kesepakatan &amp; Notulen:</h4>
                  <p className="text-slate-600 leading-relaxed">{fs.minutesSummary}</p>
                </div>
              </div>

              {/* Action items */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900">Papan Tindak Lanjut Rapat (To-Do Bersama):</h4>
                <div className="space-y-2">
                  {fs.actionItems.map((act, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white border border-slate-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-slate-800 block">{act.title}</span>
                        <span className="text-[11px] text-slate-500">Penanggung Jawab: {act.owner}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400">Tenggat: {act.dueDate}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            act.status === 'Selesai'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {act.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New MoU Modal */}
      {showMouModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setShowMouModal(false);
              showToast('Simulasi Registrasi MoU', 'Fitur simulasi untuk demo — belum terhubung ke layanan nyata', 'info');
            }}
            className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-slate-200 text-xs space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-700" />
                Catat Kesepakatan Bersama (MoU / PKS)
              </h3>
              <button
                type="button"
                onClick={() => setShowMouModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Judul Kesepakatan Kerjasama:</label>
              <input
                type="text"
                required
                placeholder="Contoh: PKS Pemagangan Industri Manufaktur Baja Cikande"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Para Pihak yang Terlibat (Pisahkan koma):</label>
              <input
                type="text"
                required
                placeholder="Disdik Banten, PT Krakatau Steel, SMKN 1 Cilegon"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Tanggal Mulai Berlaku:</label>
                <input
                  type="date"
                  required
                  defaultValue="2026-11-01"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Tanggal Berakhir:</label>
                <input
                  type="date"
                  required
                  defaultValue="2028-11-01"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowMouModal(false)}
                className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded font-bold shadow-xs"
              >
                Simpan Register MoU
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
