import { UserRole } from '../types/sinkron';

const API_BASE = '/api';

export function getStoredToken(): string | null {
  return localStorage.getItem('sinkron_jwt_token');
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem('sinkron_jwt_token', token);
  } else {
    localStorage.removeItem('sinkron_jwt_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Permintaan gagal (${res.status})`);
  }

  return data as T;
}

export const api = {
  // Bootstrap & Health
  getBootstrap: () => request<{ isDemoData: boolean; isDemoMode?: boolean; activePeriod: string; currentUser: any }>('/bootstrap'),
  getHealth: () => request<{ status: string; uptime: number }>('/health'),

  // Auth
  register: (payload: any) => request<{ message: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) => request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  forgotPassword: (email: string) => request<{ success: boolean; message: string }>('/auth/forgot', { method: 'POST', body: JSON.stringify({ email }) }),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
  demoLogin: (role: string) => request<{ token: string | null; user: any; message: string }>('/demo/login', { method: 'POST', body: JSON.stringify({ role }) }),

  // Analytics & Public
  getKpiAnalytics: (regionId?: string) => request<any>(`/analytics/kpi${regionId ? `?regionId=${regionId}` : ''}`),
  getRegions: () => request<any[]>('/public/regions'),
  getSectors: () => request<any[]>('/public/sectors'),
  getPublicJobs: () => request<any[]>('/public/jobs'),
  getPublicTrainings: () => request<any[]>('/public/trainings'),

  // Survey & Tracer
  getSurveyByToken: (token: string) => request<any>(`/survey/invite/${token}`),
  submitSurvey: (payload: any) => request<{ message: string; responseId: string }>('/survey/submit', { method: 'POST', body: JSON.stringify(payload) }),
  getTracerResponses: () => request<any[]>('/survey/responses'),
  verifyTracerResponse: (id: string, status: string) =>
    request<{ message: string; response: any }>(`/survey/responses/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // School
  getSchoolPrograms: () => request<any[]>('/school/programs'),
  getSchoolAlumni: () => request<any[]>('/school/alumni'),
  getAlumniAggregate: () => request<any>('/school/alumni/aggregate'),
  importAlumni: (records: any[], schoolId?: string, programId?: string) =>
    request<{ message: string; importedCount: number }>('/school/alumni/import', {
      method: 'POST',
      body: JSON.stringify({ records, schoolId, programId }),
    }),
  inviteAlumni: (alumniId: string) =>
    request<{ message: string; invitationToken?: string; surveyUrl?: string }>('/school/alumni/invite', {
      method: 'POST',
      body: JSON.stringify({ alumniId }),
    }),

  // Industry
  getDemandSignals: () => request<any[]>('/industry/signals'),
  createDemandSignal: (payload: any) =>
    request<{ message: string; signal: any }>('/industry/signals', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  verifyDemandSignal: (id: string, status: string) =>
    request<{ message: string; signal: any }>(`/industry/signals/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Jobs & Trainings
  createJobPosting: (payload: any) =>
    request<{ message: string; job: any }>('/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  applyToJob: (jobId: string, applicantName: string) =>
    request<{ message: string; job: any }>(`/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ applicantName }),
    }),
  enrollTraining: (trainingId: string) =>
    request<{ message: string; training: any }>(`/trainings/${trainingId}/enroll`, {
      method: 'POST',
    }),

  // Match Matrix & Recommendations
  getMatchResults: () => request<any[]>('/match/results'),
  analyzeMatch: (programId: string, signalId?: string) =>
    request<{ message: string; matchResult: any }>('/match/analyze', {
      method: 'POST',
      body: JSON.stringify({ programId, signalId }),
    }),
  reviewMatchResult: (id: string, decision: string) =>
    request<{ message: string; match: any }>('/match/review', {
      method: 'POST',
      body: JSON.stringify({ id, decision }),
    }),
  getRecommendations: () => request<any[]>('/recommendations'),
  createRecommendation: (payload: any) =>
    request<{ message: string; recommendation: any }>('/recommendations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateRecommendationStatus: (id: string, status: string, reason?: string) =>
    request<{ message: string; recommendation: any }>(`/recommendations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    }),

  // Competencies
  getCompetencies: () => request<any[]>('/competencies'),
  proposeCompetency: (payload: any) =>
    request<{ message: string; competency: any }>('/competencies/propose', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  approveCompetency: (id: string) =>
    request<{ message: string }>(`/competencies/${id}/approve`, {
      method: 'POST',
    }),

  // Pentahelix
  getPentahelixPartners: () => request<any[]>('/pentahelix/partners'),
  getMouAgreements: () => request<any[]>('/pentahelix/mou'),
  getForumSessions: () => request<any[]>('/pentahelix/forum'),

  // Privacy & Data Subject Rights (UU PDP)
  submitUserSubjectRequest: (payload: { requestType: string; notes?: string; userName?: string }) =>
    request<{ message: string; request: any }>('/privacy/subject-request', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getUserSubjectRequests: () => request<any[]>('/privacy/subject-requests'),

  // Admin
  getInstitutions: () => request<any[]>('/admin/institutions'),
  verifyInstitution: (id: string, status: string) =>
    request<{ message: string; institution: any }>(`/admin/institutions/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
  getAuditLogs: () => request<any[]>('/admin/audit-logs'),
  resetDemoData: () =>
    request<{ message: string }>('/admin/reset-demo', {
      method: 'POST',
    }),

  // AI
  analyzeAiMatch: (payload: { jobTitle: string; jobDescription?: string; curriculumSyllabus?: string }) =>
    request<any>('/ai/match', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
