import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Phone, MapPin, ExternalLink, Globe, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { isDemoModeAllowed } = useAuth();
  const [logoError, setLogoError] = useState(false);

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs mt-12 no-print">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Identity & Legal notice */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              {!logoError ? (
                <div className="w-9 h-9 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
                  <img
                    src="/brand/logo-mark-128.png"
                    srcSet="/brand/logo-mark-128.png 1x, /brand/logo-mark-256.png 2x"
                    alt="Logo SINKRON Banten"
                    width="36"
                    height="36"
                    decoding="async"
                    onError={() => setLogoError(true)}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded bg-[#1F5FA8] flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                  SKR
                </div>
              )}
              <span className="font-bold text-white text-base">
                SINKRON <span className="text-blue-400">Banten</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Sistem Integrasi Kebutuhan Industri dan Kompetensi Vokasi Provinsi Banten. Menyelaraskan kurikulum SMK, sinyal kebutuhan riil industri kawasan, dan pelacakan lulusan 6 bulan.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold bg-slate-800/80 px-2 py-1 rounded w-fit border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Kepatuhan UU PDP No. 27/2022 &amp; WCAG 2.1 AA</span>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Layanan Utama
            </h4>
            <ul className="space-y-2 text-slate-400">
              {isDemoModeAllowed && (
                <li>
                  <button
                    onClick={() => onNavigate('demo')}
                    className="text-amber-400 hover:text-amber-300 font-bold transition text-left flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Demo untuk Juri (Simulasi 9 Peran)</span>
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={() => onNavigate('dasbor_publik')}
                  className="hover:text-white transition text-left"
                >
                  Dasbor Publik &amp; Peta Banten
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('peta_kecocokan')}
                  className="hover:text-white transition text-left"
                >
                  Peta Kecocokan Kurikulum vs Industri
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('lowongan_publik')}
                  className="hover:text-white transition text-left"
                >
                  Bursa Lowongan &amp; Magang Vokasi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('pelatihan_publik')}
                  className="hover:text-white transition text-left"
                >
                  Katalog Pelatihan UPTD BLK Banten
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('cara_kerja')}
                  className="hover:text-white transition text-left"
                >
                  Siklus 3 Tahap (Sinyal–Penyesuaian–Pelacak)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Transparansi & Data */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Transparansi &amp; Akuntabilitas
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('ruang_media')}
                  className="hover:text-white transition text-left"
                >
                  Ruang Media &amp; Unduhan Data Terbuka
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privasi_legal')}
                  className="hover:text-white transition text-left"
                >
                  Kebijakan Privasi &amp; Hak Subjek Data
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privasi_legal')}
                  className="hover:text-white transition text-left"
                >
                  Syarat Ketentuan &amp; Standar Agregasi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('bantuan_faq')}
                  className="hover:text-white transition text-left"
                >
                  Pusat Bantuan &amp; Panduan Pengisian
                </button>
              </li>
              <li>
                <span className="text-[11px] text-slate-500">
                  Data publik disajikan dalam bentuk agregat tanpa pengungkapan identitas pribadi (PII).
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact / Secretariat */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Sekretariat Koordinasi
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Kawasan Pusat Pemerintahan Provinsi Banten (KP3B), Jl. Syekh Nawawi Al-Bantani, Sukajaya, Curug, Kota Serang, Banten 42171
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>vokasi@bantenprov.go.id</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>(0254) 267111 / Ext. 842</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>© 2026 Tim Koordinasi Daerah Vokasi (TKDV) Pemerintah Provinsi Banten. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-4">
            <span>Server Wilayah: Asia Tenggara (ID)</span>
            <span>Enkripsi: TLS 1.3 / AES-256</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
