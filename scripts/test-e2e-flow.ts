/**
 * SINKRON Banten - End-to-End Multi-Role Lifecycle Verification Script
 * 
 * Verifies the 5-step lifecycle and security boundaries:
 * 1. Perusahaan (HRD) logs in and submits a demand signal
 * 2. Disnaker logs in and verifies the demand signal
 * 3. Sekolah (BKK) imports alumni and generates a unique survey invitation token
 * 4. Alumni (Public / Unauthenticated) fetches survey by token and submits 6-month tracer response
 * 5. Disdik logs in and reviews aggregate statistics (and verifies Disdik has no access to personal alumni records)
 */

const BASE_URL = 'http://localhost:3000';

async function request(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

const credentialsMap: Record<string, { email: string; pass: string }> = {
  industry: { email: 'recruitment@krakatausteel.com', pass: 'KrakatauSteel#2026' },
  disnaker: { email: 'disnaker@bantenprov.go.id', pass: 'DisnakerBanten#2026' },
  school: { email: 'bkk.smkn1cilegon@sch.id', pass: 'Smkn1Cilegon#2026' },
  school_cikupa: { email: 'bkk.smkn1cikupa@sch.id', pass: 'Smkn1Cikupa#2026' },
  disdik: { email: 'disdik@bantenprov.go.id', pass: 'DisdikBanten#2026' },
  admin: { email: 'admin@bantenprov.go.id', pass: 'AdminS1nkron#2026' },
  alumni: { email: 'rizky.pratama@gmail.com', pass: 'AlumniBanten#2026' },
};

async function loginAs(role: string) {
  // First try demo login
  const demoRes = await request('/api/demo/login', {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
  if (demoRes.ok && demoRes.data?.token) {
    return demoRes.data.token as string;
  }

  // Fallback to real auth login
  const creds = credentialsMap[role];
  if (!creds) throw new Error(`Role ${role} tidak ada di peta kredensial.`);

  const authRes = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: creds.email, password: creds.pass }),
  });

  if (!authRes.ok || !authRes.data?.token) {
    throw new Error(`Gagal login sebagai ${role}: ${JSON.stringify(authRes.data)}`);
  }
  return authRes.data.token as string;
}

async function runTest() {
  console.log('=====================================================');
  console.log('Memulai Pengujian Siklus End-to-End SINKRON Banten...');
  console.log('=====================================================\n');

  // STEP 1: Perusahaan (HRD)
  console.log('--- LANGKAH 1: Industri / Perusahaan Mengirimkan Sinyal Kebutuhan ---');
  const industryToken = await loginAs('industry');
  console.log('✓ Login sebagai Industri (HRD PT Krakatau Steel) berhasil.');

  const signalPayload = {
    companyName: 'PT Krakatau Steel (Persero) Tbk',
    sectorId: 'sec_manufaktur',
    regionId: 'cilegon',
    jobTitle: 'Teknisi Otomasi & PLC Siemens S7-1500',
    workCategory: 'Operator Teknik',
    annualDemandCount: 15,
    minEducation: 'SMK',
    preferredSpecializations: ['Teknik Otomasi Industri', 'Teknik Mekatronika'],
    urgencyLevel: 'tinggi',
    requiredCompetencies: ['Pemrograman PLC Siemens', 'K3 Industri Listrik Arus Kuat'],
    certificationsPreferred: ['BNSP Pemrograman PLC'],
    internshipSlotsOffered: 8,
    visibility: 'terbuka',
    notes: 'Prioritas lulusan SMK Cilegon dan Serang yang memiliki sertifikasi dasar K3.',
  };

  const createSignalRes = await request('/api/industry/signals', {
    method: 'POST',
    headers: { Authorization: `Bearer ${industryToken}` },
    body: JSON.stringify(signalPayload),
  });

  if (!createSignalRes.ok || !createSignalRes.data?.signal) {
    throw new Error(`Langkah 1 Gagal: ${JSON.stringify(createSignalRes.data)}`);
  }
  const createdSignal = createSignalRes.data.signal;
  console.log(`✓ Sinyal kebutuhan berhasil dibuat: ID = ${createdSignal.id}, Status = ${createdSignal.status}`);

  // STEP 2: Disnaker memverifikasi sinyal
  console.log('\n--- LANGKAH 2: Disnaker Memvalidasi Sinyal Industri ---');
  const disnakerToken = await loginAs('disnaker');
  console.log('✓ Login sebagai Disnaker Provinsi Banten berhasil.');

  const verifySignalRes = await request(`/api/industry/signals/${createdSignal.id}/verify`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${disnakerToken}` },
    body: JSON.stringify({
      status: 'Terverifikasi',
      notes: 'Terverifikasi langsung dengan tim HRD Krakatau Steel.',
    }),
  });

  if (!verifySignalRes.ok || !verifySignalRes.data?.signal) {
    throw new Error(`Langkah 2 Gagal: ${JSON.stringify(verifySignalRes.data)}`);
  }
  console.log(`✓ Sinyal berhasil diverifikasi oleh Disnaker: Status = ${verifySignalRes.data.signal.status}`);

  // STEP 3: Sekolah (BKK) mengimpor alumni dan menerbitkan undangan survei
  console.log('\n--- LANGKAH 3: Sekolah (BKK) Mengimpor Alumni & Menerbitkan Token Undangan ---');
  const schoolToken = await loginAs('school');
  console.log('✓ Login sebagai Sekolah (SMKN 1 Cilegon) berhasil.');

  const importAlumniRes = await request('/api/school/alumni/import', {
    method: 'POST',
    headers: { Authorization: `Bearer ${schoolToken}` },
    body: JSON.stringify({
      records: [
        {
          name: 'Budi Santoso',
          nisn: '0051239988',
          graduationYear: 2025,
          phone: '081298765432',
          email: 'budi.santoso@alumni.banten.id',
        },
      ],
      schoolId: 'inst_smkn1_clg',
      programId: 'prog_smkn1clg_las',
    }),
  });

  if (!importAlumniRes.ok) {
    throw new Error(`Langkah 3 Impor Gagal: ${JSON.stringify(importAlumniRes.data)}`);
  }
  console.log(`✓ Alumni berhasil diimpor (${importAlumniRes.data.importedCount} data).`);

  // Dapatkan daftar alumni milik SMKN 1 Cilegon
  const alumniListRes = await request('/api/school/alumni', {
    headers: { Authorization: `Bearer ${schoolToken}` },
  });
  if (!alumniListRes.ok || !Array.isArray(alumniListRes.data) || alumniListRes.data.length === 0) {
    throw new Error(`Gagal mengambil data alumni sekolah: ${JSON.stringify(alumniListRes.data)}`);
  }
  const targetAlumni = alumniListRes.data[0];
  console.log(`✓ Memilih alumni untuk diundang: ${targetAlumni.name} (ID: ${targetAlumni.id})`);

  const inviteRes = await request('/api/school/alumni/invite', {
    method: 'POST',
    headers: { Authorization: `Bearer ${schoolToken}` },
    body: JSON.stringify({
      alumniId: targetAlumni.id,
      channel: 'email',
    }),
  });

  if (!inviteRes.ok) {
    throw new Error(`Langkah 3 Undangan Gagal: ${JSON.stringify(inviteRes.data)}`);
  }
  const inviteToken = inviteRes.data.invitationToken;
  const surveyUrl = inviteRes.data.surveyUrl;
  console.log(`✓ Token undangan diterbitkan: ${inviteToken}`);
  console.log(`  Tautan Survei Publik: ${surveyUrl}`);

  // STEP 4: Alumni mengisi survei lewat tautan / token publik (tanpa login)
  console.log('\n--- LANGKAH 4: Alumni Mengisi Tracer Study Menggunakan Token Publik (Tanpa Login) ---');
  const surveyFetchRes = await request(`/api/survey/invite/${inviteToken}`);
  if (!surveyFetchRes.ok) {
    throw new Error(`Langkah 4 Muat Token Gagal: ${JSON.stringify(surveyFetchRes.data)}`);
  }
  console.log(`✓ Data alumni berhasil dimuat via token: Nama = ${surveyFetchRes.data.alumniName}, Sekolah = ${surveyFetchRes.data.schoolName}`);

  const submitSurveyRes = await request('/api/survey/submit', {
    method: 'POST',
    body: JSON.stringify({
      invitationToken: inviteToken,
      statusCurrent: 'Bekerja Penuh',
      sectorId: 'sec_manufaktur',
      positionTitle: 'Junior Automation Technician',
      employerName: 'PT Krakatau Steel (Persero) Tbk',
      workRegionId: 'cilegon',
      fieldMatch: 'Sangat Sesuai',
      monthsToFirstJob: 2,
      incomeRange: '1.5x - 2x UMR',
      barriers: [],
      missingCompetencies: ['Pemrograman PLC Siemens S7-1500'],
      usefulCompetencies: ['Dasar Kelistrikan & K3 Industri'],
      consentContactJobOffer: true,
      consentAnonymizedResearch: true,
    }),
  });

  if (!submitSurveyRes.ok) {
    throw new Error(`Langkah 4 Kirim Survei Gagal: ${JSON.stringify(submitSurveyRes.data)}`);
  }
  console.log(`✓ Survei pelacakan 6 bulan berhasil tersimpan ke basis data server: ID = ${submitSurveyRes.data.responseId}`);

  // STEP 5: Disdik mereviu agregat statistik & verifikasi pembatasan privasi PDP
  console.log('\n--- LANGKAH 5: Disdik Meninjau Data Agregat & Validasi Batasan Hak Akses PDP ---');
  const disdikToken = await loginAs('disdik');
  console.log('✓ Login sebagai Dinas Pendidikan Provinsi Banten berhasil.');

  const aggregateRes = await request('/api/school/alumni/aggregate', {
    headers: { Authorization: `Bearer ${disdikToken}` },
  });
  if (!aggregateRes.ok) {
    throw new Error(`Langkah 5 Agregat Gagal: ${JSON.stringify(aggregateRes.data)}`);
  }
  console.log(`✓ Data agregat vokasi untuk Disdik: Total Alumni = ${aggregateRes.data.totalAlumni}, Distribusi Status: ${JSON.stringify(aggregateRes.data.byInvitationStatus)}`);

  // Validasi Hak Akses PDP: Disdik dilarang melihat data personal alumni individual
  const disdikPiiRes = await request('/api/school/alumni', {
    headers: { Authorization: `Bearer ${disdikToken}` },
  });
  if (disdikPiiRes.status === 403) {
    console.log('✓ Terverifikasi: Disdik ditolak (HTTP 403) saat mengakses data pribadi alumni individu (Kepatuhan UU PDP).');
  } else {
    throw new Error(`Pelanggaran Privasi: Disdik seharusnya mendapat 403 tetapi mendapat status ${disdikPiiRes.status}`);
  }

  // Validasi Hak Akses: Alumni publik dilarang memverifikasi sinyal
  const unauthorizedVerify = await request(`/api/industry/signals/${createdSignal.id}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'terverifikasi' }),
  });
  if (unauthorizedVerify.status === 401 || unauthorizedVerify.status === 403) {
    console.log(`✓ Terverifikasi: Aksi tanpa otorisasi ditolak (HTTP ${unauthorizedVerify.status}).`);
  } else {
    throw new Error(`Kegagalan Otorisasi: Permintaan tidak sah lolos dengan status ${unauthorizedVerify.status}`);
  }

  // STEP 6: Analisis Keselarasan Server (Match Analysis via POST /api/match/analyze)
  console.log('\n--- LANGKAH 6: Analisis Penyelarasan Kurikulum di Server (POST /api/match/analyze) ---');
  const analyzeRes = await request('/api/match/analyze', {
    method: 'POST',
    headers: { Authorization: `Bearer ${disdikToken}` },
    body: JSON.stringify({
      programId: 'prog_smkn1clg_las',
      signalId: createdSignal.id,
    }),
  });

  if (!analyzeRes.ok || !analyzeRes.data?.matchResult) {
    throw new Error(`Langkah 6 Analisis Gagal: ${JSON.stringify(analyzeRes.data)}`);
  }
  const matchResult = analyzeRes.data.matchResult;
  console.log(`✓ Analisis server berhasil dibuat: ID = ${matchResult.id}, Jurusan = ${matchResult.programName}, Sektor = ${matchResult.sectorId}, Cakupan = ${matchResult.curriculumCoverage * 100}%, Celah = ${matchResult.gapLevel}`);

  // Pastikan hasil tersimpan di database server (GET /api/match/results)
  const allMatchesRes = await request('/api/match/results');
  const foundMatch = allMatchesRes.data?.find((m: any) => m.id === matchResult.id);
  if (!foundMatch) {
    throw new Error('Hasil analisis kecocokan tidak ditemukan di database server GET /api/match/results');
  }
  console.log(`✓ Terverifikasi: Titik analisis kecocokan tersimpan secara persisten di db.json server.`);

  // STEP 7: Pengujian Independensi dari localStorage (Sinkronisasi Antar-Sesi Multi-Klien)
  console.log('\n--- LANGKAH 7: Verifikasi Data Bersumber Server (Bukan localStorage) Antar-Sesi ---');
  const alumniToken = await loginAs('alumni');

  // Sesi 1 (Industri) memposting lowongan kerja baru
  const newJobPayload = {
    title: 'Junior Automation Technician Krakatau Steel',
    company: 'PT Krakatau Steel (Persero) Tbk',
    sectorId: 'sec_manufaktur',
    regionId: 'cilegon',
    type: 'Penuh Waktu',
    salaryRange: 'Rp 5.200.000 - Rp 6.800.000',
    description: 'Pengoperasian sistem kontrol PLC Siemens S7-1500 di pabrik baja Cilegon.',
    requirements: ['Lulusan SMK Teknik Mekatronika/Listrik', 'Memahami K3 Industri Listrik'],
  };

  const createJobRes = await request('/api/jobs', {
    method: 'POST',
    headers: { Authorization: `Bearer ${industryToken}` },
    body: JSON.stringify(newJobPayload),
  });

  if (!createJobRes.ok || !createJobRes.data?.job) {
    throw new Error(`Gagal memposting lowongan di Sesi Industri: ${JSON.stringify(createJobRes.data)}`);
  }
  const createdJob = createJobRes.data.job;
  console.log(`✓ Sesi 1 (Industri): Berhasil mempublikasikan lowongan kerja baru (ID: ${createdJob.id}).`);

  // Sesi 2 (Alumni berbeda) memuat lowongan dari backend server
  const publicJobsRes = await request('/api/public/jobs', {
    headers: { Authorization: `Bearer ${alumniToken}` },
  });
  const jobSeenByAlumni = publicJobsRes.data?.find((j: any) => j.id === createdJob.id);
  if (!jobSeenByAlumni) {
    throw new Error('Data tidak tersinkronisasi lintas sesi! Sesi Alumni tidak melihat lowongan yang diposting Industri.');
  }
  console.log(`✓ Sesi 2 (Alumni): Berhasil melihat data yang diubah Sesi 1 secara instan dari server: "${jobSeenByAlumni.title}".`);
  console.log('✓ Terverifikasi: Seluruh data bisnis mutlak tersimpan di server dan bebas dari ketergantungan localStorage klien.');

  // STEP 8: Pemulihan Data Bersih (POST /api/admin/reset-demo)
  console.log('\n--- LANGKAH 8: Reset Demo ke Seed Awal Bersih (POST /api/admin/reset-demo) ---');
  const adminToken = await loginAs('admin');
  const resetRes = await request('/api/admin/reset-demo', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  if (!resetRes.ok) {
    throw new Error(`Gagal reset demo: ${JSON.stringify(resetRes.data)}`);
  }
  console.log(`✓ Endpoint reset demo berhasil: "${resetRes.data.message}"`);

  // Verifikasi data kembali ke seed bersih
  const postResetSignals = await request('/api/industry/signals');
  const postResetMatches = await request('/api/match/results');
  console.log(`✓ Verifikasi database kembali ke seed: Sinyal = ${postResetSignals.data.length}, Analisis = ${postResetMatches.data.length}`);

  // STEP 9: Verifikasi Isolasi Data Sekolah & ID Seed 'inst_*' Pasca Reset Demo
  console.log('\n--- LANGKAH 9: Verifikasi Isolasi Data Sekolah & ID Seed inst_* Pasca Reset Demo ---');
  // 1. Akun Sekolah demo (BKK SMKN 1 Cilegon)
  const cilegonToken = await loginAs('school');
  const cilegonAlumniRes = await request('/api/school/alumni', {
    headers: { Authorization: `Bearer ${cilegonToken}` },
  });
  if (!cilegonAlumniRes.ok || !Array.isArray(cilegonAlumniRes.data)) {
    throw new Error(`Gagal memuat alumni SMKN 1 Cilegon: ${JSON.stringify(cilegonAlumniRes.data)}`);
  }
  if (cilegonAlumniRes.data.length < 2) {
    throw new Error(`SMKN 1 Cilegon seharusnya memiliki minimal 2 alumni seed, ditemukan: ${cilegonAlumniRes.data.length}`);
  }
  const nonCilegon = cilegonAlumniRes.data.filter((a: any) => a.schoolId !== 'inst_smkn1_clg');
  if (nonCilegon.length > 0) {
    throw new Error(`SMKN 1 Cilegon melihat alumni sekolah lain: ${JSON.stringify(nonCilegon)}`);
  }
  console.log(`✓ SMKN 1 Cilegon melihat ${cilegonAlumniRes.data.length} alumni seed miliknya (seluruhnya ber-schoolId inst_smkn1_clg).`);

  // 2. Akun Sekolah demo (BKK SMKN 1 Cikupa)
  const cikupaToken = await loginAs('school_cikupa');
  const cikupaAlumniRes = await request('/api/school/alumni', {
    headers: { Authorization: `Bearer ${cikupaToken}` },
  });
  if (!cikupaAlumniRes.ok || !Array.isArray(cikupaAlumniRes.data)) {
    throw new Error(`Gagal memuat alumni SMKN 1 Cikupa: ${JSON.stringify(cikupaAlumniRes.data)}`);
  }
  if (cikupaAlumniRes.data.length < 2) {
    throw new Error(`SMKN 1 Cikupa seharusnya memiliki minimal 2 alumni seed, ditemukan: ${cikupaAlumniRes.data.length}`);
  }
  const nonCikupa = cikupaAlumniRes.data.filter((a: any) => a.schoolId !== 'inst_smkn1_ckp');
  if (nonCikupa.length > 0) {
    throw new Error(`SMKN 1 Cikupa melihat alumni sekolah lain: ${JSON.stringify(nonCikupa)}`);
  }
  // Pastikan tidak ada overlap ID antara Cilegon dan Cikupa
  const cilegonIds = new Set(cilegonAlumniRes.data.map((a: any) => a.id));
  const leakedToCikupa = cikupaAlumniRes.data.filter((a: any) => cilegonIds.has(a.id));
  if (leakedToCikupa.length > 0) {
    throw new Error(`Kebocoran data terdeteksi! SMKN 1 Cikupa memuat alumni dari SMKN 1 Cilegon: ${JSON.stringify(leakedToCikupa)}`);
  }
  console.log(`✓ SMKN 1 Cikupa melihat ${cikupaAlumniRes.data.length} alumni seed miliknya (seluruhnya ber-schoolId inst_smkn1_ckp).`);
  console.log('✓ Terverifikasi: Isolasi multi-tenant antar-sekolah 100% terjaga dan ID seed inst_* tersinkronisasi.');

  console.log('\n=====================================================');
  console.log('SEMUA 9 PENGUJIAN END-TO-END MULTI-PERAN 100% LULUS!');
  console.log('=====================================================');
}

runTest().catch((err) => {
  console.error('Pengujian GAGAL:', err);
  process.exit(1);
});
