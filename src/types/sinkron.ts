export type UserRole =
  | 'public'
  | 'alumni'
  | 'industry'
  | 'school'
  | 'disdik'
  | 'disnaker'
  | 'bappeda'
  | 'akademisi'
  | 'koordinator'
  | 'admin';

export interface Region {
  id: string;
  code: string;
  name: string;
  level: 'kabupaten' | 'kota' | 'provinsi';
  tpt: number; // Tingkat Pengangguran Terbuka (%)
  graduateAbsorptionRate: number; // % terserap dalam 6 bulan
  activeCompanies: number;
  vocationalSchools: number;
  openJobSlots: number;
}

export interface Sector {
  id: string;
  code: string;
  name: string;
  description: string;
  iconName: string;
  activeDemandCount: number;
}

export interface Competency {
  id: string;
  code: string;
  name: string;
  description: string;
  sectorId: string;
  type: 'teknis' | 'non-teknis' | 'sertifikasi';
  skkniCode?: string;
  kkniLevel?: number;
  levelScale: number; // 1-5
  status: 'disetujui' | 'ditinjau' | 'draf' | 'arsip';
  version: string;
  synonyms: string[];
  proposedBy?: string;
  demandTrend?: 'naik' | 'stabil' | 'menurun' | 'baru';
}

export interface SchoolProgram {
  id: string;
  schoolId: string;
  schoolName: string;
  regionId: string;
  name: string; // e.g. Teknik Mekatronika, Teknik Kimia Industri, Rekayasa Perangkat Lunak
  programCode: string;
  graduatesPerYear: number;
  competencies: {
    competencyId: string;
    masteryLevel: number; // 1-5
    practiceShare: number; // % e.g. 65%
    isCore: boolean;
  }[];
  accreditation: 'A' | 'B' | 'Unggul';
}

export interface DemandSignalItem {
  id: string;
  positionTitle: string;
  competencyIds: string[];
  educationMin: 'SMK' | 'SMA' | 'D3' | 'S1';
  headcountMin: number;
  headcountMax: number;
  regionId: string;
  contractType: 'PKWT (Kontrak)' | 'PKWTT (Tetap)' | 'Magang Industri' | 'Freelance/Proyek';
  priority: 'Tinggi' | 'Sedang' | 'Rendah';
  internshipSlots: number;
  requiredCertifications?: string[];
  notes?: string;
}

export interface DemandSignal {
  id: string;
  companyId: string;
  companyName: string;
  sectorId: string;
  periodId: string;
  status: 'Draf' | 'Diajukan' | 'Diverifikasi' | 'Aktif' | 'Kedaluwarsa';
  visibility: 'anonim' | 'tampil';
  submittedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  items: DemandSignalItem[];
  notes?: string;
}

export interface MatchResult {
  id: string;
  programId: string;
  programName: string;
  schoolName: string;
  regionId: string;
  sectorId: string;
  demandCompetencyId: string;
  demandCompetencyName: string;
  demandWeight: number; // 1-100
  curriculumCoverage: number; // 0 = belum, 0.5 = sebagian, 1.0 = penuh
  gapLevel: 'Tinggi' | 'Sedang' | 'Rendah' | 'Sesuai';
  evidence: string;
  aiSuggestedAdjustment?: string;
  aiConfidence?: number; // 0-100
  humanReviewed: boolean;
  reviewedBy?: string;
  decision?: 'Diterima' | 'Ditolak' | 'Dalam Pembahasan';
}

export interface Recommendation {
  id: string;
  code: string;
  title: string;
  description: string;
  type: 'kurikulum' | 'praktik' | 'magang' | 'pelatihan' | 'kebijakan';
  targetInstitution: string;
  assignedTo: string;
  regionId: string;
  sectorId: string;
  dueDate: string;
  status: 'Usulan' | 'Dalam Pembahasan' | 'Diterima' | 'Dijalankan' | 'Selesai' | 'Ditolak';
  decisionReason?: string;
  decidedBy?: string;
  kpiTarget?: string;
}

export interface AlumniRecord {
  id: string;
  cohortId: string;
  schoolId: string;
  programId: string;
  name: string;
  graduationYear: number;
  email: string;
  phone: string;
  invitationStatus: 'Belum Dikirim' | 'Terkirim' | 'Dibuka' | 'Selesai';
  invitationToken: string;
  reminderCount: number;
  responseId?: string;
}

export interface TracerResponse {
  id: string;
  alumniId: string;
  schoolId: string;
  programId: string;
  statusCurrent: 'Bekerja Penuh' | 'Bekerja Kontrak/Paruh Waktu' | 'Wirausaha' | 'Magang' | 'Melanjutkan Studi' | 'Mencari Kerja' | 'Lainnya';
  // If working / entrepreneur:
  sectorId?: string;
  positionTitle?: string;
  workRegionId?: string;
  employerName?: string;
  fieldMatch: 'Sangat Sesuai' | 'Sebagian Sesuai' | 'Tidak Sesuai';
  monthsToFirstJob?: number;
  incomeRange?: '< UMR' | '1x - 1.5x UMR' | '1.5x - 2x UMR' | '> 2x UMR';
  // If searching or gaps:
  barriers?: string[];
  missingCompetencies?: string[];
  usefulCompetencies?: string[];
  // Consents (UU PDP):
  consentContactJobOffer: boolean;
  consentAnonymizedResearch: boolean;
  completedAt: string;
  verificationStatus: 'Terverifikasi' | 'Perlu Klarifikasi' | 'Tidak Valid';
  verifiedBy?: string;
}

export interface JobPosting {
  id: string;
  companyId: string;
  companyName: string;
  isCompanyVerified: boolean;
  title: string;
  type: 'Lowongan Kerja' | 'Magang Vokasi';
  sectorId: string;
  regionId: string;
  requiredCompetencies: string[];
  educationMin: string;
  salaryMin?: number;
  salaryMax?: number;
  headcount: number;
  deadline: string;
  description: string;
  applyMethod: 'internal' | 'external';
  externalUrl?: string;
  status: 'Aktif' | 'Tutup' | 'Kedaluwarsa';
  reportedCount: number;
  applicantsCount: number;
}

export interface TrainingProgram {
  id: string;
  providerName: string; // e.g. BLK Provinsi Banten (Serang), Balai Diklat Industri
  title: string;
  sectorId: string;
  regionId: string;
  competencyIds: string[];
  durationWeeks: number;
  quota: number;
  enrolledCount: number;
  costType: 'Gratis (APBD Banten)' | 'Beasiswa Mitra' | 'Mandiri';
  certification: string; // BNSP / SKKNI
  address: string;
  startDate: string;
  status: 'Pendaftaran Dibuka' | 'Sedang Berjalan' | 'Selesai';
  placementRate6Months: number; // % terserap kerja dalam 6 bulan
}

export interface PentahelixPartner {
  id: string;
  name: string;
  category: 'Pemerintah' | 'Bisnis/Industri' | 'Akademisi' | 'Komunitas/Asosiasi' | 'Media';
  contactPerson: string;
  region: string;
  mouCount: number;
  activeCollab: string;
}

export interface MouAgreement {
  id: string;
  code: string;
  title: string;
  parties: string[];
  type: 'PKS Kurikulum & Magang' | 'MoU Sinyal Kebutuhan' | 'Penyaluran Lulusan' | 'Riset Vokasi';
  startDate: string;
  endDate: string;
  status: 'Aktif' | 'Akan Berakhir' | 'Kedaluwarsa';
  documentUrl?: string;
}

export interface ForumSession {
  id: string;
  periodId: string;
  title: string;
  date: string;
  location: string;
  attendeesCount: number;
  agendaItems: string[];
  minutesSummary: string;
  actionItems: {
    title: string;
    owner: string;
    dueDate: string;
    status: 'Menunggu' | 'Berjalan' | 'Selesai';
  }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  objectType: string;
  objectId: string;
  ip: string;
  details: string;
}

export interface UserSubjectRequest {
  id: string;
  userId: string;
  userName: string;
  requestType: 'Unduh Salinan Data' | 'Tarik Persetujuan' | 'Koreksi Data' | 'Penghapusan Data';
  submittedAt: string;
  status: 'Selesai' | 'Sedang Diproses' | 'Menunggu';
  dueAt: string;
  notes: string;
}
