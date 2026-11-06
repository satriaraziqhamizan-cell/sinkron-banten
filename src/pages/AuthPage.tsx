import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { api } from '../services/api';
import { UserRole } from '../types/sinkron';
import {
  Lock,
  Mail,
  User,
  Building,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Info,
} from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register' | 'forgot';
  onSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login', onSuccess }) => {
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('alumni');
  const [regInstitutionName, setRegInstitutionName] = useState('');
  const [regNpsnOrNib, setRegNpsnOrNib] = useState('');
  const [regRegionId, setRegRegionId] = useState('cilegon');
  const [regSectorId, setRegSectorId] = useState('sec_manufaktur');
  const [regSchoolLevel, setRegSchoolLevel] = useState<'SMK' | 'SMA'>('SMK');
  const [consentAgree, setConsentAgree] = useState(true);

  // Forgot state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email: loginEmail, password: loginPassword });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast('Gagal Masuk', err.message || 'Periksa kembali email dan sandi Anda.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword.length < 10) {
      showToast('Sandi Kurang Kuat', 'Sandi minimal 10 karakter sesuai standar keamanan.', 'error');
      return;
    }
    if (!consentAgree) {
      showToast('Persetujuan Diperlukan', 'Harap setujui pemrosesan data sesuai UU PDP.', 'error');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        institutionName: regInstitutionName,
        npsnOrNib: regNpsnOrNib,
        regionId: regRegionId,
        sectorId: regSectorId,
        schoolLevel: regSchoolLevel,
      });
      setMode('login');
      setLoginEmail(regEmail);
    } catch (err: any) {
      showToast('Pendaftaran Gagal', err.message || 'Terjadi kesalahan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.forgotPassword(forgotEmail);
      setForgotSent(true);
      showToast(
        'Permintaan Pemulihan',
        res.message || 'Permintaan pemulihan dicatat. Pengiriman tautan lewat email belum aktif pada versi demo; hubungi Admin SINKRON untuk atur ulang sandi.',
        'info'
      );
    } catch (err: any) {
      showToast('Permintaan Gagal', err.message || 'Terjadi kesalahan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 text-xs">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3.5 text-center font-bold text-xs transition border-b-2 ${
              mode === 'login'
                ? 'border-blue-800 text-blue-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Masuk ke Akun
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3.5 text-center font-bold text-xs transition border-b-2 ${
              mode === 'register'
                ? 'border-blue-800 text-blue-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Akun Baru
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs">
              <img
                src="/brand/logo-mark-128.png"
                srcSet="/brand/logo-mark-128.png 1x, /brand/logo-mark-256.png 2x"
                alt="Logo SINKRON Banten"
                width="48"
                height="48"
                decoding="async"
                onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-extrabold text-base text-slate-900 tracking-tight">
                SINKRON <span className="text-[#1F5FA8]">Banten</span>
              </div>
              <p className="text-[11px] text-slate-500">Pemerintah Provinsi Banten • Portal Vokasi</p>
            </div>
          </div>

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  Autentikasi Terpusat
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">Masuk SINKRON Banten</h2>
                <p className="text-slate-500 mt-0.5">
                  Gunakan email resmi institusi atau akun alumni terdaftar Anda.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Alamat Email:</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@institusi.go.id / email.com"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-slate-900 focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800">Kata Sandi:</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-blue-700 hover:underline text-[11px]"
                  >
                    Lupa sandi?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Minimal 10 karakter"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-slate-900 focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200 text-slate-600 text-[11px] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Akun dilindungi dengan penguncian otomatis setelah 5 kali percobaan gagal. Verifikasi dua faktor (2FA / TOTP) untuk akun dinas &amp; sekolah berstatus <span className="font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">Dalam pengembangan</span>.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-800 hover:bg-blue-900 disabled:bg-blue-400 text-white font-bold rounded shadow-xs transition flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Memverifikasi...' : 'Masuk Sekarang'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  Pendaftaran Institusi / Alumni
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">Registrasi Akun SINKRON</h2>
                <p className="text-slate-500 mt-0.5">
                  Pilihlah peran Anda sesuai dengan tugas pokok dan fungsi di Provinsi Banten.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Peran Pengguna:</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 font-semibold"
                >
                  <option value="alumni">Alumni SMK / SMA (Pencari Kerja / Pelacak)</option>
                  <option value="industry">Perusahaan / Industri (HRD Kawasan)</option>
                  <option value="school">Sekolah Vokasi (Admin SMK / Koordinator BKK)</option>
                  <option value="disdik">Dinas Pendidikan Provinsi Banten</option>
                  <option value="disnaker">Dinas Tenaga Kerja &amp; BLK Banten</option>
                  <option value="bappeda">Bappeda Litbang Daerah</option>
                  <option value="akademisi">Akademisi / Dosen Peneliti</option>
                  <option value="koordinator">Sekretariat Forum Pentahelix</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Nama Lengkap / Kontak:</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Nama penanggung jawab"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Email Resmi:</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nama@domain.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900"
                  />
                </div>
              </div>

              {/* Dynamic Role-specific fields */}
              {regRole !== 'alumni' && (
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 block">Identitas Institusi Terkait:</span>

                  <div>
                    <label className="text-slate-700 block mb-1">Nama Institusi / Perusahaan:</label>
                    <input
                      type="text"
                      required
                      value={regInstitutionName}
                      onChange={(e) => setRegInstitutionName(e.target.value)}
                      placeholder="Contoh: PT Krakatau Steel / SMKN 1 Cilegon"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-700 block mb-1">
                        {regRole === 'school' ? 'NPSN Sekolah:' : 'NIB / Nomor Izin Usaha:'}
                      </label>
                      <input
                        type="text"
                        value={regNpsnOrNib}
                        onChange={(e) => setRegNpsnOrNib(e.target.value)}
                        placeholder="8-13 digit angka"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 block mb-1">Kabupaten/Kota Domisili:</label>
                      <select
                        value={regRegionId}
                        onChange={(e) => setRegRegionId(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-900"
                      >
                        <option value="cilegon">Kota Cilegon</option>
                        <option value="kab_serang">Kabupaten Serang</option>
                        <option value="kota_serang">Kota Serang</option>
                        <option value="kab_tangerang">Kabupaten Tangerang</option>
                        <option value="kota_tangerang">Kota Tangerang</option>
                        <option value="tangsel">Kota Tangerang Selatan</option>
                        <option value="pandeglang">Kabupaten Pandeglang</option>
                        <option value="lebak">Kabupaten Lebak</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                    *Akun institusi baru akan berstatus <strong>Menunggu Verifikasi</strong> oleh Administrator SINKRON sebelum data internal dapat diakses.
                  </p>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-800 block mb-1">Kata Sandi (Min. 10 Karakter):</label>
                <input
                  type="password"
                  required
                  minLength={10}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Kombinasi huruf besar, kecil, dan angka"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900"
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={consentAgree}
                  onChange={(e) => setConsentAgree(e.target.checked)}
                  className="mt-0.5 text-blue-600 rounded"
                />
                <span className="text-[11px] text-slate-600 leading-snug">
                  Saya menyetujui Ketentuan Layanan dan Pernyataan Pelindungan Data Pribadi (UU PDP No. 27 Tahun 2022) Pemerintah Provinsi Banten.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-bold rounded shadow-xs transition flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Mendaftarkan...' : 'Daftarkan Akun'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            forgotSent ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                    <Info className="w-4 h-4 text-blue-700 shrink-0" />
                    Permintaan Pemulihan Dicatat
                  </div>
                  <p className="text-slate-700 text-xs leading-relaxed">
                    Permintaan pemulihan dicatat. Pengiriman tautan lewat email belum aktif pada versi demo; hubungi Admin SINKRON untuk atur ulang sandi.
                  </p>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotSent(false);
                      setForgotEmail('');
                    }}
                    className="text-slate-600 hover:text-slate-900 font-semibold text-xs"
                  >
                    Gunakan email lain
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotSent(false);
                      setMode('login');
                    }}
                    className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded"
                  >
                    Kembali ke Masuk
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                    Pemulihan Akun
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">Lupa Kata Sandi</h2>
                  <p className="text-slate-500 mt-0.5">
                    Masukkan email terdaftar Anda untuk mengajukan permintaan pemulihan kata sandi.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Alamat Email Terdaftar:</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="nama@domain.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-slate-600 hover:text-slate-900 font-semibold"
                  >
                    &larr; Kembali ke Masuk
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-blue-800 hover:bg-blue-900 disabled:opacity-50 text-white font-bold rounded"
                  >
                    {loading ? 'Memproses...' : 'Kirim Permintaan Pemulihan'}
                  </button>
                </div>
              </form>
            )
          )}
        </div>
      </div>
    </div>
  );
};
