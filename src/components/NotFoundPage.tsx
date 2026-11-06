import React from 'react';
import { Home, Compass, HelpCircle, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (tab: string) => void;
  isDemoMode?: boolean;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate, isDemoMode = false }) => {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 space-y-6">
        {/* Brand Logo & 404 Badge */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center shadow-2xs">
            <img
              src="/brand/logo-mark-128.png"
              srcSet="/brand/logo-mark-128.png 1x, /brand/logo-mark-256.png 2x"
              alt="Logo SINKRON Banten"
              width="48"
              height="48"
              decoding="async"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold uppercase tracking-wider">
            Galat 404 • Halaman Tidak Ditemukan
          </div>
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Alamat yang Anda Tuju Tidak Ditemukan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Halaman web yang Anda buka tidak tersedia pada sistem SINKRON Banten. URL mungkin salah diketik, tautan telah kedaluwarsa, atau konten telah dipindahkan.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('beranda')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition"
          >
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </button>

          {isDemoMode && (
            <button
              type="button"
              onClick={() => onNavigate('demo')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition"
            >
              <Compass className="w-4 h-4" />
              Panel Demo Juri
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('bantuan_faq')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition"
          >
            <HelpCircle className="w-4 h-4" />
            Pusat Bantuan &amp; FAQ
          </button>
        </div>

        {/* Context Help */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-6 text-[11px] text-slate-500">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="hover:text-blue-700 flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke halaman sebelumnya
          </button>
          <span>•</span>
          <span>SINKRON Banten © 2026</span>
        </div>
      </div>
    </div>
  );
};
