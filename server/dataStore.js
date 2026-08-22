// server/dataStore.js
import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);
const defaultHashedPassword = bcrypt.hashSync('password123', salt);

// Pre-seeded Hospitals with Master Authorization Passwords
export const hospitals = [
  {
    id: 'hosp_metro_01',
    name: 'Metro Super Specialty Hospital',
    regNumber: 'REG-DL-2024-8840',
    type: 'Tertiary Care Multi-Specialty',
    address: 'Sector 12, Rohini, New Delhi',
    district: 'North West Delhi',
    state: 'Delhi',
    contactPhone: '+91 11 4982 9900',
    email: 'admin@metrohospital.org',
    authorizedRepresentative: 'Dr. S. K. Gupta (Medical Director)',
    status: 'Approved',
    verificationStatus: 'Approved',
    verifiedAt: '2024-01-15T10:00:00.000Z',
    rating: 4.9,
    departments: ['Cardiology', 'Emergency Care', 'Internal Medicine', 'Pulmonology', 'Neurology'],
    masterAuthPasswordHash: bcrypt.hashSync('Master@123', salt), // Master password for staff credential reveal
    registeredAt: '2024-01-10T08:30:00.000Z'
  },
  {
    id: 'hosp_apex_02',
    name: 'Apex Care & Research Institute',
    regNumber: 'REG-MH-2024-1102',
    type: 'Multi-Specialty & Research',
    address: 'Bandra Kurla Complex, Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    contactPhone: '+91 22 6123 4567',
    email: 'contact@apexcare.org',
    authorizedRepresentative: 'Dr. M. R. Kulkarni (Chief Superintendent)',
    status: 'Approved',
    verificationStatus: 'Approved',
    verifiedAt: '2024-02-01T11:00:00.000Z',
    rating: 4.8,
    departments: ['Pulmonology', 'Oncology', 'Critical Care', 'Gastroenterology'],
    masterAuthPasswordHash: bcrypt.hashSync('Master@123', salt),
    registeredAt: '2024-01-20T09:15:00.000Z'
  },
  {
    id: 'hosp_kmt_03',
    name: 'Kerala Medical Trust Hospital',
    regNumber: 'REG-KL-2024-5509',
    type: 'Super Specialty Hospital',
    address: 'MG Road, Ernakulam, Kochi',
    district: 'Ernakulam',
    state: 'Kerala',
    contactPhone: '+91 484 235 8899',
    email: 'helpdesk@kmtkerala.org',
    authorizedRepresentative: 'Dr. Joseph Mathew (Medical Superintendent)',
    status: 'Approved',
    verificationStatus: 'Approved',
    verifiedAt: '2024-03-05T14:30:00.000Z',
    rating: 4.9,
    departments: ['Internal Medicine', 'Tropical Diseases', 'Cardiology', 'Pediatrics'],
    masterAuthPasswordHash: bcrypt.hashSync('Master@123', salt),
    registeredAt: '2024-02-28T10:00:00.000Z'
  },
  {
    id: 'hosp_citycare_04',
    name: 'City Care General Hospital',
    regNumber: 'REG-UP-2024-9021',
    type: 'General District Hospital',
    address: 'Civil Lines, Kanpur',
    district: 'Kanpur Nagar',
    state: 'Uttar Pradesh',
    contactPhone: '+91 512 230 4455',
    email: 'info@citycarehospital.org',
    authorizedRepresentative: 'Dr. Alok Verma',
    status: 'Pending',
    verificationStatus: 'Pending',
    verifiedAt: null,
    rating: 4.2,
    departments: ['General Medicine', 'General Surgery', 'Obstetrics'],
    masterAuthPasswordHash: bcrypt.hashSync('Master@123', salt),
    registeredAt: '2024-08-10T12:00:00.000Z'
  }
];

// Doctors / Clinical Staff (Added by Hospitals via Staff Management)
export const doctors = [
  {
    id: 'doc_priya_01',
    name: 'Dr. Priya Sharma',
    username: 'dr_priya',
    plainPasswordHint: 'PriyaStaff@2026',
    email: 'dr.priya@metrohospital.org',
    phone: '+91 98112 34567',
    isEmailVerified: true,
    isMobileVerified: true,
    medicalCouncilRegNo: 'MCI-DL-2015-44910',
    specialization: 'Cardiology',
    hospitalId: 'hosp_metro_01',
    hospitalName: 'Metro Super Specialty Hospital',
    department: 'Cardiology',
    status: 'Active',
    verified: true
  },
  {
    id: 'doc_anita_02',
    name: 'Dr. Anita Varma',
    username: 'dr_anita',
    plainPasswordHint: 'AnitaStaff@2026',
    email: 'dr.anita@apexcare.org',
    phone: '+91 98200 88776',
    isEmailVerified: true,
    isMobileVerified: true,
    medicalCouncilRegNo: 'MCI-MH-2018-88320',
    specialization: 'Pulmonology',
    hospitalId: 'hosp_apex_02',
    hospitalName: 'Apex Care & Research Institute',
    department: 'Pulmonology',
    status: 'Active',
    verified: true
  },
  {
    id: 'doc_rajesh_03',
    name: 'Dr. Rajesh Nair',
    username: 'dr_rajesh',
    plainPasswordHint: 'RajeshStaff@2026',
    email: 'dr.rajesh@kmtkerala.org',
    phone: '+91 94471 22334',
    isEmailVerified: true,
    isMobileVerified: true,
    medicalCouncilRegNo: 'MCI-KL-2012-11094',
    specialization: 'Internal Medicine',
    hospitalId: 'hosp_kmt_03',
    hospitalName: 'Kerala Medical Trust Hospital',
    department: 'Internal Medicine',
    status: 'Active',
    verified: true
  },
  {
    id: 'doc_neha_04',
    name: 'Dr. Neha Kapoor',
    username: 'dr_neha',
    plainPasswordHint: 'NehaStaff@2026',
    email: 'dr.neha@metrohospital.org',
    phone: '+91 98119 77665',
    isEmailVerified: true,
    isMobileVerified: true,
    medicalCouncilRegNo: 'MCI-DL-2020-66712',
    specialization: 'Emergency Medicine',
    hospitalId: 'hosp_metro_01',
    hospitalName: 'Metro Super Specialty Hospital',
    department: 'Emergency Care',
    status: 'Active',
    verified: true
  }
];

// Pre-seeded User Accounts for Auth (Patient, Hospital Admin, Staff, Govt, Super Admin)
export const users = [
  {
    id: 'user_patient_aarav',
    username: 'aarav_patient',
    passwordHash: defaultHashedPassword,
    name: 'Aarav Kumar',
    email: 'aarav.kumar@example.com',
    role: 'Patient',
    anvayId: 'ANVAY-2026-8F29K4',
    phone: '+91 98765 43210'
  },
  {
    id: 'user_patient_meera',
    username: 'meera_patient',
    passwordHash: defaultHashedPassword,
    name: 'Meera Menon',
    email: 'meera.menon@example.com',
    role: 'Patient',
    anvayId: 'ANVAY-2026-3B91T7',
    phone: '+91 94470 12345'
  },
  {
    id: 'user_doc_priya',
    username: 'dr_priya',
    passwordHash: defaultHashedPassword,
    name: 'Dr. Priya Sharma',
    email: 'dr.priya@metrohospital.org',
    role: 'Doctor',
    hospitalId: 'hosp_metro_01',
    hospitalName: 'Metro Super Specialty Hospital',
    department: 'Cardiology',
    doctorId: 'doc_priya_01'
  },
  {
    id: 'user_doc_anita',
    username: 'dr_anita',
    passwordHash: defaultHashedPassword,
    name: 'Dr. Anita Varma',
    email: 'dr.anita@apexcare.org',
    role: 'Doctor',
    hospitalId: 'hosp_apex_02',
    hospitalName: 'Apex Care & Research Institute',
    department: 'Pulmonology',
    doctorId: 'doc_anita_02'
  },
  {
    id: 'user_doc_rajesh',
    username: 'dr_rajesh',
    passwordHash: defaultHashedPassword,
    name: 'Dr. Rajesh Nair',
    email: 'dr.rajesh@kmtkerala.org',
    role: 'Doctor',
    hospitalId: 'hosp_kmt_03',
    hospitalName: 'Kerala Medical Trust Hospital',
    department: 'Internal Medicine',
    doctorId: 'doc_rajesh_03'
  },
  {
    id: 'user_hosp_metro',
    username: 'hospadmin_metro',
    passwordHash: defaultHashedPassword,
    name: 'Metro Hospital Admin Desk',
    email: 'admin@metrohospital.org',
    role: 'Hospital Admin',
    hospitalId: 'hosp_metro_01',
    hospitalName: 'Metro Super Specialty Hospital'
  },
  {
    id: 'user_hosp_apex',
    username: 'hospadmin_apex',
    passwordHash: defaultHashedPassword,
    name: 'Apex Care Admin Desk',
    email: 'admin@apexcare.org',
    role: 'Hospital Admin',
    hospitalId: 'hosp_apex_02',
    hospitalName: 'Apex Care & Research Institute'
  },
  {
    id: 'user_hosp_kmt',
    username: 'hospadmin_kmt',
    passwordHash: defaultHashedPassword,
    name: 'KMT Hospital Admin Desk',
    email: 'admin@kmtkerala.org',
    role: 'Hospital Admin',
    hospitalId: 'hosp_kmt_03',
    hospitalName: 'Kerala Medical Trust Hospital'
  },
  {
    id: 'user_govt_admin',
    username: 'govtadmin',
    passwordHash: defaultHashedPassword,
    name: 'State Health Officer (Surveillance)',
    email: 'health.surveillance@mohfw.gov.in',
    role: 'Government Admin',
    department: 'Integrated Disease Surveillance Programme (IDSP)'
  },
  {
    id: 'user_super_admin',
    username: 'superadmin',
    passwordHash: defaultHashedPassword,
    name: 'ANVAY Central Authority',
    email: 'root@anvay.gov.in',
    role: 'Super Admin',
    department: 'National Health Interoperability Directorate'
  }
];

// Patients Longitudinal Records
export const patients = [
  {
    anvayId: 'ANVAY-2026-8F29K4',
    govtIdRef: 'ABHA-8921-9921-4401',
    fullName: 'Aarav Kumar',
    dateOfBirth: '1988-05-14',
    age: 38,
    gender: 'Male',
    bloodGroup: 'O+',
    contactPhone: '+91 98765 43210',
    emergencyContactName: 'Sunita Kumar (Spouse)',
    emergencyContactPhone: '+91 98765 43211',
    registeredByHospitalId: 'hosp_metro_01',
    registeredByHospitalName: 'Metro Super Specialty Hospital',
    registeredAt: '2024-03-10T10:30:00.000Z',
    state: 'Delhi',
    district: 'North West Delhi',
    allergies: [
      {
        substance: 'Penicillin',
        severity: 'Severe (Anaphylaxis Risk)',
        reaction: 'Urticaria, dyspnea, throat tightness',
        status: 'Confirmed Positive',
        diagnosedBy: 'Dr. Priya Sharma',
        hospital: 'Metro Super Specialty Hospital',
        date: '2024-03-10'
      },
      {
        substance: 'Sulfa Drugs',
        severity: 'None',
        reaction: 'None observed',
        status: 'Confirmed None',
        diagnosedBy: 'Dr. Anita Varma',
        hospital: 'Apex Care & Research Institute',
        date: '2025-06-15'
      }
    ],
    chronicConditions: [
      {
        condition: 'Essential Hypertension',
        diagnosedDate: '2024-03-10',
        hospital: 'Metro Super Specialty Hospital',
        doctor: 'Dr. Priya Sharma',
        status: 'Active / Controlled'
      },
      {
        condition: 'Mild Bronchial Asthma',
        diagnosedDate: '2025-06-15',
        hospital: 'Apex Care & Research Institute',
        doctor: 'Dr. Anita Varma',
        status: 'Active / Intermittent'
      }
    ],
    activeMedicines: [
      {
        medicineName: 'Telmisartan 40mg',
        dosage: '1 tablet once daily (morning)',
        prescribedBy: 'Dr. Priya Sharma',
        hospital: 'Metro Super Specialty Hospital',
        prescribedDate: '2024-03-10',
        status: 'Active'
      },
      {
        medicineName: 'Budesonide 200mcg Inhaler',
        dosage: '2 puffs as needed for wheezing',
        prescribedBy: 'Dr. Anita Varma',
        hospital: 'Apex Care & Research Institute',
        prescribedDate: '2025-06-15',
        status: 'Active'
      }
    ],
    vaccinations: [
      { vaccineName: 'COVID-19 (Covishield Booster)', dose: 'Dose 3', status: 'Confirmed', hospital: 'Metro Super Specialty Hospital', date: '2024-01-12' },
      { vaccineName: 'Hepatitis B Complete Series', dose: '3 Doses', status: 'Confirmed', hospital: 'Metro Super Specialty Hospital', date: '2024-03-10' },
      { vaccineName: 'Influenza Annual (2025)', dose: 'Annual Quadrivalent', status: 'Confirmed', hospital: 'Kerala Medical Trust Hospital', date: '2026-01-08' }
    ],
    completeness: {
      score: 95,
      allergiesConfirmed: true,
      bloodGroupConfirmed: true,
      conditionsConfirmed: true,
      vaccinationsConfirmed: true,
      missingItems: []
    }
  },
  {
    anvayId: 'ANVAY-2026-3B91T7',
    govtIdRef: 'ABHA-7740-2189-9912',
    fullName: 'Meera Menon',
    dateOfBirth: '1995-11-22',
    age: 31,
    gender: 'Female',
    bloodGroup: 'B+',
    contactPhone: '+91 94470 12345',
    emergencyContactName: 'K. Menon (Father)',
    emergencyContactPhone: '+91 94470 54321',
    registeredByHospitalId: 'hosp_kmt_03',
    registeredByHospitalName: 'Kerala Medical Trust Hospital',
    registeredAt: '2024-05-18T14:20:00.000Z',
    state: 'Kerala',
    district: 'Ernakulam',
    allergies: [
      {
        substance: 'NSAIDs (Ibuprofen)',
        severity: 'Moderate',
        reaction: 'Gastric irritation & facial edema',
        status: 'Confirmed Positive',
        diagnosedBy: 'Dr. Rajesh Nair',
        hospital: 'Kerala Medical Trust Hospital',
        date: '2024-05-18'
      }
    ],
    chronicConditions: [
      {
        condition: 'Hypothyroidism',
        diagnosedDate: '2024-05-18',
        hospital: 'Kerala Medical Trust Hospital',
        doctor: 'Dr. Rajesh Nair',
        status: 'Active'
      }
    ],
    activeMedicines: [
      {
        medicineName: 'Levothyroxine 50mcg',
        dosage: '1 tablet empty stomach in morning',
        prescribedBy: 'Dr. Rajesh Nair',
        hospital: 'Kerala Medical Trust Hospital',
        prescribedDate: '2024-05-18',
        status: 'Active'
      }
    ],
    vaccinations: [
      { vaccineName: 'COVID-19 Booster', dose: 'Dose 3', status: 'Confirmed', hospital: 'Kerala Medical Trust Hospital', date: '2024-05-18' }
    ],
    completeness: {
      score: 84,
      allergiesConfirmed: true,
      bloodGroupConfirmed: true,
      conditionsConfirmed: true,
      vaccinationsConfirmed: false,
      missingItems: ['Recent TSH Lab Confirmation', 'Annual Eye Exam']
    }
  }
];

// Multi-Hospital Longitudinal Medical Records Stream
export const medicalRecords = [
  {
    recordId: 'REC-2024-MET-001',
    patientAnvayId: 'ANVAY-2026-8F29K4',
    anvayId: 'ANVAY-2026-8F29K4',
    hospitalId: 'hosp_metro_01',
    hospitalName: 'Metro Super Specialty Hospital',
    doctorName: 'Dr. Priya Sharma',
    doctorId: 'doc_priya_01',
    department: 'Cardiology',
    recordType: 'Diagnosis',
    category: 'Diagnosis',
    title: 'Essential Hypertension Diagnosis & Baseline ECG',
    description: 'Patient presented with headache and BP 154/96 mmHg. Resting ECG shows normal sinus rhythm. Commenced on Telmisartan 40mg OD.',
    diagnosisOrReason: 'Stage 1 Essential Hypertension',
    createdAt: '2024-03-10T11:00:00.000Z',
    updatedAt: '2024-03-10T11:00:00.000Z',
    version: 1,
    verifiedStatus: 'Verified',
    documents: [
      {
        fileName: 'Resting_ECG_Baseline.pdf',
        fileUrl: '/uploads/Resting_ECG_Baseline.pdf',
        fileType: 'PDF',
        fileSize: '412 KB',
        uploadedAt: '2024-03-10T11:05:00.000Z'
      }
    ],
    versionHistory: []
  },
  {
    recordId: 'REC-2024-MET-002',
    patientAnvayId: 'ANVAY-2026-8F29K4',
    anvayId: 'ANVAY-2026-8F29K4',
    hospitalId: 'hosp_metro_01',
    hospitalName: 'Metro Super Specialty Hospital',
    doctorName: 'Dr. Priya Sharma',
    doctorId: 'doc_priya_01',
    department: 'Cardiology',
    recordType: 'Prescription',
    category: 'Prescription',
    title: 'Cardiovascular Maintenance Prescription',
    description: 'Rx: Tab Telmisartan 40mg once daily in morning after breakfast for 90 days. Low sodium diet advised.',
    diagnosisOrReason: 'Hypertension Management',
    createdAt: '2024-03-10T11:15:00.000Z',
    updatedAt: '2024-03-10T11:15:00.000Z',
    version: 1,
    verifiedStatus: 'Verified',
    documents: [],
    versionHistory: []
  },
  {
    recordId: 'REC-2025-APX-089',
    patientAnvayId: 'ANVAY-2026-8F29K4',
    anvayId: 'ANVAY-2026-8F29K4',
    hospitalId: 'hosp_apex_02',
    hospitalName: 'Apex Care & Research Institute',
    doctorName: 'Dr. Anita Varma',
    doctorId: 'doc_anita_02',
    department: 'Pulmonology',
    recordType: 'Diagnosis',
    category: 'Diagnosis',
    title: 'Respiratory Workup & Spirometry Assessment',
    description: 'Patient reported seasonal dry cough and mild nocturnal wheezing. Spirometry demonstrated mild reversible airway obstruction (FEV1 82%). Diagnosed with Mild Intermittent Asthma. Continued previous cardiac meds.',
    diagnosisOrReason: 'Mild Bronchial Asthma',
    createdAt: '2025-06-15T15:30:00.000Z',
    updatedAt: '2025-06-15T15:30:00.000Z',
    version: 1,
    verifiedStatus: 'Verified',
    documents: [
      {
        fileName: 'Spirometry_Report_2025.pdf',
        fileUrl: '/uploads/Spirometry_Report_2025.pdf',
        fileType: 'PDF',
        fileSize: '620 KB',
        uploadedAt: '2025-06-15T15:40:00.000Z'
      }
    ],
    versionHistory: []
  },
  {
    recordId: 'REC-2026-KMT-142',
    patientAnvayId: 'ANVAY-2026-8F29K4',
    anvayId: 'ANVAY-2026-8F29K4',
    hospitalId: 'hosp_kmt_03',
    hospitalName: 'Kerala Medical Trust Hospital',
    doctorName: 'Dr. Rajesh Nair',
    doctorId: 'doc_rajesh_03',
    department: 'Internal Medicine',
    recordType: 'General Check-up',
    category: 'General Check-up',
    title: 'Annual Multi-Hospital Health Evaluation & Travel Check',
    description: 'Patient presented for routine annual check during relocation to Kochi. Blood pressure controlled at 124/80 mmHg. Lungs clear. Penicillin allergy confirmed and highlighted in ANVAY summary.',
    diagnosisOrReason: 'Annual Health Review & Travel Check',
    createdAt: '2026-01-08T09:45:00.000Z',
    updatedAt: '2026-01-08T09:45:00.000Z',
    version: 1,
    verifiedStatus: 'Verified',
    documents: [
      {
        fileName: 'Comprehensive_Metabolic_Panel.pdf',
        fileUrl: '/uploads/Comprehensive_Metabolic_Panel.pdf',
        fileType: 'PDF',
        fileSize: '310 KB',
        uploadedAt: '2026-01-08T10:00:00.000Z'
      }
    ],
    versionHistory: []
  }
];

export const records = medicalRecords;

// Central Tamper-Evident Audit Logs
export const auditLogs = [
  {
    logId: 'AUDIT-LOG-1001',
    timestamp: '2026-01-08T09:45:00.000Z',
    userId: 'user_doc_rajesh',
    userName: 'Dr. Rajesh Nair',
    userRole: 'Doctor',
    hospitalId: 'hosp_kmt_03',
    hospitalName: 'Kerala Medical Trust Hospital',
    actionType: 'RECORD_CREATED',
    targetAnvayId: 'ANVAY-2026-8F29K4',
    targetPatientName: 'Aarav Kumar',
    recordId: 'REC-2026-KMT-142',
    purpose: 'Routine Annual Health Review & Clinical Record Entry',
    ipAddress: '103.21.144.92',
    status: 'Success'
  }
];

export const store = {
  hospitals,
  doctors,
  users,
  patients,
  medicalRecords,
  records: medicalRecords,
  auditLogs
};

export default store;
