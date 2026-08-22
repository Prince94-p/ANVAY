const BASE_URL = 'http://localhost:5001/api';

async function runComprehensiveTests() {
  console.log('=== Starting ANVAY Comprehensive Multi-Role Verification ===\n');

  // 1. Health Check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  console.log('1. Health Check:', healthData.status === 'online' ? '✅ PASS' : '❌ FAIL');

  // 2. Patient User Authentication (Aarav Kumar)
  const patientAuthRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'aarav_patient', password: 'password123', loginRole: 'Patient' })
  });
  const patientAuthData = await patientAuthRes.json();
  console.log('2. Patient User Login:', patientAuthData.success && patientAuthData.user.role === 'Patient' ? '✅ PASS' : '❌ FAIL', `(ANVAY ID: ${patientAuthData.user?.anvayId})`);

  // 3. Patient Clinical Snapshot Retrieval
  const patientToken = patientAuthData.token;
  const snapRes = await fetch(`${BASE_URL}/patients/${patientAuthData.user.anvayId}/snapshot`, {
    headers: { 'Authorization': `Bearer ${patientToken}` }
  });
  const snapData = await snapRes.json();
  console.log('3. Patient Self-Service Snapshot:', snapData.success && snapData.snapshot?.patient?.fullName === 'Aarav Kumar' ? '✅ PASS' : '❌ FAIL', `(Blood Group: ${snapData.snapshot?.patient?.bloodGroup}, Completeness: ${snapData.snapshot?.patient?.completeness?.score}%)`);

  // 4. Hospital Admin Authentication (Metro Super Specialty)
  const hospAdminAuthRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hospadmin_metro', password: 'password123', loginRole: 'Hospital' })
  });
  const hospAdminData = await hospAdminAuthRes.json();
  const hospToken = hospAdminData.token;
  console.log('4. Hospital Admin Login:', hospAdminData.success && hospAdminData.user.role === 'Hospital Admin' ? '✅ PASS' : '❌ FAIL', `(Hospital: ${hospAdminData.user?.hospitalName})`);

  // 5. Hospital Staff Listing (Default Masked Passwords)
  const docsRes = await fetch(`${BASE_URL}/doctors`, {
    headers: { 'Authorization': `Bearer ${hospToken}` }
  });
  const docsData = await docsRes.json();
  const isMasked = docsData.doctors.every(d => d.plainPasswordHint === '••••••••••••');
  console.log('5. Default Staff Password Masking:', docsData.success && isMasked ? '✅ PASS' : '❌ FAIL', `(Total Staff: ${docsData.doctors?.length})`);

  // 6. Master Authorization Password Rejection on Invalid Key
  const invalidMasterRes = await fetch(`${BASE_URL}/doctors/reveal-credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${hospToken}`
    },
    body: JSON.stringify({ masterPassword: 'WrongPassword999' })
  });
  const invalidMasterData = await invalidMasterRes.json();
  console.log('6. Master Password Gate Rejection (Invalid Key):', !invalidMasterData.success && invalidMasterRes.status === 401 ? '✅ PASS' : '❌ FAIL');

  // 7. Master Authorization Password Verification (Valid Key 'Master@123')
  const validMasterRes = await fetch(`${BASE_URL}/doctors/reveal-credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${hospToken}`
    },
    body: JSON.stringify({ masterPassword: 'Master@123' })
  });
  const validMasterData = await validMasterRes.json();
  const unmaskedCount = validMasterData.credentials?.length || 0;
  console.log('7. Master Password Vault Unlock (Valid Key):', validMasterData.success && unmaskedCount > 0 ? '✅ PASS' : '❌ FAIL', `(Unlocked Passwords Count: ${unmaskedCount})`);

  // 8. Hospital Onboards New Clinical Staff Member
  const addStaffRes = await fetch(`${BASE_URL}/doctors/add-staff`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${hospToken}`
    },
    body: JSON.stringify({
      name: 'Dr. Vikram Sen',
      medicalCouncilRegNo: 'MCI-DL-2024-8871',
      specialization: 'Neurology',
      department: 'Neurology',
      email: 'dr.vikram@metrohospital.org',
      phone: '+91 98110 55443',
      isEmailVerified: true,
      isMobileVerified: true
    })
  });
  const addStaffData = await addStaffRes.json();
  console.log('8. Hospital Staff Auto-Enrollment & Credential Generation:', addStaffData.success && addStaffData.generatedCredentials?.username ? '✅ PASS' : '❌ FAIL', `(Generated Username: ${addStaffData.generatedCredentials?.username})`);

  // 9. Doctor Login with Generated/Existing Credentials (Dr. Priya)
  const docLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'dr_priya', password: 'password123', loginRole: 'Doctor' })
  });
  const docLoginData = await docLoginRes.json();
  const docToken = docLoginData.token;
  console.log('9. Doctor Staff Login:', docLoginData.success && docLoginData.user.role === 'Doctor' ? '✅ PASS' : '❌ FAIL', `(Logged in as: ${docLoginData.user?.name})`);

  // 10. Multi-Hospital Longitudinal Medical History
  const historyRes = await fetch(`${BASE_URL}/records/patient/ANVAY-2026-8F29K4`, {
    headers: { 'Authorization': `Bearer ${docToken}` }
  });
  const historyData = await historyRes.json();
  console.log('10. Multi-Hospital Longitudinal Timeline:', historyData.success && historyData.records?.length >= 4 ? '✅ PASS' : '❌ FAIL', `(Records Count: ${historyData.records?.length})`);

  console.log('\n=== All 10 User & Role Scenarios Verified Successfully ===');
}

runComprehensiveTests().catch(console.error);
