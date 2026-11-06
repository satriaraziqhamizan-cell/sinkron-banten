import React, { useState, useEffect } from 'react';
import { useSinkron } from '../context/SinkronContext';
import { useToast } from '../components/Toast';
import {
  FileText,
  Download,
  ShieldCheck,
  HelpCircle,
  Mail,
  Phone,
  Code2,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  Lock,
  Layers,
  Send,
} from 'lucide-react';

interface MediaLegalModuleProps {
  initialSubTab?: 'cara_kerja' | 'ruang_media' | 'bantuan_faq' | 'privasi_legal';
}

export const MediaLegalModule: React.FC<MediaLegalModuleProps> = ({ initialSubTab = 'cara_kerja' }) => {
  const { activePeriod, regions } = useSinkron();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'cara_kerja' | 'ruang_media' | 'bantuan_faq' | 'privasi_legal'>(
    initialSubTab
  );

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Pelacakan Lulusan');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
      setExpandedFaq(null);
      setTicketSent(false);
    }
  }, [initialSubTab]);

  const handleTabChange = (tab: 'cara_kerja' | 'ruang_media' | 'bantuan_faq' | 'privasi_legal') => {
    setActiveTab(tab);
    setExpandedFaq(null);
    setTicketSent(false);
  };

  const faqs = [
    {
      q: 'Mengapa SINKRON Banten tidak meminta NIK atau nomor KK alumni?',
      a: 'Berdasarkan prinsip pembatasan tujuan dan minimisasi data dalam UU Pelindungan Data Pribadi (UU PDP No. 27/2022), survei pelacakan lulusan hanya memerlukan nama, jurusan, dan kontak untuk verifikasi. Kami menjamin privasi alumni terlindungi sepenuhnya tanpa pengumpulan dokumen identitas kependudukan sensitif.',
    },
    {
      q: 'Bagaimana cara HRD Industri mengisi sinyal kebutuhan kompetensi?',
      a: 'Perwakilan industri dapat mendaftarkan akun perusahaan, memilih kompetensi teknis dari Kamus Standar SKKNI, menentukan kuota rekrutmen serta slot magang. Terdapat opsi anonimitas jika perusahaan hanya ingin menampilkan sektor dan kabupaten/kota ke publik.',
    },
    {
      q: 'Apakah ada biaya bagi alumni untuk melamar lowongan atau mengikuti pelatihan BLK?',
      a: 'Seluruh lowongan kerja, program magang vokasi, dan pelatihan UPTD BLK di platform SINKRON Banten 100% BEBAS BIAYA. Pemda Banten membiayai pelatihan melalui APBD, dan perusahaan dilarang memungut biaya pendaftaran.',
    },
    {
      q: 'Apa itu metode "Pair-System" dalam pelacakan alumni SMK?',
      a: 'Metode penjangkauan kolaboratif di mana guru produktif, pengurus BKK, dan perwakilan alumni kohort saling membantu menghubungi teman seangkatan yang belum mengisi survei 6 bulan via pesan WhatsApp ramah untuk memastikan tingkat respons mencapai target &ge; 70%.',
    },
  ];

  const handleDownloadDataset = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Kode,Kabupaten_Kota,Penyerapan_6bln_pct,TPT_BPS_pct,Industri_Aktif,Lowongan_Tersedia\n' +
      regions
        .map((r) => `${r.code},${r.name},${r.graduateAbsorptionRate},${r.tpt},${r.activeCompanies},${r.openJobSlots}`)
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SINKRON_Data_Terbuka_${activePeriod.replace('/', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSent(true);
    setTicketSubject('');
    setTicketMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
              Informasi Publik &amp; Transparansi
            </span>
            <span className="text-xs text-slate-500">Provinsi Banten</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Panduan, Ruang Media &amp; Kebijakan Privasi
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Akses dokumentasi teknis, naskah siaran pers, data agregat terbuka, dan standar kepatuhan hukum perlindungan data pribadi SINKRON Banten.
          </p>
        </div>

        {/* Sub-nav */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => handleTabChange('cara_kerja')}
            className={`px-3 py-1.5 rounded transition ${activeTab === 'cara_kerja' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Cara Kerja
          </button>
          <button
            onClick={() => handleTabChange('ruang_media')}
            className={`px-3 py-1.5 rounded transition ${activeTab === 'ruang_media' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Ruang Media &amp; Data
          </button>
          <button
            onClick={() => handleTabChange('bantuan_faq')}
            className={`px-3 py-1.5 rounded transition ${activeTab === 'bantuan_faq' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            FAQ &amp; Bantuan
          </button>
          <button
            onClick={() => handleTabChange('privasi_legal')}
            className={`px-3 py-1.5 rounded transition ${activeTab === 'privasi_legal' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Privasi &amp; Legal
          </button>
        </div>
      </div>

      {/* TAB 1: How It Works */}
      {activeTab === 'cara_kerja' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-8 text-xs">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Alur Pengguna Lengkap (End-to-End Workflow)</h2>
            <p className="text-slate-500 mt-0.5">
              Bagaimana data bergerak dari lantai pabrik ke ruang kelas SMK dan kembali ke kebijakan pemerintah:
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <span className="w-6 h-6 rounded-full bg-blue-800 text-white font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Industri Memberi Sinyal</h3>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  HRD perusahaan mengisi proyeksi kebutuhan posisi kerja, keahlian teknis dari kamus SKKNI, dan kesiapan menerima magang 6 bulan.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Penyusunan Peta Celah</h3>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Algoritma SINKRON membandingkan silabus kurikulum sekolah vs kebutuhan industri untuk memunculkan bukti celah kesenjangan yang transparan.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <span className="w-6 h-6 rounded-full bg-indigo-700 text-white font-bold flex items-center justify-center text-xs">
                  3
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Aksi Forum Pentahelix</h3>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Disdik, Disnaker, Bappeda, Asosiasi Industri &amp; Guru menyepakati revisi jam praktikum, pelatihan BLK khusus, dan penambahan kuota magang.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                  4
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Pelacakan Lulusan 6 Bulan</h3>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Alumni mengisi survei status keterserapan kerja dan kesesuaian keahlian, yang hasilnya menjadi evaluasi siklus semester berikutnya.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Media Room & Open Data */}
      {activeTab === 'ruang_media' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6 text-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">Ruang Media, Press Kit &amp; API Terbuka</h2>
            <p className="text-slate-500">
              Materi resmi bagi jurnalis, analis kebijakan, dan peneliti akademik untuk mengutip data ketenagakerjaan vokasi Banten secara sah.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-900 block mb-1">Unduhan Dataset Terbuka (CSV)</span>
                <p className="text-slate-500 text-[11px]">
                  Data agregat per kabupaten/kota memuat indikator penyerapan kerja, TPT, dan sebaran industri semester aktif.
                </p>
              </div>
              <button
                onClick={handleDownloadDataset}
                className="mt-4 px-3 py-1.5 bg-blue-800 text-white rounded font-bold hover:bg-blue-900 transition flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh CSV Agregat</span>
              </button>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-900 block mb-1">Press Kit &amp; Siaran Pers Resmi</span>
                <p className="text-slate-500 text-[11px]">
                  Lembar fakta (Factsheet), infografik beresolusi tinggi, logo resmi, dan kutipan juru bicara TKDV Banten.
                </p>
              </div>
              <button
                onClick={() => showToast('Simulasi Berkas Press Kit', 'Fitur simulasi untuk demo — belum terhubung ke layanan nyata', 'info')}
                className="mt-4 px-3 py-1.5 bg-white border border-slate-300 text-slate-800 rounded font-bold hover:bg-slate-100 transition flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Unduh Press Kit (.ZIP)</span>
              </button>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-900 block mb-1">Dokumentasi API Publik (REST JSON)</span>
                <p className="text-slate-500 text-[11px]">
                  Endpoint GET /open/v1/kpi dan /open/v1/map untuk integrasi data ke portal berita atau dasbor instansi.
                </p>
              </div>
              <button
                onClick={() => showToast('Dokumentasi OpenAPI', 'Fitur simulasi untuk demo — belum terhubung ke layanan nyata', 'info')}
                className="mt-4 px-3 py-1.5 bg-white border border-slate-300 text-slate-800 rounded font-bold hover:bg-slate-100 transition flex items-center justify-center gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Dokumentasi API</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FAQ & Support Desk */}
      {activeTab === 'bantuan_faq' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Pertanyaan yang Sering Diajukan (FAQ)</h2>
            <div className="space-y-2">
              {faqs.map((f, i) => (
                <div key={i} className="border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="w-full p-3 text-left font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-2"
                  >
                    <span>{f.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition ${expandedFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedFaq === i && (
                    <div className="p-3 text-slate-600 bg-white leading-relaxed border-t border-slate-100 text-[11px]">
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Hubungi Tim Dukungan Teknis</h2>
            <p className="text-slate-500">
              Ajukan pertanyaan atau laporkan kendala sistem kepada Sekretariat TKDV Provinsi Banten:
            </p>

            {!ticketSent ? (
              <form onSubmit={handleSendTicket} className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Layanan:</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
                  >
                    <option>Pelacakan Lulusan</option>
                    <option>Sinyal Industri</option>
                    <option>Kurikulum Vokasi</option>
                    <option>Privasi &amp; Data Saya</option>
                    <option>Kendala Teknis</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subjek Pertanyaan:</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Contoh: Kendala verifikasi tautan tracer"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pesan Lengkap:</label>
                  <textarea
                    rows={4}
                    required
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-800 hover:bg-blue-900 text-white rounded font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Tiket Bantuan</span>
                </button>
              </form>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-700 mx-auto" />
                <h4 className="font-bold text-slate-900">Tiket Terkirim</h4>
                <p className="text-slate-600 text-[11px]">
                  Petugas Sekretariat Vokasi Banten akan menindaklanjuti pesan Anda dalam 1x24 jam kerja.
                </p>
                <button
                  onClick={() => setTicketSent(false)}
                  className="mt-2 text-blue-700 font-bold hover:underline"
                >
                  Kirim Pesan Lain
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Privacy & Legal (UU PDP) */}
      {activeTab === 'privasi_legal' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6 text-xs leading-relaxed text-slate-700">
          <div className="pb-3 border-b border-slate-200">
            <h2 className="text-base font-extrabold text-slate-900">
              Pemberitahuan Pelindungan Data Pribadi (UU No. 27 Tahun 2022)
            </h2>
            <span className="text-[11px] text-slate-400">Terakhir diperbarui: 3 November 2026</span>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">1. Pengendali Data Pribadi</h3>
              <p>
                Pengendali data pribadi adalah Tim Koordinasi Daerah Vokasi (TKDV) Pemerintah Provinsi Banten yang berkedudukan di KP3B Kota Serang. Segala pemrosesan data dilakukan berdasarkan kewenangan hukum peningkatan mutu pendidikan dan ketenagakerjaan daerah.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">2. Data yang Dikumpulkan &amp; Minimisasi</h3>
              <p>
                Kami menerapkan prinsip minimisasi data secara ketat: SINKRON Banten <strong>TIDAK PERNAH mengumpulkan NIK, nomor Kartu Keluarga, data biometrik, maupun rincian rekening perbankan</strong>. Data yang diproses terbatas pada nama, tahun kelulusan, program keahlian, status keterserapan kerja, dan nomor kontak aktif untuk konfirmasi survei.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">3. Prinsip Agregasi &amp; Small-Cell Suppression</h3>
              <p>
                Data yang ditampilkan kepada masyarakat umum, media, dan pembuat kebijakan disajikan dalam bentuk agregat statistik. Untuk mencegah identifikasi kembali (re-identification), kelompok data dengan responden kurang dari 10 (n &lt; 10) secara otomatis disembunyikan.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">4. Hak-Hak Subjek Data Anda</h3>
              <p>
                Sesuai Pasal 5 hingga 13 UU PDP, setiap pemilik data berhak meminta informasi mengenai pemrosesan data miliknya, memperbaiki ketidaktepatan, mengunduh salinan data (portabilitas), menarik kembali persetujuan yang telah diberikan, dan mengajukan permohonan penghapusan data kontak melalui menu <em>&quot;Privasi Saya&quot;</em> di portal ini.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
