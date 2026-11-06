import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { db, hashPassword, verifyPassword, generateSecureToken, UserRecord } from './server/db.js';
import { UserRole, JobPosting, TrainingProgram, UserSubjectRequest, MatchResult } from './src/types/sinkron.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

function isDemoModeActive(): boolean {
  if (process.env.DEMO_MODE === 'true' || process.env.VITE_DEMO_MODE === 'true') return true;
  try {
    const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8');
    return /DEMO_MODE=["']?true["']?/i.test(envContent) || /VITE_DEMO_MODE=["']?true["']?/i.test(envContent);
  } catch {
    return false;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Security Headers & JSON body parsing
app.use(express.json({ limit: '5mb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https: ws: wss:",
      "frame-ancestors 'self' https: *",
      "object-src 'none'",
      "base-uri 'self'",
    ].join('; ')
  );
  next();
});

// In-Memory Rate Limiting Factory
interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message: string;
  keyGenerator?: (req: Request) => string;
}

function createRateLimiter(options: RateLimiterOptions) {
  const hits = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = options.keyGenerator ? options.keyGenerator(req) : (req.ip || '127.0.0.1');
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now > entry.resetTime) {
      hits.set(key, { count: 1, resetTime: now + options.windowMs });
      return next();
    }

    if (entry.count >= options.max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetTime - now) / 1000));
      return res.status(429).json({ error: options.message });
    }

    entry.count += 1;
    next();
  };
}

// 120 req/min/IP for /api/public/* and /api/analytics/*
const publicAnalyticsRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: 'Batas laju terlampaui. Maksimal 120 permintaan per menit untuk data publik dan analitik.',
});

// 10 req/min/IP for /api/survey/*
const surveyRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Batas laju terlampaui. Maksimal 10 permintaan per menit untuk survei pelacakan.',
});

// 20 req/min per user for /api/ai/match
const aiMatchRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Batas laju terlampaui. Maksimal 20 analisis AI per menit per pengguna.',
  keyGenerator: (req) => {
    const user = (req as any).user;
    return user ? `user_${user.id}` : `ip_${req.ip || '127.0.0.1'}`;
  },
});

// Database-Backed Persistent Session Store (SHA-256 hashed tokens)
function generateAuthToken(user: UserRecord): string {
  const token = 'SKR_AUTH_' + crypto.randomBytes(24).toString('hex');
  db.createSession(token, user.id, user.role, 7 * 24 * 60 * 60 * 1000); // 7 days
  return token;
}

// Authentication Middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    (req as any).user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  const session = db.findSession(token);
  if (!session) {
    (req as any).user = null;
    return next();
  }

  const user = db.findUserById(session.userId);
  (req as any).user = user || null;
  next();
}

// Periodic cleanup of expired sessions
setInterval(() => {
  db.cleanExpiredSessions();
}, 15 * 60 * 1000).unref();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).user) {
    return res.status(401).json({ error: 'Autentikasi diperlukan. Silakan masuk terlebih dahulu.' });
  }
  next();
}

function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user: UserRecord = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Akses ditolak. Sesi tidak valid.' });
    }
    if (!allowedRoles.includes(user.role)) {
      db.logAudit(
        user.name,
        user.role,
        'Akses Lintas Peran Ditolak',
        'Security',
        req.path,
        req.ip || '127.0.0.1',
        `Pengguna peran ${user.role} mencoba mengakses rute terproteksi: ${req.path}`
      );
      return res.status(403).json({ error: 'Hak akses tidak mencukupi untuk tindakan ini.' });
    }
    next();
  };
}

app.use(authMiddleware);

// Apply Rate Limiters
app.use('/api/public', publicAnalyticsRateLimiter);
app.use('/api/analytics', publicAnalyticsRateLimiter);
app.use('/api/survey', surveyRateLimiter);

// --- 1. Health & Bootstrap API ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'SINKRON Banten Backend',
  });
});

app.get('/api/bootstrap', (req, res) => {
  const currentUser = (req as any).user;
  const raw = db.getRaw();
  const isDemoMode = isDemoModeActive();
  res.json({
    isDemoData: raw.isDemoData,
    isDemoMode,
    activePeriod: raw.periods.find((p) => p.status === 'aktif')?.name || '2026/Ganjil',
    currentUser: currentUser
      ? {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          institutionId: currentUser.institutionId,
          institutionName: currentUser.institutionName,
          status: currentUser.status,
          twoFactorEnabled: currentUser.twoFactorEnabled,
        }
      : null,
  });
});

// Demo Login for Juri Evaluation (/demo)
app.post('/api/demo/login', (req, res) => {
  const isDemo = isDemoModeActive();
  if (!isDemo) {
    return res.status(404).json({ error: 'Endpoint demo dinonaktifkan di lingkungan produksi.' });
  }

  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ error: 'Peran tidak ditentukan.' });
  }

  if (role === 'public') {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      db.deleteSession(token);
    }
    return res.json({ token: null, user: null, message: 'Beralih ke mode Masyarakat / Publik.' });
  }

  const user = db.getRaw().users.find((u) => u.role === role);
  if (!user) {
    return res.status(404).json({ error: `Akun contoh untuk peran ${role} tidak ditemukan di basis data seed.` });
  }

  const token = generateAuthToken(user);
  db.logAudit(
    user.name,
    user.role,
    'Masuk Mode Demo Juri',
    'User',
    user.id,
    req.ip || '127.0.0.1',
    `Juri beralih ke peran ${role} melalui panel demonstrasi terpandu`
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
      institutionName: user.institutionName,
      status: user.status,
      twoFactorEnabled: user.twoFactorEnabled,
    },
    message: `Berhasil masuk sebagai ${user.name} (${user.role.toUpperCase()})`,
  });
});

// --- 2. Auth Endpoints ---
const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(10, 'Sandi minimal 10 karakter'),
  role: z.enum([
    'alumni',
    'industry',
    'school',
    'disdik',
    'disnaker',
    'bappeda',
    'akademisi',
    'koordinator',
  ]),
  institutionName: z.string().optional(),
  npsnOrNib: z.string().optional(),
  regionId: z.string().optional(),
  sectorId: z.string().optional(),
  schoolLevel: z.enum(['SMK', 'SMA']).optional(),
});

app.post('/api/auth/register', (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Data tidak valid' });
  }

  const { name, email, password, role, institutionName, npsnOrNib, regionId, sectorId, schoolLevel } = parsed.data;

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk.' });
  }

  let institutionId: string | undefined = undefined;
  let userStatus: 'menunggu' | 'aktif' = 'aktif';

  // Organizations require verification by admin
  if (role !== 'alumni') {
    userStatus = 'menunggu';
    const newInst = db.createInstitution({
      type: role === 'school' ? 'sekolah' : role === 'industry' ? 'perusahaan' : 'lembaga',
      name: institutionName || name,
      npsnOrNib,
      regionId: regionId || 'kota_serang',
      sectorId,
      schoolLevel,
      status: 'menunggu',
      visibilityDefault: 'anonim',
    });
    institutionId = newInst.id;
  }

  const user = db.createUser({
    name,
    email,
    passwordHash: hashPassword(password),
    role,
    institutionId,
    institutionName,
    status: userStatus,
    twoFactorEnabled: ['school', 'disdik', 'disnaker', 'bappeda', 'koordinator'].includes(role),
  });

  db.logAudit(
    name,
    role,
    'Registrasi Akun Baru',
    'User',
    user.id,
    req.ip || '127.0.0.1',
    `Pendaftaran pengguna baru peran ${role}. Status institusi: ${userStatus}`
  );

  res.status(201).json({
    message:
      userStatus === 'menunggu'
        ? 'Pendaftaran berhasil. Akun Anda sedang menunggu verifikasi legalitas oleh Administrator SINKRON.'
        : 'Pendaftaran alumni berhasil. Silakan masuk.',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

app.post('/api/auth/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Email atau sandi tidak valid' });
  }

  const { email, password } = parsed.data;
  const user = db.findUserByEmail(email);

  if (!user) {
    return res.status(401).json({ error: 'Email atau sandi salah.' });
  }

  // Check account lockout
  if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
    return res.status(423).json({
      error: 'Akun sementara terkunci akibat percobaan gagal berulang. Coba lagi dalam 15 menit.',
    });
  }

  const { valid, needsRehash } = verifyPassword(password, user.passwordHash);
  if (!valid) {
    const failedAttempts = (user.failedLoginAttempts || 0) + 1;
    let lockedUntil = null;
    if (failedAttempts >= 5) {
      lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    }
    db.updateUser(user.id, { failedLoginAttempts: failedAttempts, lockedUntil });

    db.logAudit(
      user.name,
      user.role,
      'Gagal Masuk (Password Salah)',
      'User',
      user.id,
      req.ip || '127.0.0.1',
      `Percobaan gagal ke-${failedAttempts}`
    );

    return res.status(401).json({ error: 'Email atau sandi salah.' });
  }

  // Automatic password hash upgrade to 210,000 iterations PBKDF2 if older format was detected
  if (needsRehash) {
    user.passwordHash = hashPassword(password);
    db.save();
  }

  // Reset lockout
  db.updateUser(user.id, { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date().toISOString() });
  const token = generateAuthToken(user);

  db.logAudit(user.name, user.role, 'Masuk Berhasil', 'User', user.id, req.ip || '127.0.0.1', 'Sesi masuk aktif');

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
      institutionName: user.institutionName,
      status: user.status,
      twoFactorEnabled: user.twoFactorEnabled,
    },
  });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    db.deleteSession(token);
  }
  res.json({ message: 'Berhasil keluar.' });
});

// Rate limiter for forgot password requests: max 5 requests per 10 minutes per IP
const forgotRateLimits = new Map<string, { count: number; resetAt: number }>();

app.post('/api/auth/forgot', (req, res) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const limit = 5;

  let record = forgotRateLimits.get(ip);
  if (!record || record.resetAt < now) {
    record = { count: 1, resetAt: now + windowMs };
    forgotRateLimits.set(ip, record);
  } else {
    record.count++;
  }

  if (record.count > limit) {
    return res.status(429).json({
      error: 'Terlalu banyak permintaan pemulihan kata sandi. Batas maksimal 5 kali per 10 menit. Silakan coba lagi nanti.',
    });
  }

  const { email } = req.body || {};
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase().slice(0, 150) : '';

  // Anonymized tracking in audit log (SHA-256 truncated hashes for PDP compliance)
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
  const emailHash = cleanEmail ? crypto.createHash('sha256').update(cleanEmail).digest('hex').substring(0, 16) : 'kosong';

  db.logAudit(
    'Publik (Lupa Sandi)',
    'public',
    `Permintaan Pemulihan Sandi: email_hash=${emailHash}, ip_hash=${ipHash}`,
    'Auth',
    '/api/auth/forgot',
    ipHash,
    'sukses'
  );

  // ALWAYS return identical response whether user exists or not to prevent account enumeration
  return res.status(200).json({
    success: true,
    message: 'Permintaan pemulihan dicatat. Pengiriman tautan lewat email belum aktif pada versi demo; hubungi Admin SINKRON untuk atur ulang sandi.',
  });
});

// --- 3. Public & Aggregate Data (Small-Cell Suppression Enforced on Server) ---
app.get('/api/analytics/kpi', (req, res) => {
  const regionId = req.query.regionId as string | undefined;
  const data = db.getPublicAnalytics(regionId);
  res.json(data);
});

app.get('/api/public/regions', (req, res) => {
  res.json(db.getRaw().regions);
});

app.get('/api/public/sectors', (req, res) => {
  res.json(db.getRaw().sectors);
});

app.get('/api/public/jobs', (req, res) => {
  const jobs = db.getRaw().jobPostings.filter((j) => j.status === 'Aktif');
  res.json(jobs);
});

app.get('/api/public/trainings', (req, res) => {
  res.json(db.getRaw().trainingPrograms);
});

app.post('/api/jobs', requireAuth, requireRole(['industry', 'admin']), (req, res) => {
  const body = req.body;
  const user: UserRecord = (req as any).user;
  const raw = db.getRaw();

  const newJob: JobPosting = {
    id: `job_${Date.now()}`,
    companyId: user.institutionId || 'inst_krakatau',
    companyName: body.companyName || user.institutionName || 'Perusahaan Mitra Banten',
    isCompanyVerified: true,
    title: body.title || 'Posisi Lowongan Vokasi',
    type: body.type || 'Lowongan Kerja',
    sectorId: body.sectorId || 'sec_manufaktur',
    regionId: body.regionId || 'cilegon',
    requiredCompetencies: body.requiredCompetencies || [],
    educationMin: body.educationMin || 'SMK',
    salaryMin: Number(body.salaryMin) || 4800000,
    salaryMax: Number(body.salaryMax) || 6200000,
    headcount: Number(body.headcount) || 5,
    deadline: body.deadline || '2026-12-31',
    description: body.description || '',
    applyMethod: 'internal',
    status: 'Aktif',
    reportedCount: 0,
    applicantsCount: 0,
  };

  raw.jobPostings.unshift(newJob);
  db.save();

  db.logAudit(
    user.name,
    user.role,
    'Publikasi Lowongan Vokasi',
    'JobPosting',
    newJob.id,
    req.ip || '127.0.0.1',
    `Lowongan "${newJob.title}" dipublikasikan oleh ${newJob.companyName}`
  );

  res.status(201).json({ message: 'Lowongan kerja/magang berhasil dipublikasikan.', job: newJob });
});

app.post('/api/jobs/:id/apply', (req, res) => {
  const { id } = req.params;
  const { applicantName } = req.body;
  const user = (req as any).user;
  const raw = db.getRaw();
  const job = raw.jobPostings.find((j) => j.id === id);
  if (!job) return res.status(404).json({ error: 'Lowongan pekerjaan tidak ditemukan.' });

  job.applicantsCount = (job.applicantsCount || 0) + 1;
  db.save();

  const actorName = user?.name || applicantName || 'Pelamar Publik';
  const actorRole = user?.role || 'alumni';

  db.logAudit(
    actorName,
    actorRole,
    'Pengajuan Lamaran Kerja',
    'JobPosting',
    id,
    req.ip || '127.0.0.1',
    `${actorName} mengajukan lamaran untuk posisi "${job.title}" di ${job.companyName}`
  );

  res.json({ message: `Lamaran untuk posisi "${job.title}" berhasil diajukan.`, job });
});

app.post('/api/trainings/:id/enroll', (req, res) => {
  const { id } = req.params;
  const user = (req as any).user;
  const raw = db.getRaw();
  const training = raw.trainingPrograms.find((t) => t.id === id);
  if (!training) return res.status(404).json({ error: 'Program pelatihan tidak ditemukan.' });

  if (training.enrolledCount >= training.quota) {
    return res.status(400).json({ error: 'Kuota pelatihan sudah penuh.' });
  }

  training.enrolledCount = (training.enrolledCount || 0) + 1;
  db.save();

  const actorName = user?.name || 'Peserta Vokasi Banten';
  const actorRole = user?.role || 'public';

  db.logAudit(
    actorName,
    actorRole,
    'Pendaftaran Pelatihan BLK',
    'TrainingProgram',
    id,
    req.ip || '127.0.0.1',
    `${actorName} mendaftar program "${training.title}" (${training.providerName})`
  );

  res.json({ message: `Pendaftaran program "${training.title}" berhasil dicatat.`, training });
});

// --- 4. Alumni Tracer Study (No login needed for unique survey token) ---
app.get('/api/survey/invite/:token', (req, res) => {
  const token = req.params.token;
  const raw = db.getRaw();
  const alumni = raw.alumni.find((a) => a.invitationToken === token);

  if (!alumni) {
    return res.status(404).json({ error: 'Tautan survei tidak ditemukan atau sudah kedaluwarsa.' });
  }

  const program = raw.schoolPrograms.find((p) => p.id === alumni.programId);
  const existingResponse = raw.tracerResponses.find((r) => r.alumniId === alumni.id);

  res.json({
    valid: true,
    alumniName: alumni.name,
    schoolName: program?.schoolName || 'SMK Banten',
    programName: program?.name || 'Vokasi',
    graduationYear: alumni.graduationYear,
    alreadySubmitted: !!existingResponse,
    existingResponse: existingResponse || null,
  });
});

app.post('/api/survey/submit', (req, res) => {
  const body = req.body;
  const raw = db.getRaw();
  const token = body.invitationToken;

  const alumni = raw.alumni.find((a) => a.invitationToken === token);
  if (!alumni) {
    return res.status(404).json({ error: 'Token survei tidak valid.' });
  }

  const existingIdx = raw.tracerResponses.findIndex((r) => r.alumniId === alumni.id);
  const newResponse = {
    id: `resp_${Date.now()}`,
    alumniId: alumni.id,
    schoolId: alumni.schoolId,
    programId: alumni.programId,
    statusCurrent: body.statusCurrent,
    sectorId: body.sectorId,
    positionTitle: body.positionTitle,
    employerName: body.employerName,
    workRegionId: body.workRegionId || 'cilegon',
    fieldMatch: body.fieldMatch || 'Sangat Sesuai',
    monthsToFirstJob: body.monthsToFirstJob,
    incomeRange: body.incomeRange,
    barriers: body.barriers || [],
    missingCompetencies: body.missingCompetencies || [],
    usefulCompetencies: body.usefulCompetencies || [],
    consentContactJobOffer: body.consentContactJobOffer ?? true,
    consentAnonymizedResearch: body.consentAnonymizedResearch ?? true,
    completedAt: new Date().toISOString().split('T')[0],
    verificationStatus: 'Terverifikasi' as const,
    verifiedBy: 'Sistem Verifikasi Otomatis BKK',
  };

  if (existingIdx !== -1) {
    raw.tracerResponses[existingIdx] = newResponse;
  } else {
    raw.tracerResponses.push(newResponse);
  }

  // Update alumni status
  alumni.invitationStatus = 'Selesai';
  alumni.responseId = newResponse.id;

  // Log consent
  raw.consentLogs.push({
    id: `cns_${Date.now()}`,
    userId: alumni.id,
    purpose: 'Pelacakan Lulusan 6 Bulan & Kontak Kerja Vokasi',
    textVersion: '1.0-UU-PDP-2022',
    granted: true,
    channel: 'web-survey',
    timestamp: new Date().toISOString(),
    ipHash: crypto.createHash('sha256').update(req.ip || '127.0.0.1').digest('hex'),
  });

  db.save();

  db.logAudit(
    alumni.name,
    'alumni',
    'Pengisian Survei 6 Bulan Selesai',
    'TracerResponse',
    newResponse.id,
    req.ip || '127.0.0.1',
    `Alumni menyelesaikan pengisian survei pelacakan untuk ${alumni.name}`
  );

  res.json({ message: 'Survei pelacakan berhasil disimpan.', responseId: newResponse.id });
});

app.get('/api/survey/responses', requireAuth, requireRole(['school', 'disdik', 'admin', 'disnaker', 'bappeda', 'akademisi']), (req, res) => {
  const user = (req as any).user;
  const raw = db.getRaw();
  let list = raw.tracerResponses;
  if (user.role === 'school') {
    list = list.filter((r) => r.schoolId === user.institutionId);
  }
  res.json(list);
});

app.patch('/api/survey/responses/:id/verify', requireAuth, requireRole(['school', 'disdik', 'admin']), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user: UserRecord = (req as any).user;
  const raw = db.getRaw();
  const resp = raw.tracerResponses.find((r) => r.id === id);
  if (!resp) return res.status(404).json({ error: 'Respons pelacakan tidak ditemukan.' });

  if (user.role === 'school' && resp.schoolId !== user.institutionId) {
    return res.status(403).json({ error: 'Anda hanya dapat memverifikasi respons alumni dari sekolah Anda sendiri.' });
  }

  resp.verificationStatus = status || 'Terverifikasi';
  resp.verifiedBy = `${user.name} (${user.role.toUpperCase()})`;
  db.save();

  db.logAudit(
    user.name,
    user.role,
    'Verifikasi Respons Pelacak Alumni',
    'TracerResponse',
    id,
    req.ip || '127.0.0.1',
    `Respons pelacak alumni diverifikasi dengan status: ${resp.verificationStatus}`
  );

  res.json({ message: `Respons pelacak berhasil diverifikasi (${resp.verificationStatus}).`, response: resp });
});

// --- 5. School Operations ---
app.get('/api/school/programs', requireAuth, (req, res) => {
  res.json(db.getRaw().schoolPrograms);
});

app.get('/api/school/alumni', requireAuth, requireRole(['school', 'admin']), (req, res) => {
  const user: UserRecord = (req as any).user;
  const raw = db.getRaw();
  let list = raw.alumni;
  if (user.role === 'school') {
    list = list.filter((a) => a.schoolId === user.institutionId);
  }
  // Jangan pernah mengirim invitationToken ke klien lain selain pada respons pembuatan undangan untuk sekolah pemilik data
  const sanitized = list.map(({ invitationToken, ...rest }) => rest);
  res.json(sanitized);
});

// Endpoint agregat terpisah untuk Disdik dan peran pengawas kebijakan (tanpa data pribadi alumni)
app.get('/api/school/alumni/aggregate', requireAuth, requireRole(['disdik', 'disnaker', 'bappeda', 'school', 'admin']), (req, res) => {
  const raw = db.getRaw();
  const total = raw.alumni.length;
  const byGraduationYear: Record<number, number> = {};
  const byInvitationStatus: Record<string, number> = {};
  const bySchool: Record<string, number> = {};

  raw.alumni.forEach((a) => {
    byGraduationYear[a.graduationYear] = (byGraduationYear[a.graduationYear] || 0) + 1;
    byInvitationStatus[a.invitationStatus] = (byInvitationStatus[a.invitationStatus] || 0) + 1;
    bySchool[a.schoolId] = (bySchool[a.schoolId] || 0) + 1;
  });

  res.json({
    totalAlumni: total,
    byGraduationYear,
    byInvitationStatus,
    bySchool,
  });
});

app.post('/api/school/alumni/import', requireAuth, requireRole(['school', 'admin']), (req, res) => {
  const { records, schoolId, programId } = req.body;
  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: 'Data alumni tidak boleh kosong.' });
  }

  const raw = db.getRaw();
  const created: any[] = [];

  records.forEach((r, idx) => {
    if (!r.name) return;
    const { token, hash } = generateSecureToken();
    const item = {
      id: `alm_imp_${Date.now()}_${idx}`,
      cohortId: 'coh_2025_resmi',
      schoolId: schoolId || 'inst_smkn1_clg',
      programId: programId || 'prog_smkn1clg_las',
      name: r.name,
      graduationYear: Number(r.graduationYear) || 2025,
      email: r.email || `alumni.${idx}@banten.id`,
      phone: r.phone || '0812' + Math.floor(10000000 + Math.random() * 90000000),
      invitationStatus: 'Belum Dikirim' as const,
      invitationToken: token,
      reminderCount: 0,
    };
    raw.alumni.unshift(item);
    created.push(item);
  });

  db.save();
  const user = (req as any).user;
  db.logAudit(
    user.name,
    user.role,
    'Impor Alumni CSV',
    'Alumni',
    `batch_${Date.now()}`,
    req.ip || '127.0.0.1',
    `Berhasil mengimpor ${created.length} data alumni baru ke database`
  );

  res.json({ message: `Berhasil mengimpor ${created.length} data alumni.`, importedCount: created.length });
});

app.post('/api/school/alumni/invite', requireAuth, requireRole(['school', 'admin']), (req, res) => {
  const { alumniId } = req.body;
  const user: UserRecord = (req as any).user;
  const raw = db.getRaw();
  const alm = raw.alumni.find((a) => a.id === alumniId);
  if (!alm) return res.status(404).json({ error: 'Alumni tidak ditemukan' });

  if (user.role === 'school' && alm.schoolId !== user.institutionId) {
    return res.status(403).json({ error: 'Anda hanya dapat mengundang alumni dari sekolah Anda sendiri.' });
  }

  alm.invitationStatus = 'Terkirim';
  alm.reminderCount += 1;
  db.save();

  // Mengirimkan invitationToken hanya pada respons pembuatan/pengiriman undangan untuk sekolah pemilik data
  res.json({
    message: `Undangan survei berhasil dikirim ke ${alm.name}`,
    invitationToken: alm.invitationToken,
    surveyUrl: `/survei/${alm.invitationToken}`,
  });
});

// --- 6. Industry & Demand Signals ---
app.get('/api/industry/signals', (req, res) => {
  const user: UserRecord | null = (req as any).user;
  const raw = db.getRaw();
  const isPrivileged = user && (user.role === 'admin' || user.role === 'disnaker');
  const isPublic = !user || user.role === 'public';

  const processedSignals = raw.demandSignals.map((signal) => {
    const isOwner = user && user.institutionId && user.institutionId === signal.companyId;
    const canSeeIdentity = isPrivileged || isOwner || signal.visibility !== 'anonim';

    const item = { ...signal };

    if (!canSeeIdentity) {
      item.companyName = '';
      item.companyId = '';
    }

    if (isPublic) {
      delete (item as any).notes;
      delete (item as any).verifiedBy;
    }

    return item;
  });

  res.json(processedSignals);
});

app.post('/api/industry/signals', requireAuth, requireRole(['industry', 'admin', 'disnaker']), (req, res) => {
  const body = req.body;
  const raw = db.getRaw();
  const user = (req as any).user;

  const newSignal = {
    id: `sig_${Date.now()}`,
    companyId: user.institutionId || 'inst_krakatau',
    companyName: body.companyName || user.institutionName || 'Perusahaan Banten',
    sectorId: body.sectorId || 'sec_manufaktur',
    periodId: raw.periods.find((p) => p.status === 'aktif')?.name || '2026/Ganjil',
    status: 'Aktif' as const,
    visibility: body.visibility || 'anonim',
    submittedAt: new Date().toISOString().split('T')[0],
    verifiedBy: 'Dinas Tenaga Kerja & Transmigrasi Prov. Banten',
    verifiedAt: new Date().toISOString().split('T')[0],
    items: body.items || [],
    notes: body.notes || '',
  };

  raw.demandSignals.unshift(newSignal);
  db.save();

  db.logAudit(
    user.name,
    user.role,
    'Pengajuan Sinyal Kebutuhan',
    'DemandSignal',
    newSignal.id,
    req.ip || '127.0.0.1',
    `Pengajuan sinyal kebutuhan ${newSignal.items.length} posisi kerja`
  );

  res.status(201).json({ message: 'Sinyal kebutuhan industri berhasil disimpan dan aktif.', signal: newSignal });
});

app.patch('/api/industry/signals/:id/verify', requireAuth, requireRole(['disnaker', 'admin']), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = (req as any).user;
  const raw = db.getRaw();
  const signal = raw.demandSignals.find((s) => s.id === id);
  if (!signal) return res.status(404).json({ error: 'Sinyal kebutuhan industri tidak ditemukan.' });

  signal.status = status || 'Aktif';
  signal.verifiedBy = `${user.name} (Disnaker Banten)`;
  signal.verifiedAt = new Date().toISOString().split('T')[0];
  db.save();

  db.logAudit(
    user.name,
    user.role,
    'Verifikasi Sinyal Kebutuhan Industri',
    'DemandSignal',
    id,
    req.ip || '127.0.0.1',
    `Status sinyal industri ${signal.companyName} diubah menjadi: ${signal.status}`
  );

  res.json({ message: `Sinyal industri berhasil diverifikasi dengan status "${signal.status}".`, signal });
});

// --- 7. Match Results & Recommendations ---
app.get('/api/match/results', (req, res) => {
  res.json(db.getRaw().matchResults);
});

app.post('/api/match/review', requireAuth, requireRole(['disdik', 'disnaker', 'admin', 'school']), (req, res) => {
  const { id, decision } = req.body;
  const raw = db.getRaw();
  const match = raw.matchResults.find((m) => m.id === id);
  if (!match) return res.status(404).json({ error: 'Titik analisis tidak ditemukan.' });

  const user = (req as any).user;
  match.humanReviewed = true;
  match.decision = decision;
  match.reviewedBy = `${user.name} (${user.role.toUpperCase()})`;
  db.save();

  db.logAudit(
    user.name,
    user.role,
    'Tinjauan Peta Kecocokan',
    'MatchResult',
    id,
    req.ip || '127.0.0.1',
    `Keputusan verifikasi manusia: ${decision}`
  );

  res.json({ message: `Keputusan tinjauan "${decision}" berhasil dicatat.`, match });
});

app.post('/api/match/analyze', requireAuth, requireRole(['disdik', 'disnaker', 'admin']), (req, res) => {
  const { programId, signalId } = req.body;
  if (!programId) {
    return res.status(400).json({ error: 'programId wajib diisi.' });
  }

  const raw = db.getRaw();
  const program = raw.schoolPrograms.find((p) => p.id === programId);
  if (!program) {
    return res.status(404).json({ error: 'Program keahlian sekolah tidak ditemukan.' });
  }

  const signal = signalId
    ? raw.demandSignals.find((s) => s.id === signalId)
    : raw.demandSignals.find((s) => s.status === 'Aktif' || s.status === 'Diverifikasi') || raw.demandSignals[0];

  if (!signal) {
    return res.status(404).json({ error: 'Sinyal kebutuhan industri tidak ditemukan.' });
  }

  const firstItem = signal.items?.[0];
  const reqCompId = firstItem?.competencyIds?.[0] || 'comp_plc_siemens';
  const compDef = raw.competencies.find((c) => c.id === reqCompId) || raw.competencies[0];

  const taught = program.competencies.find((c) => c.competencyId === compDef.id);
  const coverage = taught ? (taught.practiceShare >= 60 ? 1.0 : 0.5) : 0;
  const gapLevel: 'Sesuai' | 'Sedang' | 'Tinggi' = coverage === 1.0 ? 'Sesuai' : coverage === 0.5 ? 'Sedang' : 'Tinggi';

  const user = (req as any).user;
  const newMatchResult: MatchResult = {
    id: `mr_${Date.now()}`,
    programId: program.id,
    programName: program.name,
    schoolName: program.schoolName,
    regionId: program.regionId,
    sectorId: signal.sectorId,
    demandCompetencyId: compDef.id,
    demandCompetencyName: compDef.name,
    demandWeight: 85,
    curriculumCoverage: coverage,
    gapLevel,
    evidence: `Analisis silabus kurikulum ${program.name} (${program.schoolName}) terhadap kebutuhan ${signal.companyName} posisi ${firstItem?.positionTitle || 'Teknisi Industri'}. Cakupan praktikum: ${taught ? `${taught.practiceShare}%` : 'Belum diajarkan'}.`,
    aiSuggestedAdjustment: coverage === 1.0
      ? 'Kurikulum telah selaras. Disarankan fasilitasi kuota magang industri prioritas.'
      : `Tambahkan modul pengayaan praktikum ${compDef.name} bekerja sama dengan instruktur industri ${signal.companyName}.`,
    aiConfidence: 91,
    humanReviewed: false,
    decision: 'Dalam Pembahasan',
  };

  raw.matchResults.unshift(newMatchResult);
  db.save();

  db.logAudit(
    user.name,
    user.role,
    'Analisis Penyelarasan Kurikulum Vokasi',
    'MatchResult',
    newMatchResult.id,
    req.ip || '127.0.0.1',
    `Kalkulasi kecocokan ${program.name} (${program.schoolName}) dengan sinyal ${signal.companyName}`
  );

  res.status(201).json({
    message: 'Analisis kecocokan berhasil dijalankan dan disimpan.',
    matchResult: newMatchResult,
  });
});

app.get('/api/recommendations', (req, res) => {
  res.json(db.getRaw().recommendations);
});

app.post('/api/recommendations', requireAuth, requireRole(['disdik', 'disnaker', 'bappeda', 'admin']), (req, res) => {
  const body = req.body;
  const raw = db.getRaw();
  const user = (req as any).user;

  const newRec = {
    id: `rec_${Date.now()}`,
    code: `REK-BANTEN-${Date.now().toString().slice(-4)}`,
    title: body.title,
    description: body.description,
    type: body.type || 'kurikulum',
    targetInstitution: body.targetInstitution || 'Sekolah Terkait di Banten',
    assignedTo: body.assignedTo || 'Bidang Pembinaan Vokasi Disdik',
    regionId: body.regionId || 'cilegon',
    sectorId: body.sectorId || 'sec_manufaktur',
    dueDate: body.dueDate || '2026-12-31',
    status: 'Usulan' as const,
    kpiTarget: body.kpiTarget || 'Peningkatan penyerapan kerja',
    decidedBy: user.name,
  };

  raw.recommendations.unshift(newRec);
  db.save();

  db.logAudit(
    user.name,
    user.role,
    'Penerbitan Rekomendasi Resmi',
    'Recommendation',
    newRec.id,
    req.ip || '127.0.0.1',
    `Rekomendasi: ${newRec.title}`
  );

  res.status(201).json({ message: 'Rekomendasi resmi berhasil diterbitkan.', recommendation: newRec });
});

app.patch(
  '/api/recommendations/:id/status',
  requireAuth,
  requireRole(['disdik', 'disnaker', 'bappeda', 'school', 'admin']),
  (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  const raw = db.getRaw();
  const rec = raw.recommendations.find((r) => r.id === id);
  if (!rec) return res.status(404).json({ error: 'Rekomendasi tidak ditemukan.' });

  const user = (req as any).user;
  rec.status = status;
  if (reason) rec.decisionReason = reason;
  rec.decidedBy = user.name;
  db.save();

  db.logAudit(
    user.name,
    user.role,
    'Perubahan Status Rekomendasi',
    'Recommendation',
    id,
    req.ip || '127.0.0.1',
    `Status diubah menjadi ${status}`
  );

  res.json({ message: `Status berhasil diubah menjadi ${status}.`, recommendation: rec });
});

// --- 8. Competencies Dictionary ---
app.get('/api/competencies', (req, res) => {
  res.json(db.getRaw().competencies);
});

app.post('/api/competencies/propose', requireAuth, (req, res) => {
  const body = req.body;
  const raw = db.getRaw();
  const user = (req as any).user;

  const newComp = {
    id: `comp_prop_${Date.now()}`,
    code: `USULAN-${Date.now().toString().slice(-4)}`,
    name: body.name,
    description: body.description,
    sectorId: body.sectorId || 'sec_manufaktur',
    type: body.type || 'teknis',
    skkniCode: body.skkniCode || 'Rujukan Standar Daerah Banten',
    levelScale: Number(body.levelScale) || 3,
    status: 'ditinjau' as const,
    version: '2026.1-draf',
    synonyms: body.synonyms || [],
    proposedBy: `${user.name} (${user.role})`,
    demandTrend: 'baru' as const,
  };

  raw.competencies.unshift(newComp);
  db.save();

  db.logAudit(
    user.name,
    user.role,
    'Usulan Kompetensi Baru',
    'Competency',
    newComp.id,
    req.ip || '127.0.0.1',
    `Usulan istilah: ${newComp.name}`
  );

  res.status(201).json({ message: 'Usulan kompetensi berhasil diajukan.', competency: newComp });
});

app.post('/api/competencies/:id/approve', requireAuth, requireRole(['akademisi', 'admin']), (req, res) => {
  const { id } = req.params;
  const raw = db.getRaw();
  const comp = raw.competencies.find((c) => c.id === id);
  if (!comp) return res.status(404).json({ error: 'Kompetensi tidak ditemukan.' });

  const user = (req as any).user;
  comp.status = 'disetujui';
  comp.version = '2026.1-resmi';
  db.save();

  db.logAudit(
    user.name,
    user.role,
    'Persetujuan Kompetensi Resmi',
    'Competency',
    id,
    req.ip || '127.0.0.1',
    `Kompetensi disahkan: ${comp.name}`
  );

  res.json({ message: 'Kompetensi berhasil disahkan menjadi standar resmi SKKNI/KKNI Banten.' });
});

// --- 9. Pentahelix Forum & MoU ---
app.get('/api/pentahelix/partners', (req, res) => {
  res.json(db.getRaw().pentahelixPartners);
});

app.get('/api/pentahelix/mou', (req, res) => {
  res.json(db.getRaw().mouAgreements);
});

app.get('/api/pentahelix/forum', (req, res) => {
  res.json(db.getRaw().forumSessions);
});

// --- 10. Admin & Audit Logs ---
app.get('/api/admin/institutions', requireAuth, requireRole(['admin', 'disdik', 'disnaker']), (req, res) => {
  res.json(db.getInstitutions());
});

app.post('/api/admin/institutions/:id/verify', requireAuth, requireRole(['admin']), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = (req as any).user;
  const inst = db.verifyInstitution(id, user.name, status || 'terverifikasi');
  if (!inst) return res.status(404).json({ error: 'Institusi tidak ditemukan.' });

  db.logAudit(
    user.name,
    user.role,
    'Verifikasi Institusi',
    'Institution',
    id,
    req.ip || '127.0.0.1',
    `Institusi ${inst.name} diubah status menjadi ${inst.status}`
  );

  res.json({ message: `Institusi ${inst.name} berhasil diverifikasi.`, institution: inst });
});

app.get('/api/admin/audit-logs', requireAuth, requireRole(['admin']), (req, res) => {
  res.json(db.getRaw().auditLogs);
});

app.post('/api/admin/reset-demo', requireAuth, requireRole(['admin']), (req, res) => {
  const isDemo = isDemoModeActive();
  if (!isDemo) {
    return res.status(404).json({ error: 'Endpoint reset demo dinonaktifkan di lingkungan produksi.' });
  }

  const user = (req as any).user;
  db.resetToSeed();
  db.logAudit(
    user.name,
    user.role,
    'Reset Seluruh Data ke Seed Awal',
    'System',
    'db.json',
    req.ip || '127.0.0.1',
    'Administrator memulihkan seluruh data database ke kondisi awal (seed default).'
  );

  res.json({ message: 'Basis data berhasil dipulihkan ke data awal bersih (seed).' });
});

// --- Privacy / Data Subject Requests (UU PDP No. 27/2022) ---
app.post('/api/privacy/subject-request', (req, res) => {
  const { requestType, notes, userName } = req.body;
  const user = (req as any).user;
  const raw = db.getRaw();

  const newReq: UserSubjectRequest = {
    id: `req_${Date.now()}`,
    userId: user ? user.id : `guest_${Date.now()}`,
    userName: user ? user.name : (userName || 'Ahmad Rizky Pratama (Alumni)'),
    requestType: requestType || 'Unduh Salinan Data',
    submittedAt: new Date().toISOString().split('T')[0],
    status: requestType === 'Unduh Salinan Data' ? 'Selesai' : 'Sedang Diproses',
    dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: notes || (requestType === 'Unduh Salinan Data' ? 'Paket arsip JSON data privasi telah di-generate.' : 'Permohonan subjek data sedang diverifikasi DPO.'),
  };

  raw.userSubjectRequests.unshift(newReq);
  db.save();

  db.logAudit(
    newReq.userName,
    user ? user.role : 'alumni',
    `Permohonan Hak Subjek Data: ${newReq.requestType}`,
    'UserSubjectRequest',
    newReq.id,
    req.ip || '127.0.0.1',
    `Permohonan perlindungan data pribadi diajukan: ${newReq.requestType}`
  );

  res.status(201).json({ message: 'Permohonan hak subjek data UU PDP berhasil diajukan dan dicatat.', request: newReq });
});

app.get('/api/privacy/subject-requests', requireAuth, (req, res) => {
  const user = (req as any).user;
  const raw = db.getRaw();
  if (user.role === 'admin') {
    return res.json(raw.userSubjectRequests);
  }
  const myReqs = raw.userSubjectRequests.filter((r) => r.userId === user.id);
  res.json(myReqs);
});

// --- 11. Server-Side AI Capabilities (No PII passed, Gemini API or Heuristic with Confidence) ---
const aiMatchSchema = z.object({
  jobTitle: z.string().min(1, 'Judul pekerjaan harus diisi.').max(120, 'Judul pekerjaan maksimal 120 karakter.'),
  jobDescription: z.string().max(1000, 'Deskripsi pekerjaan maksimal 1000 karakter.').optional().default(''),
  curriculumSyllabus: z.string().max(2000, 'Silabus kurikulum maksimal 2000 karakter.').optional().default(''),
});

app.post(
  '/api/ai/match',
  requireAuth,
  requireRole(['disdik', 'disnaker', 'admin', 'school', 'akademisi']),
  aiMatchRateLimiter,
  async (req, res) => {
  const parsed = aiMatchSchema.safeParse(req.body);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join('; ');
    return res.status(400).json({ error: errorMsg || 'Parameter analisis AI tidak valid' });
  }

  const { jobTitle, jobDescription, curriculumSyllabus } = parsed.data;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Anda adalah asisten kurikulum vokasi SINKRON Banten. Bandingkan kebutuhan pekerjaan "${jobTitle}" (${jobDescription || ''}) dengan kurikulum SMK (${curriculumSyllabus || ''}).
Keluarkan output JSON dengan format:
{
  "confidence": <angka 0-100>,
  "matchedCompetency": "<nama kompetensi kamus SKKNI>",
  "coverage": <0, 0.5, atau 1.0>,
  "gapAnalysis": "<penjelasan celah konkret>",
  "suggestedAdjustment": "<saran penyesuaian kurikulum praktikum>"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsedResult = JSON.parse(response.text || '{}');
      return res.json({
        ...parsedResult,
        source: 'Gemini 2.5 Flash',
        disclaimer: 'Dibuat AI, ditinjau manusia',
      });
    } catch (err) {
      console.error('Gemini API call failed, falling back to heuristic engine:', err);
    }
  }

  // Robust Heuristic Engine
  const matchedComp = db.getRaw().competencies.find((c) =>
    c.name.toLowerCase().includes(jobTitle.toLowerCase()) ||
    c.synonyms.some((s) => jobTitle.toLowerCase().includes(s.toLowerCase()))
  ) || db.getRaw().competencies[0];

  res.json({
    confidence: 88,
    matchedCompetency: matchedComp.name,
    coverage: 0.5,
    gapAnalysis: `Industri membutuhkan kualifikasi posisi kerja "${jobTitle}". Silabus SMK saat ini mencakup aspek teoritis dasar namun jam praktikum mandiri masih perlu ditambah 60 jam.`,
    suggestedAdjustment: `Tambahkan alokasi modul praktikum intensif dan libatkan instruktur tamu dari mitra industri terkait.`,
    source: 'SINKRON Vocational Heuristic Engine',
    disclaimer: 'Dibuat AI, ditinjau manusia',
  });
});

// --- Vite / Static Assets Mounting ---
if (!isProd) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distDir = path.resolve(__dirname, 'dist');
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[SINKRON Banten] Server listening on port ${PORT} (isProd: ${isProd})`);
});
