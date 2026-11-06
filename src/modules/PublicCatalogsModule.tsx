import React, { useState, useEffect } from 'react';
import { useSinkron } from '../context/SinkronContext';
import { useAuth } from '../context/AuthContext';
import { JobPosting, TrainingProgram } from '../types/sinkron';
import {
  Briefcase,
  GraduationCap,
  MapPin,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Award,
  DollarSign,
  ChevronRight,
  Sparkles,
  Flag,
} from 'lucide-react';

interface PublicCatalogsModuleProps {
  initialCatalog?: 'jobs' | 'trainings';
}

export const PublicCatalogsModule: React.FC<PublicCatalogsModuleProps> = ({ initialCatalog = 'jobs' }) => {
  const {
    jobPostings,
    trainingPrograms,
    regions,
    sectors,
    competencies,
    applyToJob,
    enrollTraining,
  } = useSinkron();
  const { currentUser } = useAuth();

  const [activeCatalog, setActiveCatalog] = useState<'jobs' | 'trainings'>(initialCatalog);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterSector, setFilterSector] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [selectedTraining, setSelectedTraining] = useState<TrainingProgram | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (initialCatalog) {
      setActiveCatalog(initialCatalog);
    }
  }, [initialCatalog]);

  // Filtered jobs
  const filteredJobs = jobPostings.filter((job) => {
    if (filterRegion !== 'all' && job.regionId !== filterRegion) return false;
    if (filterSector !== 'all' && job.sectorId !== filterSector) return false;
    if (filterType !== 'all' && job.type !== filterType) return false;
    if (searchTerm) {
      const matchTitle = job.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchComp = job.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchTitle && !matchComp) return false;
    }
    return true;
  });

  // Filtered trainings
  const filteredTrainings = trainingPrograms.filter((tp) => {
    if (filterRegion !== 'all' && tp.regionId !== filterRegion) return false;
    if (filterSector !== 'all' && tp.sectorId !== filterSector) return false;
    if (searchTerm) {
      const matchTitle = tp.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchProv = tp.providerName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchTitle && !matchProv) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              Layanan Penyaluran &amp; Pelatihan
            </span>
            <span className="text-xs text-slate-500 font-medium">Bebas Pungutan Liar (100% Gratis)</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Bursa Lowongan, Magang Industri &amp; Pelatihan UPTD BLK Banten
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Seluruh peluang terhubung langsung dengan sinyal kebutuhan industri dan diawasi ketat oleh Dinas Tenaga Kerja Provinsi Banten untuk mencegah penipuan ketenagakerjaan.
          </p>
        </div>

        {/* Catalog Selector */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveCatalog('jobs')}
            className={`px-4 py-2 rounded-md transition ${activeCatalog === 'jobs' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Lowongan &amp; Magang ({jobPostings.length})
          </button>
          <button
            onClick={() => setActiveCatalog('trainings')}
            className={`px-4 py-2 rounded-md transition ${activeCatalog === 'trainings' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Pelatihan BLK Daerah ({trainingPrograms.length})
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari lowongan, keahlian, atau nama penyedia..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-blue-600"
            />
          </div>

          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-medium"
          >
            <option value="all">Semua Wilayah Banten</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {activeCatalog === 'jobs' && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-medium"
            >
              <option value="all">Semua Jenis Peluang</option>
              <option value="Lowongan Kerja">Lowongan Kerja (PKWT/PKWTT)</option>
              <option value="Magang Vokasi">Magang Vokasi Industri</option>
            </select>
          )}
        </div>

        <span className="text-slate-500 font-medium">
          Ditemukan <strong>{activeCatalog === 'jobs' ? filteredJobs.length : filteredTrainings.length}</strong> posisi
        </span>
      </div>

      {/* CATALOG 1: Job & Internship Postings */}
      {activeCatalog === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => {
            const reg = regions.find((r) => r.id === job.regionId);
            return (
              <div key={job.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-3 text-xs flex flex-col justify-between hover:border-blue-400 transition">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          job.type === 'Magang Vokasi'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {job.type}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-sm mt-1">{job.title}</h3>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                        <span className="font-semibold text-slate-700">{job.companyName}</span>
                        {job.isCompanyVerified && (
                          <span className="text-emerald-700 flex items-center gap-0.5 font-bold" title="Industri Resmi Terverifikasi">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Terverifikasi
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {reg?.name}
                    </span>
                  </div>

                  <p className="text-slate-600 line-clamp-2 leading-relaxed">{job.description}</p>

                  {/* Competency badges */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {job.requiredCompetencies.map((cid) => {
                      const comp = competencies.find((c) => c.id === cid);
                      return (
                        <span key={cid} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] border border-slate-200">
                          {comp?.name || cid}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">
                      Gaji/Uang Saku: <strong className="text-slate-900">Rp {job.salaryMin?.toLocaleString('id-ID')} - {job.salaryMax?.toLocaleString('id-ID')}</strong>
                    </span>
                    <span className="text-slate-400">Tenggat: {job.deadline}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => {
                        setActionFeedback(`Laporan kecurigaan untuk lowongan "${job.title}" telah dicatat dan diteruskan ke Tim Pengawas Disnaker Banten.`);
                        setTimeout(() => setActionFeedback(null), 6000);
                      }}
                      className="text-slate-400 hover:text-rose-600 flex items-center gap-1 text-[10px]"
                    >
                      <Flag className="w-3 h-3" />
                      Laporkan Kecurangan
                    </button>

                    <button
                      onClick={() => {
                        const applicant = currentUser?.name || 'Alumni Terdaftar';
                        applyToJob(job.id, applicant);
                        setActionFeedback(`Lamaran kerja untuk posisi "${job.title}" di ${job.companyName} atas nama ${applicant} berhasil dikirimkan.`);
                        setTimeout(() => setActionFeedback(null), 6000);
                      }}
                      className="px-3.5 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded font-bold transition flex items-center gap-1 shadow-xs"
                    >
                      <span>Lamar Sekarang</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action feedback notification */}
      {actionFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl text-xs max-w-md flex items-center justify-between gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-slate-400 hover:text-white font-bold text-sm px-1"
          >
            &times;
          </button>
        </div>
      )}

      {/* CATALOG 2: BLK Vocational Training Catalog */}
      {activeCatalog === 'trainings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTrainings.map((tp) => {
            const reg = regions.find((r) => r.id === tp.regionId);
            return (
              <div key={tp.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-3 text-xs flex flex-col justify-between hover:border-blue-400 transition">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                        {tp.costType}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-sm mt-1">{tp.title}</h3>
                      <span className="text-slate-500 text-[11px] block">{tp.providerName}</span>
                    </div>

                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200 text-right">
                      {tp.placementRate6Months}% Serapan Kerja
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded border border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>
                      <span className="text-slate-400 block">Sertifikasi Resmi:</span>
                      <span className="font-bold text-slate-800">{tp.certification}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Durasi Pelatihan:</span>
                      <span className="font-bold text-slate-800">{tp.durationWeeks} Minggu Penuh</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Lokasi Pelatihan:</span>
                      <span className="font-bold text-slate-800">{tp.address}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Kuota Peserta:</span>
                      <span className="font-bold text-blue-900">
                        {tp.enrolledCount} / {tp.quota} Peserta
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Mulai: <strong>{tp.startDate}</strong></span>
                  <button
                    onClick={() => {
                      enrollTraining(tp.id);
                      setActionFeedback(`Pendaftaran peserta untuk pelatihan "${tp.title}" berhasil tercatat di UPTD BLK Banten.`);
                      setTimeout(() => setActionFeedback(null), 6000);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold transition shadow-xs flex items-center gap-1"
                  >
                    <span>Daftar Pelatihan BLK</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
