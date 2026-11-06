/**
 * SINKRON Banten - RBAC & Security Test Suite
 * Memeriksa pembatasan hak akses server-side (RBAC), pembatasan data pribadi,
 * anonimisasi sinyal industri, dan validasi keamanan.
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: string;
}

const results: TestResult[] = [];

async function loginUser(role: string): Promise<string> {
  // Coba login via demo login terlebih dahulu
  try {
    const demoRes = await fetch(`${BASE_URL}/api/demo/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });

    if (demoRes.ok) {
      const data = await demoRes.json();
      if (data.token) return data.token;
    }
  } catch (e) {
    // fallback ke credential login
  }

  // Fallback ke login standar dengan kredensial seed
  const credentials: Record<string, { email: string; pass: string }> = {
    alumni: { email: 'rizky.pratama@gmail.com', pass: 'AlumniBanten#2026' },
    disdik: { email: 'disdik@bantenprov.go.id', pass: 'DisdikBanten#2026' },
    admin: { email: 'admin@bantenprov.go.id', pass: 'AdminS1nkron#2026' },
    school: { email: 'bkk.smkn1cilegon@sch.id', pass: 'Smkn1Cilegon#2026' },
    industry: { email: 'recruitment@krakatausteel.com', pass: 'KrakatauSteel#2026' },
  };

  const cred = credentials[role];
  if (!cred) throw new Error(`Role ${role} tidak memiliki kredensial seed.`);

  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cred.email, password: cred.pass }),
  });

  const data = await res.json();
  if (!res.ok || !data.token) {
    throw new Error(`Login gagal untuk peran ${role}: ${JSON.stringify(data)}`);
  }
  return data.token;
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 Menjalankan Pengujian RBAC & Keamanan Server');
  console.log(`Target: ${BASE_URL}`);
  console.log('====================================================\n');

  try {
    // Pastikan server hidup
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    if (!healthRes.ok) {
      throw new Error(`Server tidak merespons di ${BASE_URL}`);
    }
    console.log('✅ Server aktif dan merespons /api/health\n');

    // 1. Dapatkan token autentikasi
    console.log('🔑 Mengautentikasi akun uji...');
    const alumniToken = await loginUser('alumni');
    const disdikToken = await loginUser('disdik');
    const adminToken = await loginUser('admin');
    const schoolToken = await loginUser('school');
    console.log('✅ Token diperoleh untuk Alumni, Disdik, School, dan Admin\n');

    // TEST 1: Alumni ditolak (403) pada approve kompetensi
    console.log('🧪 Uji 1: Alumni mencoba approve kompetensi...');
    const test1Res = await fetch(`${BASE_URL}/api/competencies/comp_las_01/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${alumniToken}`,
        'Content-Type': 'application/json',
      },
    });
    results.push({
      name: 'Alumni ditolak (403) pada approve kompetensi (/api/competencies/:id/approve)',
      passed: test1Res.status === 403,
      expected: 'HTTP 403 Forbidden',
      actual: `HTTP ${test1Res.status}`,
    });

    // TEST 2: Alumni ditolak (403) pada verifikasi institusi
    console.log('🧪 Uji 2: Alumni mencoba verifikasi institusi...');
    const test2Res = await fetch(`${BASE_URL}/api/admin/institutions/inst_smkn1_clg/verify`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${alumniToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'terverifikasi' }),
    });
    results.push({
      name: 'Alumni ditolak (403) pada verifikasi institusi (/api/admin/institutions/:id/verify)',
      passed: test2Res.status === 403,
      expected: 'HTTP 403 Forbidden',
      actual: `HTTP ${test2Res.status}`,
    });

    // TEST 3: Alumni ditolak (403) pada ubah status rekomendasi
    console.log('🧪 Uji 3: Alumni mencoba ubah status rekomendasi...');
    const test3Res = await fetch(`${BASE_URL}/api/recommendations/rec_01/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${alumniToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'Disetujui', reason: 'Penyesuaian kurikulum' }),
    });
    results.push({
      name: 'Alumni ditolak (403) pada ubah status rekomendasi (/api/recommendations/:id/status)',
      passed: test3Res.status === 403,
      expected: 'HTTP 403 Forbidden',
      actual: `HTTP ${test3Res.status}`,
    });

    // TEST 4: Alumni ditolak (403) pada audit log
    console.log('🧪 Uji 4: Alumni mencoba melihat audit log...');
    const test4Res = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
      headers: {
        Authorization: `Bearer ${alumniToken}`,
      },
    });
    results.push({
      name: 'Alumni ditolak (403) pada audit log (/api/admin/audit-logs)',
      passed: test4Res.status === 403,
      expected: 'HTTP 403 Forbidden',
      actual: `HTTP ${test4Res.status}`,
    });

    // TEST 5: Disdik ditolak (403) pada /api/school/alumni
    console.log('🧪 Uji 5: Disdik mencoba mengakses data pribadi alumni...');
    const test5Res = await fetch(`${BASE_URL}/api/school/alumni`, {
      headers: {
        Authorization: `Bearer ${disdikToken}`,
      },
    });
    results.push({
      name: 'Disdik ditolak (403) pada data pribadi alumni (/api/school/alumni)',
      passed: test5Res.status === 403,
      expected: 'HTTP 403 Forbidden',
      actual: `HTTP ${test5Res.status}`,
    });

    // Disdik DIPERBOLEHKAN mengakses endpoint agregat
    const test5bRes = await fetch(`${BASE_URL}/api/school/alumni/aggregate`, {
      headers: {
        Authorization: `Bearer ${disdikToken}`,
      },
    });
    const aggData = test5bRes.ok ? await test5bRes.json() : null;
    results.push({
      name: 'Disdik diizinkan mengakses data agregat alumni (/api/school/alumni/aggregate)',
      passed: test5bRes.status === 200 && typeof aggData?.totalAlumni === 'number',
      expected: 'HTTP 200 OK dengan angka agregat',
      actual: `HTTP ${test5bRes.status}`,
    });

    // TEST 6: Sinyal anonim tidak memuat companyName dan data sensitif
    console.log('🧪 Uji 6: Sinyal anonim menyembunyikan identitas perusahaan pada respons publik/non-privilege...');
    const test6Res = await fetch(`${BASE_URL}/api/industry/signals`);
    const signals = await test6Res.json();
    const anonymousSignals = Array.isArray(signals) ? signals.filter((s: any) => s.visibility === 'anonim') : [];
    
    const allCompanyNamesEmpty = anonymousSignals.length > 0 && anonymousSignals.every(
      (s: any) => s.companyName === '' && s.companyId === ''
    );
    const noNotesOrVerifiedByInPublic = Array.isArray(signals) && signals.every(
      (s: any) => s.notes === undefined && s.verifiedBy === undefined
    );

    results.push({
      name: 'Sinyal industri anonim mengosongkan companyName dan companyId untuk non-privilege',
      passed: allCompanyNamesEmpty,
      expected: 'companyName === "" dan companyId === "" pada sinyal anonim',
      actual: allCompanyNamesEmpty ? 'Nama perusahaan dikosongkan' : 'BOCOR: Terdapat companyName pada sinyal anonim',
      details: `Ditemukan ${anonymousSignals.length} sinyal anonim dari total ${signals.length} sinyal.`,
    });

    results.push({
      name: 'Respons publik menyembunyikan field internal notes dan verifiedBy',
      passed: noNotesOrVerifiedByInPublic,
      expected: 'notes dan verifiedBy undefined pada respons publik',
      actual: noNotesOrVerifiedByInPublic ? 'Field internal disembunyikan' : 'BOCOR: field internal tampil ke publik',
    });

    // TEST 7: invitationToken tidak bocor di GET /api/school/alumni
    console.log('🧪 Uji 7: invitationToken tidak dikirim ke klien pada GET /api/school/alumni...');
    const test7Res = await fetch(`${BASE_URL}/api/school/alumni`, {
      headers: {
        Authorization: `Bearer ${schoolToken}`,
      },
    });
    const schoolAlumniList = await test7Res.json();
    const noInvitationTokenInList = Array.isArray(schoolAlumniList) && schoolAlumniList.every(
      (a: any) => a.invitationToken === undefined
    );
    results.push({
      name: 'invitationToken tidak dikirim pada daftar alumni (/api/school/alumni)',
      passed: noInvitationTokenInList,
      expected: 'invitationToken undefined pada setiap record alumni di daftar',
      actual: noInvitationTokenInList ? 'Aman (token disaring)' : 'BOCOR: invitationToken terkirim di daftar',
    });

    // TEST 8: /api/ai/match requireRole dan batas panjang input
    console.log('🧪 Uji 8: Otorisasi dan batas panjang input pada /api/ai/match...');
    // Alumni ditolak (403)
    const aiAlumniRes = await fetch(`${BASE_URL}/api/ai/match`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${alumniToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobTitle: 'Welder' }),
    });

    results.push({
      name: 'Alumni ditolak (403) pada analisis AI (/api/ai/match)',
      passed: aiAlumniRes.status === 403,
      expected: 'HTTP 403 Forbidden',
      actual: `HTTP ${aiAlumniRes.status}`,
    });

    // Disdik dengan input melampaui batas (jobTitle > 120 char) ditolak (400)
    const tooLongJobTitle = 'A'.repeat(125);
    const aiBadInputRes = await fetch(`${BASE_URL}/api/ai/match`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${disdikToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobTitle: tooLongJobTitle }),
    });

    results.push({
      name: 'Input melebihi batas panjang ditolak (400) pada /api/ai/match',
      passed: aiBadInputRes.status === 400,
      expected: 'HTTP 400 Bad Request',
      actual: `HTTP ${aiBadInputRes.status}`,
    });

    // Disdik dengan input valid berhasil (200)
    const aiGoodInputRes = await fetch(`${BASE_URL}/api/ai/match`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${disdikToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobTitle: 'Teknisi Pengelasan SMAW',
        jobDescription: 'Mengoperasikan mesin las busur manual',
        curriculumSyllabus: 'Silabus Teknik Pengelasan Semester 4',
      }),
    });

    results.push({
      name: 'Peran berwenang dengan input valid diterima (200) pada /api/ai/match',
      passed: aiGoodInputRes.status === 200,
      expected: 'HTTP 200 OK',
      actual: `HTTP ${aiGoodInputRes.status}`,
    });

    // TEST 9: Header Keamanan (CSP, Referrer-Policy, Permissions-Policy, X-Content-Type-Options, X-Frame-Options)
    console.log('🧪 Uji 9: Memeriksa header keamanan HTTP...');
    const headersRes = await fetch(`${BASE_URL}/api/health`);
    const csp = headersRes.headers.get('content-security-policy') || '';
    const referrer = headersRes.headers.get('referrer-policy') || '';
    const permissions = headersRes.headers.get('permissions-policy') || '';
    const nosniff = headersRes.headers.get('x-content-type-options') || '';
    const xframe = headersRes.headers.get('x-frame-options') || '';

    const hasFontsInCsp = csp.includes('https://fonts.googleapis.com') && csp.includes('https://fonts.gstatic.com');
    const hasStrictReferrer = referrer === 'strict-origin-when-cross-origin';
    const hasPermissionsPolicy = permissions.includes('camera=()') && permissions.includes('microphone=()');

    results.push({
      name: 'Header Content-Security-Policy memuat izin Google Fonts',
      passed: hasFontsInCsp,
      expected: 'CSP menyertakan fonts.googleapis.com dan fonts.gstatic.com',
      actual: hasFontsInCsp ? 'CSP Terkonfigurasi dengan benar' : `CSP: ${csp}`,
    });

    results.push({
      name: 'Header Referrer-Policy, Permissions-Policy, X-Content-Type-Options, dan X-Frame-Options aktif',
      passed: hasStrictReferrer && hasPermissionsPolicy && nosniff === 'nosniff' && !!xframe,
      expected: 'Semua 4 header keamanan terpasang sesuai standar',
      actual: `nosniff=${nosniff}, xframe=${xframe}, referrer=${referrer}`,
    });

  } catch (err: any) {
    console.error('❌ Terjadi kesalahan fatal saat menjalankan pengujian:', err.message);
    process.exit(1);
  }

  // Tampilkan tabel rekap
  console.log('\n====================================================');
  console.log('📊 REKAP HASIL PENGUJIAN RBAC & KEAMANAN');
  console.log('====================================================');
  
  let allPassed = true;
  for (const [idx, r] of results.entries()) {
    const symbol = r.passed ? '✅ [LULUS]' : '❌ [GAGAL]';
    if (!r.passed) allPassed = false;
    console.log(`${symbol} ${idx + 1}. ${r.name}`);
    console.log(`     Ekspektasi: ${r.expected}`);
    console.log(`     Aktual    : ${r.actual}`);
    if (r.details) console.log(`     Keterangan: ${r.details}`);
  }

  console.log('====================================================');
  if (allPassed) {
    console.log('🎉 SEMUA PENGUJIAN RBAC DAN KEAMANAN BERHASIL (100% LULUS)');
    process.exit(0);
  } else {
    console.log('⚠️ Terdapat pengujian yang belum memenuhi syarat.');
    process.exit(1);
  }
}

runTests();
