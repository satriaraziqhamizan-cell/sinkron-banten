import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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
} from '../src/types/sinkron';

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
} from '../src/data/seedData';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  institutionId?: string;
  institutionName?: string;
  status: 'menunggu' | 'aktif' | 'ditangguhkan';
  twoFactorEnabled: boolean;
  failedLoginAttempts: number;
  lockedUntil?: string | null;
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface InstitutionRecord {
  id: string;
  type: 'sekolah' | 'perusahaan' | 'dinas' | 'bappeda' | 'kampus' | 'lembaga' | 'media' | 'komunitas';
  name: string;
  npsnOrNib?: string;
  regionId: string;
  sectorId?: string;
  schoolLevel?: 'SMK' | 'SMA';
  status: 'menunggu' | 'terverifikasi' | 'ditangguhkan';
  verifiedBy?: string;
  verifiedAt?: string;
  visibilityDefault: 'anonim' | 'tampil';
  createdAt: string;
}

export interface PeriodRecord {
  id: string;
  name: string;
  signalOpen: string;
  signalClose: string;
  trackingWindowStart: string;
  trackingWindowEnd: string;
  status: 'aktif' | 'tutup';
  suppressionThreshold: number; // default 10
}

export interface DatabaseSchema {
  isDemoData: boolean;
  users: UserRecord[];
  institutions: InstitutionRecord[];
  periods: PeriodRecord[];
  regions: Region[];
  sectors: Sector[];
  competencies: Competency[];
  schoolPrograms: SchoolProgram[];
  demandSignals: DemandSignal[];
  matchResults: MatchResult[];
  recommendations: Recommendation[];
  alumni: AlumniRecord[];
  tracerResponses: TracerResponse[];
  jobPostings: JobPosting[];
  trainingPrograms: TrainingProgram[];
  pentahelixPartners: PentahelixPartner[];
  mouAgreements: MouAgreement[];
  forumSessions: ForumSession[];
  auditLogs: AuditLog[];
  userSubjectRequests: UserSubjectRequest[];
  consentLogs: {
    id: string;
    userId: string;
    purpose: string;
    textVersion: string;
    granted: boolean;
    channel: string;
    timestamp: string;
    ipHash: string;
  }[];
  sessions?: SessionRecord[];
}

export interface SessionRecord {
  tokenHash: string; // SHA-256 hash of token
  userId: string;
  role: UserRole;
  createdAt: string;
  expiresAt: number; // timestamp in ms
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Versioned PBKDF2 Password Hashing (210,000 iterations, sha512)
export const CURRENT_PBKDF2_ITERATIONS = 210000;

export function hashPassword(password: string, customSalt?: string): string {
  const salt = customSalt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.pbkdf2Sync(password, salt, CURRENT_PBKDF2_ITERATIONS, 64, 'sha512').toString('hex');
  return `pbkdf2$${CURRENT_PBKDF2_ITERATIONS}$${salt}$${derived}`;
}

export function verifyPassword(password: string, storedHash: string): { valid: boolean; needsRehash: boolean } {
  if (!storedHash) return { valid: false, needsRehash: false };

  // New versioned format: pbkdf2$<iterations>$<salt>$<hash>
  if (storedHash.startsWith('pbkdf2$')) {
    const parts = storedHash.split('$');
    if (parts.length === 4) {
      const iterations = parseInt(parts[1], 10);
      const salt = parts[2];
      const expectedHash = parts[3];
      const derived = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
      const expectedBuffer = Buffer.from(expectedHash, 'hex');
      const derivedBuffer = Buffer.from(derived, 'hex');
      if (expectedBuffer.length === derivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, derivedBuffer)) {
        return {
          valid: true,
          needsRehash: iterations < CURRENT_PBKDF2_ITERATIONS,
        };
      }
    }
    return { valid: false, needsRehash: false };
  }

  // Legacy format backward compatibility: pbkdf2Sync(password, 'sinkron_banten_salt_2026', 1000, 64, 'sha512')
  const legacyHash = crypto.pbkdf2Sync(password, 'sinkron_banten_salt_2026', 1000, 64, 'sha512').toString('hex');
  if (legacyHash === storedHash) {
    return { valid: true, needsRehash: true };
  }

  return { valid: false, needsRehash: false };
}

// Generate token hash
export function generateSecureToken(): { token: string; hash: string } {
  const token = 'TRC-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadOrSeed();
  }

  private loadOrSeed(): DatabaseSchema {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8').trim();
        if (raw && raw.length > 10) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
            if (!Array.isArray(parsed.sessions)) {
              parsed.sessions = [];
            }
            return parsed;
          }
        }
      } catch (err) {
        console.error('Error loading db.json, reseeding default data:', err);
      }
    }

    return this.createSeedData();
  }

  public resetToSeed(): DatabaseSchema {
    this.data = this.createSeedData();
    this.save();
    return this.data;
  }

  public createSeedData(): DatabaseSchema {
    // Default Seed Data
    const defaultUsers: UserRecord[] = [
      {
        id: 'usr_admin',
        email: 'admin@bantenprov.go.id',
        passwordHash: hashPassword('AdminS1nkron#2026'),
        name: 'Drs. H. Mulyadi (Super Admin)',
        role: 'admin',
        institutionId: 'inst_disdik',
        institutionName: 'Dinas Pendidikan & Kebudayaan Prov. Banten',
        status: 'aktif',
        twoFactorEnabled: true,
        failedLoginAttempts: 0,
        createdAt: '2026-01-01',
      },
      {
        id: 'usr_disdik',
        email: 'disdik@bantenprov.go.id',
        passwordHash: hashPassword('DisdikBanten#2026'),
        name: 'Dr. H. Tabrani, M.Pd (Disdik)',
        role: 'disdik',
        institutionId: 'inst_disdik',
        institutionName: 'Dinas Pendidikan & Kebudayaan Prov. Banten',
        status: 'aktif',
        twoFactorEnabled: true,
        failedLoginAttempts: 0,
        createdAt: '2026-01-01',
      },
      {
        id: 'usr_disnaker',
        email: 'disnaker@bantenprov.go.id',
        passwordHash: hashPassword('DisnakerBanten#2026'),
        name: 'Drs. H. Septo Kalnadi, MM (Disnaker)',
        role: 'disnaker',
        institutionId: 'inst_disnaker',
        institutionName: 'Dinas Tenaga Kerja & Transmigrasi Prov. Banten',
        status: 'aktif',
        twoFactorEnabled: true,
        failedLoginAttempts: 0,
        createdAt: '2026-01-01',
      },
      {
        id: 'usr_bappeda',
        email: 'bappeda@bantenprov.go.id',
        passwordHash: hashPassword('BappedaBanten#2026'),
        name: 'Dra. Hj. Sri Rahayu (Bappeda)',
        role: 'bappeda',
        institutionId: 'inst_bappeda',
        institutionName: 'Bappeda Litbang Provinsi Banten',
        status: 'aktif',
        twoFactorEnabled: true,
        failedLoginAttempts: 0,
        createdAt: '2026-01-01',
      },
      {
        id: 'usr_school',
        email: 'bkk.smkn1cilegon@sch.id',
        passwordHash: hashPassword('Smkn1Cilegon#2026'),
        name: 'Dra. Endang (Koordinator BKK SMKN 1 Cilegon)',
        role: 'school',
        institutionId: 'inst_smkn1_clg',
        institutionName: 'SMKN 1 Cilegon',
        status: 'aktif',
        twoFactorEnabled: true,
        failedLoginAttempts: 0,
        createdAt: '2026-02-01',
      },
      {
        id: 'usr_school_cikupa',
        email: 'bkk.smkn1cikupa@sch.id',
        passwordHash: hashPassword('Smkn1Cikupa#2026'),
        name: 'Drs. H. Mamat (Koordinator BKK SMKN 1 Cikupa)',
        role: 'school',
        institutionId: 'inst_smkn1_ckp',
        institutionName: 'SMKN 1 Cikupa (Kab. Tangerang)',
        status: 'aktif',
        twoFactorEnabled: true,
        failedLoginAttempts: 0,
        createdAt: '2026-02-01',
      },
      {
        id: 'usr_industry',
        email: 'recruitment@krakatausteel.com',
        passwordHash: hashPassword('KrakatauSteel#2026'),
        name: 'Budi Kurniawan (HRD PT Krakatau Steel)',
        role: 'industry',
        institutionId: 'inst_krakatau',
        institutionName: 'PT Krakatau Steel (Persero) Tbk',
        status: 'aktif',
        twoFactorEnabled: false,
        failedLoginAttempts: 0,
        createdAt: '2026-02-15',
      },
      {
        id: 'usr_alumni',
        email: 'rizky.pratama@gmail.com',
        passwordHash: hashPassword('AlumniBanten#2026'),
        name: 'Ahmad Rizky Pratama',
        role: 'alumni',
        institutionId: 'inst_smkn1_clg',
        institutionName: 'SMKN 1 Cilegon',
        status: 'aktif',
        twoFactorEnabled: false,
        failedLoginAttempts: 0,
        createdAt: '2026-05-10',
      },
      {
        id: 'usr_akademisi',
        email: 'wahyu.susihono@untirta.ac.id',
        passwordHash: hashPassword('UntirtaVokasi#2026'),
        name: 'Prof. Dr. Ir. Wahyu Susihono, ST, MT',
        role: 'akademisi',
        institutionId: 'inst_untirta',
        institutionName: 'Fakultas Teknik Universitas Sultan Ageng Tirtayasa',
        status: 'aktif',
        twoFactorEnabled: false,
        failedLoginAttempts: 0,
        createdAt: '2026-02-20',
      },
      {
        id: 'usr_koordinator',
        email: 'koordinator@vokasi-banten.id',
        passwordHash: hashPassword('VokasiBanten#2026'),
        name: 'Amal Verry (Sekretariat TKDV)',
        role: 'koordinator',
        institutionId: 'inst_tkdv',
        institutionName: 'Sekretariat Tim Koordinasi Daerah Vokasi Banten',
        status: 'aktif',
        twoFactorEnabled: true,
        failedLoginAttempts: 0,
        createdAt: '2026-01-10',
      },
    ];

    const defaultInstitutions: InstitutionRecord[] = [
      {
        id: 'inst_disdik',
        type: 'dinas',
        name: 'Dinas Pendidikan & Kebudayaan Prov. Banten',
        regionId: 'kota_serang',
        status: 'terverifikasi',
        visibilityDefault: 'tampil',
        createdAt: '2026-01-01',
      },
      {
        id: 'inst_disnaker',
        type: 'dinas',
        name: 'Dinas Tenaga Kerja & Transmigrasi Prov. Banten',
        regionId: 'kota_serang',
        status: 'terverifikasi',
        visibilityDefault: 'tampil',
        createdAt: '2026-01-01',
      },
      {
        id: 'inst_bappeda',
        type: 'bappeda',
        name: 'Bappeda Litbang Provinsi Banten',
        regionId: 'kota_serang',
        status: 'terverifikasi',
        visibilityDefault: 'tampil',
        createdAt: '2026-01-01',
      },
      {
        id: 'inst_smkn1_clg',
        type: 'sekolah',
        name: 'SMKN 1 Cilegon',
        npsnOrNib: '20606241',
        regionId: 'cilegon',
        schoolLevel: 'SMK',
        status: 'terverifikasi',
        visibilityDefault: 'tampil',
        createdAt: '2026-01-01',
      },
      {
        id: 'inst_smkn1_ckp',
        type: 'sekolah',
        name: 'SMKN 1 Cikupa (Kab. Tangerang)',
        npsnOrNib: '20606245',
        regionId: 'kab_tangerang',
        schoolLevel: 'SMK',
        status: 'terverifikasi',
        visibilityDefault: 'tampil',
        createdAt: '2026-01-01',
      },
      {
        id: 'inst_smkn2_srg',
        type: 'sekolah',
        name: 'SMKN 2 Kota Serang',
        npsnOrNib: '20606242',
        regionId: 'kota_serang',
        schoolLevel: 'SMK',
        status: 'terverifikasi',
        visibilityDefault: 'tampil',
        createdAt: '2026-01-01',
      },
      {
        id: 'inst_smkn1_tgr',
        type: 'sekolah',
        name: 'SMKN 1 Kota Tangerang',
        npsnOrNib: '20606243',
        regionId: 'kota_tangerang',
        schoolLevel: 'SMK',
        status: 'terverifikasi',
        visibilityDefault: 'tampil',
        createdAt: '2026-01-01',
      },
      {
        id: 'inst_smkn1_pdg',
        type: 'sekolah',
        name: 'SMKN 1 Pandeglang',
        npsnOrNib: '20606244',
        regionId: 'pandeglang',
        schoolLevel: 'SMK',
        status: 'terverifikasi',
        visibilityDefault: 'tampil',
        createdAt: '2026-01-01',
      },
      {
        id: 'inst_krakatau',
        type: 'perusahaan',
        name: 'PT Krakatau Steel (Persero) Tbk',
        npsnOrNib: '8120001928371',
        regionId: 'cilegon',
        sectorId: 'sec_manufaktur',
        status: 'terverifikasi',
        visibilityDefault: 'tampil',
        createdAt: '2026-01-01',
      },
      {
        id: 'inst_chandra_asri',
        type: 'perusahaan',
        name: 'PT Chandra Asri Pacific Tbk',
        npsnOrNib: '8120005544332',
        regionId: 'cilegon',
        sectorId: 'sec_kimia',
        status: 'terverifikasi',
        visibilityDefault: 'tampil',
        createdAt: '2026-01-01',
      },
      {
        id: 'inst_mayora',
        type: 'perusahaan',
        name: 'PT Mayora Indah Tbk (Balaraja)',
        npsnOrNib: '8120009988776',
        regionId: 'kab_tangerang',
        sectorId: 'sec_logistik',
        status: 'terverifikasi',
        visibilityDefault: 'anonim',
        createdAt: '2026-01-01',
      },
    ];

    const defaultPeriods: PeriodRecord[] = [
      {
        id: 'per_2026_ganjil',
        name: '2026/Ganjil',
        signalOpen: '2026-09-01',
        signalClose: '2026-11-30',
        trackingWindowStart: '2026-09-15',
        trackingWindowEnd: '2026-12-31',
        status: 'aktif',
        suppressionThreshold: 10,
      },
      {
        id: 'per_2025_genap',
        name: '2025/Genap',
        signalOpen: '2026-02-01',
        signalClose: '2026-04-30',
        trackingWindowStart: '2026-03-01',
        trackingWindowEnd: '2026-05-31',
        status: 'tutup',
        suppressionThreshold: 10,
      },
    ];

    const initialData: DatabaseSchema = {
      isDemoData: true,
      users: JSON.parse(JSON.stringify(defaultUsers)),
      institutions: JSON.parse(JSON.stringify(defaultInstitutions)),
      periods: JSON.parse(JSON.stringify(defaultPeriods)),
      regions: JSON.parse(JSON.stringify(BANTEN_REGIONS)),
      sectors: JSON.parse(JSON.stringify(BANTEN_SECTORS)),
      competencies: JSON.parse(JSON.stringify(COMPETENCY_DICTIONARY)),
      schoolPrograms: JSON.parse(JSON.stringify(SCHOOL_PROGRAMS)),
      demandSignals: JSON.parse(JSON.stringify(DEMAND_SIGNALS)),
      matchResults: JSON.parse(JSON.stringify(MATCH_RESULTS_DATA)),
      recommendations: JSON.parse(JSON.stringify(RECOMMENDATIONS_DATA)),
      alumni: JSON.parse(JSON.stringify(ALUMNI_SAMPLE_LIST)),
      tracerResponses: JSON.parse(JSON.stringify(TRACER_RESPONSES_DATA)),
      jobPostings: JSON.parse(JSON.stringify(JOB_POSTINGS_DATA)),
      trainingPrograms: JSON.parse(JSON.stringify(TRAINING_PROGRAMS_DATA)),
      pentahelixPartners: JSON.parse(JSON.stringify(PENTAHELIX_PARTNERS_DATA)),
      mouAgreements: JSON.parse(JSON.stringify(MOU_AGREEMENTS_DATA)),
      forumSessions: JSON.parse(JSON.stringify(FORUM_SESSIONS_DATA)),
      auditLogs: JSON.parse(JSON.stringify(AUDIT_LOGS_DATA)),
      userSubjectRequests: JSON.parse(JSON.stringify(USER_SUBJECT_REQUESTS_SAMPLE)),
      consentLogs: [],
      sessions: [],
    };

    this.persist(initialData);
    return initialData;
  }

  private persist(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to db.json:', err);
    }
  }

  public save() {
    this.persist(this.data);
  }

  public getRaw(): DatabaseSchema {
    return this.data;
  }

  // --- Audit Logging ---
  public logAudit(actorName: string, actorRole: UserRole, action: string, objectType: string, objectId: string, ip: string, details: string) {
    const entry: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName,
      actorRole,
      action,
      objectType,
      objectId,
      ip: ip || '127.0.0.1',
      details,
    };
    this.data.auditLogs.unshift(entry);
    this.save();
    return entry;
  }

  // --- User / Auth Queries ---
  public findUserByEmail(email: string): UserRecord | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): UserRecord | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(user: Omit<UserRecord, 'id' | 'createdAt' | 'failedLoginAttempts'>): UserRecord {
    const newRecord: UserRecord = {
      ...user,
      id: `usr_${Date.now()}`,
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newRecord);
    this.save();
    return newRecord;
  }

  public updateUser(id: string, updates: Partial<UserRecord>): UserRecord | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // --- Sessions (Database-Backed Persistent Token Storage) ---
  public createSession(token: string, userId: string, role: UserRole, ttlMs: number = 7 * 24 * 60 * 60 * 1000): SessionRecord {
    if (!this.data.sessions) this.data.sessions = [];
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const now = Date.now();
    const session: SessionRecord = {
      tokenHash,
      userId,
      role,
      createdAt: new Date().toISOString(),
      expiresAt: now + ttlMs,
    };
    // Purge expired sessions while saving new one
    this.data.sessions = this.data.sessions.filter((s) => s.expiresAt > now);
    this.data.sessions.push(session);
    this.save();
    return session;
  }

  public findSession(token: string): SessionRecord | null {
    if (!this.data.sessions) this.data.sessions = [];
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const now = Date.now();
    const session = this.data.sessions.find((s) => s.tokenHash === tokenHash);
    if (!session) return null;
    if (session.expiresAt < now) {
      this.deleteSession(token);
      return null;
    }
    return session;
  }

  public deleteSession(token: string): void {
    if (!this.data.sessions) return;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const initialLen = this.data.sessions.length;
    this.data.sessions = this.data.sessions.filter((s) => s.tokenHash !== tokenHash);
    if (this.data.sessions.length !== initialLen) {
      this.save();
    }
  }

  public cleanExpiredSessions(): number {
    if (!this.data.sessions) return 0;
    const now = Date.now();
    const initialLen = this.data.sessions.length;
    this.data.sessions = this.data.sessions.filter((s) => s.expiresAt > now);
    const removed = initialLen - this.data.sessions.length;
    if (removed > 0) {
      this.save();
    }
    return removed;
  }

  // --- Institutions ---
  public getInstitutions(): InstitutionRecord[] {
    return this.data.institutions;
  }

  public createInstitution(inst: Omit<InstitutionRecord, 'id' | 'createdAt'>): InstitutionRecord {
    const newInst: InstitutionRecord = {
      ...inst,
      id: `inst_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.institutions.push(newInst);
    this.save();
    return newInst;
  }

  public verifyInstitution(id: string, verifiedBy: string, status: 'terverifikasi' | 'ditangguhkan'): InstitutionRecord | undefined {
    const inst = this.data.institutions.find((i) => i.id === id);
    if (!inst) return undefined;
    inst.status = status;
    inst.verifiedBy = verifiedBy;
    inst.verifiedAt = new Date().toISOString().split('T')[0];
    this.save();
    return inst;
  }

  // --- Aggregates with Small-Cell Suppression (Section 10.6) ---
  public getPublicAnalytics(regionId?: string) {
    const threshold = this.data.periods.find((p) => p.status === 'aktif')?.suppressionThreshold || 10;
    const filteredResponses = regionId && regionId !== 'all'
      ? this.data.tracerResponses.filter((r) => r.workRegionId === regionId)
      : this.data.tracerResponses;

    const n = filteredResponses.length;
    const isSuppressed = n < threshold;

    const totalAlumni = regionId && regionId !== 'all'
      ? this.data.alumni.filter((a) => {
          const prog = this.data.schoolPrograms.find((p) => p.id === a.programId);
          return prog?.regionId === regionId;
        }).length
      : this.data.alumni.length;

    const responseRate = totalAlumni > 0 ? ((n / totalAlumni) * 100).toFixed(1) : '0';

    if (isSuppressed) {
      return {
        period: '2026/Ganjil',
        n,
        responseRate: `${responseRate}%`,
        suppressed: true,
        message: 'Data belum cukup (ambang privasi subjek n < 10 terpenuhi).',
        totalJobs: 0,
        avgAbsorption: 0,
      };
    }

    const workingCount = filteredResponses.filter(
      (r) => r.statusCurrent === 'Bekerja Penuh' || r.statusCurrent === 'Bekerja Kontrak/Paruh Waktu' || r.statusCurrent === 'Wirausaha' || r.statusCurrent === 'Magang'
    ).length;

    const absorptionRate = n > 0 ? ((workingCount / n) * 100).toFixed(1) : '0';

    const fieldMatchCount = filteredResponses.filter((r) => r.fieldMatch === 'Sangat Sesuai').length;
    const fieldMatchPct = workingCount > 0 ? ((fieldMatchCount / workingCount) * 100).toFixed(1) : '0';

    const targetRegions = regionId && regionId !== 'all'
      ? this.data.regions.filter((r) => r.id === regionId)
      : this.data.regions;

    const totalOpenJobs = targetRegions.reduce((sum, r) => sum + r.openJobSlots, 0);
    const activeCompaniesCount = targetRegions.reduce((sum, r) => sum + r.activeCompanies, 0);

    return {
      period: '2026/Ganjil',
      n,
      responseRate: `${responseRate}%`,
      suppressed: false,
      absorptionRate: Number(absorptionRate),
      fieldMatchPct: Number(fieldMatchPct),
      totalOpenJobs,
      activeCompaniesCount,
      regions: targetRegions,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const db = new Database();
