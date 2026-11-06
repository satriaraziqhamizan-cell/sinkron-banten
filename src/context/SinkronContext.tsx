import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  Region,
  Sector,
  Competency,
  SchoolProgram,
  DemandSignal,
  MatchResult,
  Recommendation,
  AlumniRecord,
  TracerResponse,
  JobPosting,
  TrainingProgram,
  PentahelixPartner,
  MouAgreement,
  ForumSession,
  AuditLog,
  UserSubjectRequest,
} from '../types/sinkron';
import {
  BANTEN_REGIONS,
  BANTEN_SECTORS,
  COMPETENCY_DICTIONARY,
  SCHOOL_PROGRAMS,
  DEMAND_SIGNALS,
  MATCH_RESULTS_DATA,
  RECOMMENDATIONS_DATA,
  ALUMNI_SAMPLE_LIST,
  TRACER_RESPONSES_DATA,
  JOB_POSTINGS_DATA,
  TRAINING_PROGRAMS_DATA,
  PENTAHELIX_PARTNERS_DATA,
  MOU_AGREEMENTS_DATA,
  FORUM_SESSIONS_DATA,
  AUDIT_LOGS_DATA,
  USER_SUBJECT_REQUESTS_SAMPLE,
} from '../data/seedData';

import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';
import { api } from '../services/api';

interface SinkronContextType {
  activeRole: UserRole;
  activePeriod: string;
  setActivePeriod: (period: string) => void;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  
  // Data entities
  regions: Region[];
  sectors: Sector[];
  competencies: Competency[];
  schoolPrograms: SchoolProgram[];
  demandSignals: DemandSignal[];
  matchResults: MatchResult[];
  recommendations: Recommendation[];
  alumniRecords: AlumniRecord[];
  tracerResponses: TracerResponse[];
  jobPostings: JobPosting[];
  trainingPrograms: TrainingProgram[];
  pentahelixPartners: PentahelixPartner[];
  mouAgreements: MouAgreement[];
  forumSessions: ForumSession[];
  auditLogs: AuditLog[];
  userSubjectRequests: UserSubjectRequest[];

  // Mutations (connected to backend API)
  addCompetencyProposal: (proposal: Partial<Competency>) => Promise<void>;
  approveCompetency: (id: string) => Promise<void>;
  submitDemandSignal: (signal: Partial<DemandSignal>) => Promise<void>;
  verifyDemandSignal: (id: string, status: 'Aktif' | 'Draf') => Promise<void>;
  reviewMatchResult: (id: string, decision: 'Diterima' | 'Ditolak' | 'Dalam Pembahasan') => Promise<void>;
  runMatchAnalysis: (programId?: string, signalId?: string) => Promise<void>;
  addRecommendation: (rec: Partial<Recommendation>) => Promise<void>;
  updateRecommendationStatus: (id: string, status: Recommendation['status'], reason?: string) => Promise<void>;
  importAlumniCsv: (records: Partial<AlumniRecord>[], schoolId?: string, programId?: string) => Promise<void>;
  sendSurveyInvitation: (alumniId: string) => Promise<void>;
  submitTracerSurvey: (response: Partial<TracerResponse>) => Promise<void>;
  verifyTracerResponse: (responseId: string, status: 'Terverifikasi' | 'Perlu Klarifikasi' | 'Tidak Valid') => Promise<void>;
  addJobPosting: (job: Partial<JobPosting>) => Promise<void>;
  applyToJob: (jobId: string, applicantName: string) => Promise<void>;
  enrollTraining: (trainingId: string) => Promise<void>;
  submitUserSubjectRequest: (type: UserSubjectRequest['requestType'], notes?: string) => Promise<void>;
  resetAllData: () => Promise<void>;

  // Notification helper
  notifications: { id: string; text: string; time: string; read: boolean }[];
  markNotificationsAsRead: () => void;
}

const SinkronContext = createContext<SinkronContextType | undefined>(undefined);

export const SinkronProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const activeRole: UserRole = currentUser?.role ?? 'public';
  const [activePeriod, setActivePeriod] = useState<string>('2026/Ganjil');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Data states (in-memory, synchronized with backend via api.*)
  const [regions, setRegions] = useState<Region[]>(BANTEN_REGIONS);
  const [sectors, setSectors] = useState<Sector[]>(BANTEN_SECTORS);
  const [competencies, setCompetencies] = useState<Competency[]>(COMPETENCY_DICTIONARY);
  const [schoolPrograms, setSchoolPrograms] = useState<SchoolProgram[]>(SCHOOL_PROGRAMS);
  const [demandSignals, setDemandSignals] = useState<DemandSignal[]>(DEMAND_SIGNALS);
  const [matchResults, setMatchResults] = useState<MatchResult[]>(MATCH_RESULTS_DATA);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(RECOMMENDATIONS_DATA);
  const [alumniRecords, setAlumniRecords] = useState<AlumniRecord[]>(ALUMNI_SAMPLE_LIST);
  const [tracerResponses, setTracerResponses] = useState<TracerResponse[]>(TRACER_RESPONSES_DATA);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>(JOB_POSTINGS_DATA);
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>(TRAINING_PROGRAMS_DATA);
  const [pentahelixPartners, setPentahelixPartners] = useState<PentahelixPartner[]>(PENTAHELIX_PARTNERS_DATA);
  const [mouAgreements, setMouAgreements] = useState<MouAgreement[]>(MOU_AGREEMENTS_DATA);
  const [forumSessions, setForumSessions] = useState<ForumSession[]>(FORUM_SESSIONS_DATA);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(AUDIT_LOGS_DATA);
  const [userSubjectRequests, setUserSubjectRequests] = useState<UserSubjectRequest[]>(USER_SUBJECT_REQUESTS_SAMPLE);

  const [notifications, setNotifications] = useState([
    { id: '1', text: 'Periode Sinyal Industri 2026/Ganjil telah aktif dan dibuka.', time: '10 menit lalu', read: false },
    { id: '2', text: 'Rekomendasi kurikulum Pengelasan 6G SMKN 1 Cilegon menunggu persetujuan.', time: '1 jam lalu', read: false },
    { id: '3', text: 'Undangan Tracer Study kohort 2025 telah terkirim ke alumni.', time: '2 jam lalu', read: true },
  ]);

  // Load live data from backend API (replacing all localStorage usage)
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        regionsRes,
        sectorsRes,
        competenciesRes,
        programsRes,
        signalsRes,
        matchRes,
        recsRes,
        jobsRes,
        trainingsRes,
        partnersRes,
        mouRes,
        forumRes,
      ] = await Promise.all([
        api.getRegions().catch(() => BANTEN_REGIONS),
        api.getSectors().catch(() => BANTEN_SECTORS),
        api.getCompetencies().catch(() => COMPETENCY_DICTIONARY),
        api.getSchoolPrograms().catch(() => SCHOOL_PROGRAMS),
        api.getDemandSignals().catch(() => DEMAND_SIGNALS),
        api.getMatchResults().catch(() => MATCH_RESULTS_DATA),
        api.getRecommendations().catch(() => RECOMMENDATIONS_DATA),
        api.getPublicJobs().catch(() => JOB_POSTINGS_DATA),
        api.getPublicTrainings().catch(() => TRAINING_PROGRAMS_DATA),
        api.getPentahelixPartners().catch(() => PENTAHELIX_PARTNERS_DATA),
        api.getMouAgreements().catch(() => MOU_AGREEMENTS_DATA),
        api.getForumSessions().catch(() => FORUM_SESSIONS_DATA),
      ]);

      if (regionsRes) setRegions(regionsRes);
      if (sectorsRes) setSectors(sectorsRes);
      if (competenciesRes) setCompetencies(competenciesRes);
      if (programsRes) setSchoolPrograms(programsRes);
      if (signalsRes) setDemandSignals(signalsRes);
      if (matchRes) setMatchResults(matchRes);
      if (recsRes) setRecommendations(recsRes);
      if (jobsRes) setJobPostings(jobsRes);
      if (trainingsRes) setTrainingPrograms(trainingsRes);
      if (partnersRes) setPentahelixPartners(partnersRes);
      if (mouRes) setMouAgreements(mouRes);
      if (forumRes) setForumSessions(forumRes);

      // Role-specific authenticated fetches
      if (currentUser) {
        if (currentUser.role === 'school' || currentUser.role === 'admin') {
          try {
            const alumniRes = await api.getSchoolAlumni();
            if (alumniRes) setAlumniRecords(alumniRes);
          } catch (e) {
            // ignore
          }
        }

        if (['school', 'disdik', 'admin', 'disnaker', 'bappeda', 'akademisi'].includes(currentUser.role)) {
          try {
            const respRes = await api.getTracerResponses();
            if (respRes) setTracerResponses(respRes);
          } catch (e) {
            // ignore
          }
        }

        if (currentUser.role === 'admin') {
          try {
            const auditRes = await api.getAuditLogs();
            if (auditRes) setAuditLogs(auditRes);
          } catch (e) {
            // ignore
          }
        }

        try {
          const reqsRes = await api.getUserSubjectRequests();
          if (reqsRes) setUserSubjectRequests(reqsRes);
        } catch (e) {
          // ignore
        }
      }
    } catch (err: any) {
      console.error('Gagal memuat data dari backend SINKRON:', err);
      setError(err.message || 'Gagal memuat data dari server');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Mutations calling Backend APIs directly
  const addCompetencyProposal = async (proposal: Partial<Competency>) => {
    try {
      const res = await api.proposeCompetency(proposal);
      setCompetencies((prev) => [res.competency, ...prev]);
      showToast('Usulan Kompetensi Diajukan', res.message, 'success');
    } catch (err: any) {
      showToast('Gagal Mengajukan Usulan', err.message || 'Terjadi kesalahan sistem', 'error');
      throw err;
    }
  };

  const approveCompetency = async (id: string) => {
    try {
      const res = await api.approveCompetency(id);
      setCompetencies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'disetujui', version: '2026.1-resmi' } : c))
      );
      showToast('Kompetensi Disetujui', res.message, 'success');
    } catch (err: any) {
      showToast('Gagal Menyetujui Kompetensi', err.message || 'Terjadi kesalahan sistem', 'error');
      throw err;
    }
  };

  const submitDemandSignal = async (signal: Partial<DemandSignal>) => {
    try {
      const res = await api.createDemandSignal(signal);
      setDemandSignals((prev) => [res.signal, ...prev]);
      showToast('Sinyal Industri Tersimpan', res.message, 'success');
    } catch (err: any) {
      showToast('Gagal Mengajukan Sinyal', err.message || 'Terjadi kesalahan sistem', 'error');
      throw err;
    }
  };

  const verifyDemandSignal = async (id: string, status: 'Aktif' | 'Draf') => {
    try {
      const res = await api.verifyDemandSignal(id, status);
      setDemandSignals((prev) => prev.map((s) => (s.id === id ? res.signal : s)));
      showToast('Verifikasi Sinyal Berhasil', res.message, 'success');
    } catch (err: any) {
      showToast('Gagal Verifikasi Sinyal', err.message || 'Terjadi kesalahan sistem', 'error');
      throw err;
    }
  };

  const reviewMatchResult = async (id: string, decision: 'Diterima' | 'Ditolak' | 'Dalam Pembahasan') => {
    try {
      const res = await api.reviewMatchResult(id, decision);
      setMatchResults((prev) => prev.map((m) => (m.id === id ? res.match : m)));
      showToast('Tinjauan Tersimpan', res.message, 'success');
    } catch (err: any) {
      showToast('Gagal Menyimpan Tinjauan', err.message || 'Terjadi kesalahan sistem', 'error');
      throw err;
    }
  };

  const runMatchAnalysis = async (programId?: string, signalId?: string) => {
    try {
      const targetProgId = programId || schoolPrograms[0]?.id || 'prog_smkn1clg_las';
      const targetSignalId = signalId || demandSignals[0]?.id;
      const res = await api.analyzeMatch(targetProgId, targetSignalId);
      setMatchResults((prev) => [res.matchResult, ...prev]);
      showToast('Analisis Keselarasan Selesai', res.message, 'success');
    } catch (err: any) {
      showToast('Gagal Menjalankan Analisis', err.message || 'Terjadi kesalahan sistem', 'error');
      throw err;
    }
  };

  const addRecommendation = async (rec: Partial<Recommendation>) => {
    try {
      const res = await api.createRecommendation(rec);
      setRecommendations((prev) => [res.recommendation, ...prev]);
      showToast('Rekomendasi Diterbitkan', res.message, 'success');
    } catch (err: any) {
      showToast('Gagal Menerbitkan Rekomendasi', err.message || 'Terjadi kesalahan sistem', 'error');
      throw err;
    }
  };

  const updateRecommendationStatus = async (id: string, status: Recommendation['status'], reason?: string) => {
    try {
      const res = await api.updateRecommendationStatus(id, status, reason);
      setRecommendations((prev) => prev.map((r) => (r.id === id ? res.recommendation : r)));
      showToast('Status Diperbarui', res.message, 'success');
    } catch (err: any) {
      showToast('Gagal Memperbarui Status', err.message || 'Terjadi kesalahan sistem', 'error');
      throw err;
    }
  };

  const importAlumniCsv = async (records: Partial<AlumniRecord>[], schoolId?: string, programId?: string) => {
    try {
      const sId = schoolId || records[0]?.schoolId || currentUser?.institutionId;
      const pId = programId || records[0]?.programId;
      const res = await api.importAlumni(records, sId, pId);

      // Refresh alumni list from server
      const updatedAlumni = await api.getSchoolAlumni();
      setAlumniRecords(updatedAlumni);
      showToast('Impor Alumni Selesai', res.message, 'success');
    } catch (err: any) {
      showToast('Gagal Mengimpor Alumni', err.message || 'Terjadi kesalahan sistem', 'error');
      throw err;
    }
  };

  const sendSurveyInvitation = async (alumniId: string) => {
    try {
      const res = await api.inviteAlumni(alumniId);
      setAlumniRecords((prev) =>
        prev.map((a) =>
          a.id === alumniId
            ? {
                ...a,
                invitationStatus: 'Terkirim',
                reminderCount: a.reminderCount + 1,
                invitationToken: res.invitationToken || a.invitationToken,
              }
            : a
        )
      );
      showToast('Undangan Terkirim', res.message, 'success');
    } catch (err: any) {
      showToast('Gagal Mengirim Undangan', err.message || 'Terjadi kesalahan sistem', 'error');
      throw err;
    }
  };

  const submitTracerSurvey = async (response: Partial<TracerResponse>) => {
    try {
      const res = await api.submitSurvey(response);
      try {
        const updatedResponses = await api.getTracerResponses();
        setTracerResponses(updatedResponses);
      } catch {
        // ignore
      }
      showToast('Survei Pelacakan Tersimpan', res.message, 'success');
    } catch (err: any) {
      showToast('Gagal Mengirim Survei', err.message || 'Terjadi kesalahan sistem', 'error');
      throw err;
    }
  };

  const verifyTracerResponse = async (responseId: string, status: 'Terverifikasi' | 'Perlu Klarifikasi' | 'Tidak Valid') => {
    try {
      const res = await api.verifyTracerResponse(responseId, status);
      setTracerResponses((prev) => prev.map((r) => (r.id === responseId ? res.response : r)));
      showToast('Verifikasi Respons Berhasil', res.message, 'success');
    } catch (err: any) {
      showToast('Gagal Verifikasi Respons', err.message || 'Terjadi kesalahan sistem', 'error');
      throw err;
    }
  };

  const addJobPosting = async (job: Partial<JobPosting>) => {
    try {
      const res = await api.createJobPosting(job);
      setJobPostings((prev) => [res.job, ...prev]);
      showToast('Lowongan Dipublikasikan', res.message, 'success');
    } catch (err: any) {
      showToast('Gagal Publikasi Lowongan', err.message || 'Terjadi kesalahan sistem', 'error');
      throw err;
    }
  };

  const applyToJob = async (jobId: string, applicantName: string) => {
    try {
      const res = await api.applyToJob(jobId, applicantName);
      setJobPostings((prev) => prev.map((j) => (j.id === jobId ? res.job : j)));
      showToast('Lamaran Terkirim', res.message, 'success');
    } catch (err: any) {
      showToast('Gagal Mengajukan Lamaran', err.message || 'Terjadi kesalahan sistem', 'error');
      throw err;
    }
  };

  const enrollTraining = async (trainingId: string) => {
    try {
      const res = await api.enrollTraining(trainingId);
      setTrainingPrograms((prev) => prev.map((t) => (t.id === trainingId ? res.training : t)));
      showToast('Pendaftaran Berhasil', res.message, 'success');
    } catch (err: any) {
      showToast('Gagal Mendaftar Pelatihan', err.message || 'Terjadi kesalahan sistem', 'error');
      throw err;
    }
  };

  const submitUserSubjectRequest = async (type: UserSubjectRequest['requestType'], notes?: string) => {
    try {
      const res = await api.submitUserSubjectRequest({
        requestType: type,
        notes,
        userName: currentUser?.name || 'Ahmad Rizky Pratama (Alumni)',
      });
      setUserSubjectRequests((prev) => [res.request, ...prev]);
      showToast('Permohonan UU PDP Dicatat', res.message, 'info');
    } catch (err: any) {
      showToast('Gagal Mengajukan Permohonan', err.message || 'Terjadi kesalahan sistem', 'error');
      throw err;
    }
  };

  const resetAllData = async () => {
    try {
      const res = await api.resetDemoData();
      await loadAllData();
      showToast('Reset Selesai', res.message || 'Data demo berhasil dipulihkan ke seed awal.', 'success');
    } catch (err: any) {
      showToast('Gagal Reset Data', err.message || 'Terjadi kesalahan sistem', 'error');
      throw err;
    }
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <SinkronContext.Provider
      value={{
        activeRole,
        activePeriod,
        setActivePeriod,
        isLoading,
        error,
        refreshData: loadAllData,
        regions,
        sectors,
        competencies,
        schoolPrograms,
        demandSignals,
        matchResults,
        recommendations,
        alumniRecords,
        tracerResponses,
        jobPostings,
        trainingPrograms,
        pentahelixPartners,
        mouAgreements,
        forumSessions,
        auditLogs,
        userSubjectRequests,
        addCompetencyProposal,
        approveCompetency,
        submitDemandSignal,
        verifyDemandSignal,
        reviewMatchResult,
        runMatchAnalysis,
        addRecommendation,
        updateRecommendationStatus,
        importAlumniCsv,
        sendSurveyInvitation,
        submitTracerSurvey,
        verifyTracerResponse,
        addJobPosting,
        applyToJob,
        enrollTraining,
        submitUserSubjectRequest,
        resetAllData,
        notifications,
        markNotificationsAsRead,
      }}
    >
      {children}
    </SinkronContext.Provider>
  );
};

export const useSinkron = () => {
  const context = useContext(SinkronContext);
  if (!context) {
    throw new Error('useSinkron must be used within a SinkronProvider');
  }
  return context;
};
