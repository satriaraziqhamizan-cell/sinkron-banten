import React, { useState, useEffect, lazy, Suspense } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SinkronProvider } from './context/SinkronContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PublicHome } from './modules/PublicHome';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotFoundPage } from './components/NotFoundPage';
import { ShieldAlert, Clock } from 'lucide-react';

// Code-splitting large modules with React.lazy to reduce initial JS bundle size < 450 KB
const PublicDashboard = lazy(() => import('./modules/PublicDashboard').then((m) => ({ default: m.PublicDashboard })));
const MatchMatrixView = lazy(() => import('./modules/MatchMatrixView').then((m) => ({ default: m.MatchMatrixView })));
const TracerSurveyModule = lazy(() => import('./modules/TracerSurveyModule').then((m) => ({ default: m.TracerSurveyModule })));
const IndustryModule = lazy(() => import('./modules/IndustryModule').then((m) => ({ default: m.IndustryModule })));
const SchoolModule = lazy(() => import('./modules/SchoolModule').then((m) => ({ default: m.SchoolModule })));
const PolicyRecommendationsModule = lazy(() =>
  import('./modules/PolicyRecommendationsModule').then((m) => ({ default: m.PolicyRecommendationsModule }))
);
const CompetencyTaxonomyModule = lazy(() =>
  import('./modules/CompetencyTaxonomyModule').then((m) => ({ default: m.CompetencyTaxonomyModule }))
);
const PentahelixForumModule = lazy(() => import('./modules/PentahelixForumModule').then((m) => ({ default: m.PentahelixForumModule })));
const PublicCatalogsModule = lazy(() => import('./modules/PublicCatalogsModule').then((m) => ({ default: m.PublicCatalogsModule })));
const MediaLegalModule = lazy(() => import('./modules/MediaLegalModule').then((m) => ({ default: m.MediaLegalModule })));
const AdminConsoleModule = lazy(() => import('./modules/AdminConsoleModule').then((m) => ({ default: m.AdminConsoleModule })));
const AuthPage = lazy(() => import('./pages/AuthPage').then((m) => ({ default: m.AuthPage })));
const DemoPage = lazy(() => import('./pages/DemoPage').then((m) => ({ default: m.DemoPage })));

const ModuleLoadingFallback: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 py-12">
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs flex flex-col items-center justify-center text-center space-y-3 min-h-[260px]">
      <div className="w-8 h-8 border-3 border-[#1F5FA8] border-t-transparent rounded-full animate-spin" />
      <div className="text-xs font-semibold text-slate-600">Memuat modul data...</div>
    </div>
  </div>
);

const MainAppContent: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('beranda');
  const [surveyToken, setSurveyToken] = useState<string | null>(null);

  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  // Sync with browser URL pathname on load and popstate
  useEffect(() => {
    function handleLocation() {
      const path = window.location.pathname;
      if (path === '/' || path === '') {
        setCurrentTab('beranda');
      } else if (path.startsWith('/survei/')) {
        const token = path.replace('/survei/', '').trim();
        setSurveyToken(token);
        setCurrentTab('alumni_tracer');
      } else if (path === '/masuk') {
        setCurrentTab('masuk');
      } else if (path === '/daftar') {
        setCurrentTab('daftar');
      } else if (path === '/demo') {
        setCurrentTab('demo');
      } else if (path === '/dasbor' || path === '/peta') {
        setCurrentTab('dasbor_publik');
      } else if (path === '/lowongan') {
        setCurrentTab('lowongan_publik');
      } else if (path === '/pelatihan') {
        setCurrentTab('pelatihan_publik');
      } else if (path === '/cara-kerja') {
        setCurrentTab('cara_kerja');
      } else if (path === '/ruang-media') {
        setCurrentTab('ruang_media');
      } else if (path === '/bantuan' || path === '/faq') {
        setCurrentTab('bantuan_faq');
      } else if (path === '/privasi') {
        setCurrentTab('privasi_legal');
      } else {
        // Explicit 404 client-side rendering for unknown paths
        setCurrentTab('not_found');
      }
    }

    handleLocation();
    window.addEventListener('popstate', handleLocation);
    return () => window.removeEventListener('popstate', handleLocation);
  }, []);

  const navigateTo = (tab: string) => {
    setCurrentTab(tab);
    // Push clean history state
    let targetPath = '/';
    if (tab === 'dasbor_publik') targetPath = '/dasbor';
    else if (tab === 'lowongan_publik') targetPath = '/lowongan';
    else if (tab === 'pelatihan_publik') targetPath = '/pelatihan';
    else if (tab === 'cara_kerja') targetPath = '/cara-kerja';
    else if (tab === 'ruang_media') targetPath = '/ruang-media';
    else if (tab === 'bantuan_faq') targetPath = '/bantuan';
    else if (tab === 'privasi_legal') targetPath = '/privasi';
    else if (tab === 'masuk') targetPath = '/masuk';
    else if (tab === 'daftar') targetPath = '/daftar';
    else if (tab === 'demo') targetPath = '/demo';
    else if (tab === 'alumni_tracer' && surveyToken) targetPath = `/survei/${surveyToken}`;
    else if (tab === 'beranda') targetPath = '/';

    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] text-slate-700 p-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-3 max-w-xs w-full">
          <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shadow-2xs">
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
          <div>
            <div className="font-extrabold text-base text-slate-900 tracking-tight">SINKRON Banten</div>
            <p className="text-xs text-slate-500 mt-0.5">Memuat sistem integrasi vokasi...</p>
          </div>
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Route Guard for internal data when institution is 'menunggu' (Fase 2 requirement #3)
  const isInstitutionPending = currentUser && currentUser.status === 'menunggu';

  const renderActiveModule = () => {
    // 404 Route
    if (currentTab === 'not_found') {
      return <NotFoundPage onNavigate={(t) => navigateTo(t)} isDemoMode={isDemoMode} />;
    }

    // Auth routes
    if (currentTab === 'masuk') {
      return (
        <AuthPage
          initialMode="login"
          onSuccess={() => {
            if (currentUser?.role === 'school') navigateTo('school_programs');
            else if (currentUser?.role === 'industry') navigateTo('industry_signals');
            else if (currentUser?.role === 'admin') navigateTo('admin_console');
            else navigateTo('beranda');
          }}
        />
      );
    }

    if (currentTab === 'daftar') {
      return (
        <AuthPage
          initialMode="register"
          onSuccess={() => navigateTo('masuk')}
        />
      );
    }

    // Pending Institution Verification Notice
    const isInternalTab = [
      'industry_signals',
      'industry_postings',
      'industry_evaluations',
      'school_programs',
      'school_tracer',
      'school_alumni_import',
      'school_rapor',
      'dasbor_kebijakan',
      'rekomendasi_kebijakan',
      'admin_console',
      'admin_periode',
      'admin_audit',
    ].includes(currentTab);

    if (isInternalTab) {
      if (!currentUser) {
        return (
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center max-w-lg mx-auto my-8 space-y-4">
            <ShieldAlert className="w-12 h-12 text-amber-600 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">Autentikasi Diperlukan</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Modul ini merupakan area kerja internal terproteksi. Silakan masuk dengan akun resmi institusi Anda.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigateTo('masuk')}
                className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded text-xs transition"
              >
                Masuk ke Akun Institusi
              </button>
            </div>
          </div>
        );
      }

      if (isInstitutionPending) {
        return (
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center max-w-lg mx-auto my-8 space-y-4">
            <Clock className="w-12 h-12 text-amber-600 mx-auto" />
            <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded">
              Menunggu Verifikasi Legalitas
            </span>
            <h2 className="text-lg font-bold text-slate-900">Akun Institusi Sedang Ditinjau</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pendaftaran institusi <strong>{currentUser.institutionName || currentUser.name}</strong> telah diterima dan sedang diverifikasi oleh Administrator SINKRON Banten demi pelindungan data pribadi (UU PDP).
            </p>
            <p className="text-[11px] text-slate-500">
              Anda tetap dapat menjelajahi seluruh data agregat publik, bursa lowongan, dan katalog pelatihan daerah.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigateTo('dasbor_publik')}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded text-xs transition"
              >
                Buka Dasbor Publik
              </button>
            </div>
          </div>
        );
      }
    }

    switch (currentTab) {
      case 'beranda':
        return <PublicHome onNavigate={(t) => navigateTo(t)} />;
      case 'dasbor_publik':
        return <PublicDashboard />;
      case 'peta_kecocokan':
        return <MatchMatrixView />;
      case 'demo':
        return <DemoPage onNavigate={(t) => navigateTo(t)} />;

      // Alumni Modules
      case 'alumni_dashboard':
      case 'alumni_tracer':
        return <TracerSurveyModule initialTab="survey" token={surveyToken || undefined} onNavigate={(t) => navigateTo(t)} />;
      case 'alumni_privasi':
        return <TracerSurveyModule initialTab="privacy" token={surveyToken || undefined} onNavigate={(t) => navigateTo(t)} />;
      case 'alumni_lowongan':
      case 'lowongan_publik':
        return <PublicCatalogsModule initialCatalog="jobs" />;
      case 'alumni_pelatihan':
      case 'pelatihan_publik':
        return <PublicCatalogsModule initialCatalog="trainings" />;

      // Industry Modules
      case 'industry_signals':
        return <IndustryModule initialTab="signals" />;
      case 'industry_postings':
        return <IndustryModule initialTab="postings" />;
      case 'industry_evaluations':
        return <IndustryModule initialTab="evaluations" />;
      case 'industry_pentahelix':
        return <PentahelixForumModule initialTab="partners" />;

      // School Modules
      case 'school_programs':
        return <SchoolModule initialTab="programs" />;
      case 'school_tracer':
        return <SchoolModule initialTab="tracer" />;
      case 'school_alumni_import':
        return <SchoolModule initialTab="import" />;
      case 'school_rapor':
        return <SchoolModule initialTab="rapor" />;

      // Government & Policy Modules
      case 'dasbor_kebijakan':
        return <PolicyRecommendationsModule initialTab="policy_qa" />;
      case 'rekomendasi_kebijakan':
        return <PolicyRecommendationsModule initialTab="recommendations" />;
      case 'pelatihan_blk_disnaker':
        return <PublicCatalogsModule initialCatalog="trainings" />;
      case 'laporan_semester':
        return <PolicyRecommendationsModule initialTab="report" />;

      // Taxonomy & Academic
      case 'kamus_kompetensi':
        return <CompetencyTaxonomyModule initialTab="dictionary" />;
      case 'antrean_tinjauan_kamus':
        return <CompetencyTaxonomyModule initialTab="proposals" />;
      case 'data_riset_teranonim':
        return <CompetencyTaxonomyModule initialTab="research" />;

      // Pentahelix Forum
      case 'forum_pentahelix':
        return <PentahelixForumModule initialTab="sessions" />;
      case 'repositori_mou':
        return <PentahelixForumModule initialTab="mou" />;

      // Admin Console
      case 'admin_console':
        return <AdminConsoleModule initialTab="verification" />;
      case 'admin_periode':
        return <AdminConsoleModule initialTab="periods" />;
      case 'admin_audit':
        return <AdminConsoleModule initialTab="audit" />;

      // Informational & Legal
      case 'cara_kerja':
        return <MediaLegalModule initialSubTab="cara_kerja" />;
      case 'ruang_media':
        return <MediaLegalModule initialSubTab="ruang_media" />;
      case 'bantuan_faq':
        return <MediaLegalModule initialSubTab="bantuan_faq" />;
      case 'privasi_legal':
        return <MediaLegalModule initialSubTab="privasi_legal" />;

      default:
        return <NotFoundPage onNavigate={(t) => navigateTo(t)} isDemoMode={isDemoMode} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header currentTab={currentTab} onNavigate={(tab) => navigateTo(tab)} />

      {/* Main Content Container wrapped in ErrorBoundary and Suspense */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <ErrorBoundary onHome={() => navigateTo('beranda')}>
          <Suspense fallback={<ModuleLoadingFallback />}>
            {renderActiveModule()}
          </Suspense>
        </ErrorBoundary>
      </main>

      <Footer onNavigate={(tab) => navigateTo(tab)} />
    </div>
  );
};

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SinkronProvider>
          <MainAppContent />
        </SinkronProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
