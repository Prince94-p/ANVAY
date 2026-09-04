import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, AlertTriangle, Mail } from 'lucide-react';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#f6fbff] text-[#173042] selection:bg-[#20a7ce] selection:text-white pb-20">
      {/* Top Sticky Header */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-[#d7e8f0]">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 font-extrabold text-[#173042] tracking-wide hover:opacity-90 transition">
            <span className="w-10 h-10 rounded-[13px] bg-gradient-to-br from-[#0f6f8f] to-[#18a999] text-white flex items-center justify-center text-xl font-black shadow-md shadow-[#0f6f8f]/20">
              ✚
            </span>
            <span className="flex flex-col">
              <span className="text-[18px] font-extrabold leading-tight tracking-[1.5px] text-[#0f5f7d]">
                ANV<span className="text-[#20a7ce]">AY</span>
              </span>
              <span className="text-[9.5px] font-bold text-[#607786] tracking-wider uppercase">
                Connected Healthcare
              </span>
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#d7e8f0] rounded-xl text-xs sm:text-sm font-bold text-[#173042] hover:bg-[#eef8ff] hover:text-[#0f6f8f] hover:border-[#0f6f8f]/30 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-[#0f6f8f]" />
            <span>Back to ANVAY</span>
          </Link>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="max-w-[1180px] mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8">
        <div className="relative overflow-hidden rounded-[26px] sm:rounded-[30px] p-8 sm:p-14 text-white bg-gradient-to-br from-[#0c6584] via-[#12808c] to-[#18a999] shadow-xl shadow-[#1c485c]/15">
          {/* Background Decorative Circle */}
          <div className="absolute -right-16 -top-24 w-72 h-72 rounded-full border-[38px] border-white/10 pointer-events-none" />
          
          <div className="relative z-10 max-w-[760px] space-y-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-xs font-extrabold tracking-wide backdrop-blur-sm">
              <Shield className="w-3.5 h-3.5" />
              <span>Privacy & Data Protection</span>
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-white">
              Privacy Policy
            </h1>

            <p className="text-sm sm:text-lg text-white/90 leading-relaxed pt-1">
              Your privacy and the security of your health information are important to us. This policy explains how ANVAY handles personal, identity and healthcare information.
            </p>

            <div className="pt-2">
              <span className="inline-block bg-white text-[#0b5169] px-3.5 py-2 rounded-xl font-extrabold text-xs sm:text-[13px] shadow-sm">
                Last Updated: 4 September 2026
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-[1180px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-8 items-start">
        {/* Sticky Table of Contents (Desktop) */}
        <aside className="hidden lg:block sticky top-24 bg-white/95 backdrop-blur-md border border-[#d7e8f0] rounded-[18px] p-5 shadow-sm max-h-[calc(100vh-120px)] overflow-y-auto">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#607786] mb-3 px-2">
            On this page
          </h3>
          <nav className="space-y-0.5 text-[13px] font-semibold">
            <a href="#intro" className="block px-2.5 py-1.5 rounded-lg text-[#607786] hover:text-[#0f6f8f] hover:bg-[#eef8ff] transition">
              About ANVAY
            </a>
            <a href="#information" className="block px-2.5 py-1.5 rounded-lg text-[#607786] hover:text-[#0f6f8f] hover:bg-[#eef8ff] transition">
              1. Information We Collect
            </a>
            <a href="#use" className="block px-2.5 py-1.5 rounded-lg text-[#607786] hover:text-[#0f6f8f] hover:bg-[#eef8ff] transition">
              2. How We Use Information
            </a>
            <a href="#access" className="block px-2.5 py-1.5 rounded-lg text-[#607786] hover:text-[#0f6f8f] hover:bg-[#eef8ff] transition">
              3. Who Can Access Information
            </a>
            <a href="#sharing" className="block px-2.5 py-1.5 rounded-lg text-[#607786] hover:text-[#0f6f8f] hover:bg-[#eef8ff] transition">
              4. Sharing of Health Information
            </a>
            <a href="#emergency" className="block px-2.5 py-1.5 rounded-lg text-[#607786] hover:text-[#0f6f8f] hover:bg-[#eef8ff] transition">
              5. Emergency Access
            </a>
            <a href="#security" className="block px-2.5 py-1.5 rounded-lg text-[#607786] hover:text-[#0f6f8f] hover:bg-[#eef8ff] transition">
              6. Data Storage & Security
            </a>
            <a href="#integrity" className="block px-2.5 py-1.5 rounded-lg text-[#607786] hover:text-[#0f6f8f] hover:bg-[#eef8ff] transition">
              7. Medical Record Integrity
            </a>
            <a href="#retention" className="block px-2.5 py-1.5 rounded-lg text-[#607786] hover:text-[#0f6f8f] hover:bg-[#eef8ff] transition">
              8. Data Retention
            </a>
            <a href="#deletion" className="block px-2.5 py-1.5 rounded-lg text-[#607786] hover:text-[#0f6f8f] hover:bg-[#eef8ff] transition">
              9. Account Deletion
            </a>
            <a href="#rights" className="block px-2.5 py-1.5 rounded-lg text-[#607786] hover:text-[#0f6f8f] hover:bg-[#eef8ff] transition">
              10. User Rights
            </a>
            <a href="#documents" className="block px-2.5 py-1.5 rounded-lg text-[#607786] hover:text-[#0f6f8f] hover:bg-[#eef8ff] transition">
              11. Patient Documents
            </a>
            <a href="#thirdparty" className="block px-2.5 py-1.5 rounded-lg text-[#607786] hover:text-[#0f6f8f] hover:bg-[#eef8ff] transition">
              12. Third-Party Services
            </a>
            <a href="#minors" className="block px-2.5 py-1.5 rounded-lg text-[#607786] hover:text-[#0f6f8f] hover:bg-[#eef8ff] transition">
              13. Minors
            </a>
            <a href="#storage" className="block px-2.5 py-1.5 rounded-lg text-[#607786] hover:text-[#0f6f8f] hover:bg-[#eef8ff] transition">
              14. Browser Storage
            </a>
            <a href="#incidents" className="block px-2.5 py-1.5 rounded-lg text-[#607786] hover:text-[#0f6f8f] hover:bg-[#eef8ff] transition">
              15. Security Incidents
            </a>
            <a href="#prototype" className="block px-2.5 py-1.5 rounded-lg text-[#b54708] hover:text-[#805b08] hover:bg-[#fff7e8] transition font-bold">
              16. Prototype Disclaimer
            </a>
            <a href="#changes" className="block px-2.5 py-1.5 rounded-lg text-[#607786] hover:text-[#0f6f8f] hover:bg-[#eef8ff] transition">
              17. Policy Changes
            </a>
            <a href="#contact" className="block px-2.5 py-1.5 rounded-lg text-[#607786] hover:text-[#0f6f8f] hover:bg-[#eef8ff] transition">
              18. Contact Us
            </a>
          </nav>
        </aside>

        {/* Content Column */}
        <div className="space-y-6">
          {/* Intro Section */}
          <section id="intro" className="bg-gradient-to-b from-white to-[#f9fdff] border border-[#d7e8f0] rounded-[20px] p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-black text-[#173042] mb-3">
              About ANVAY
            </h2>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed mb-3">
              ANVAY is a healthcare interoperability platform designed to connect authorized hospitals and healthcare professionals through a unified patient identity and longitudinal health-record system.
            </p>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed">
              This Privacy Policy describes the types of information that may be processed by ANVAY, why that information is used, who may receive access, and the safeguards intended to protect it.
            </p>
          </section>

          {/* Section 1 */}
          <section id="information" className="scroll-mt-24 bg-white border border-[#d7e8f0] rounded-[20px] p-6 sm:p-8 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#eef8ff] text-[#0f6f8f] font-black flex items-center justify-center mb-4 text-sm">
              1
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#173042] mb-4">
              Information We Collect
            </h2>

            <div className="space-y-4 text-sm sm:text-base">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0f5f7d] mb-2">Personal information</h3>
                <ul className="list-disc pl-6 space-y-1.5 text-[#173042]">
                  <li>Full name, date of birth and gender</li>
                  <li>Mobile number and email address</li>
                  <li>Profile photograph and basic contact information</li>
                  <li>Unique ANVAY Health ID</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0f5f7d] mb-2">Identity and verification information</h3>
                <ul className="list-disc pl-6 space-y-1.5 text-[#173042]">
                  <li>Aadhaar or other permitted identification details where required</li>
                  <li>Hospital registration and verification information</li>
                  <li>Doctor licence and professional verification details</li>
                  <li>Authorized staff verification information</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0f5f7d] mb-2">Healthcare information</h3>
                <ul className="list-disc pl-6 space-y-1.5 text-[#173042]">
                  <li>Medical history, diagnoses and hospital visits</li>
                  <li>Medicines, allergies and vaccination records</li>
                  <li>Prescriptions, reports and diagnostic information</li>
                  <li>Uploaded medical documents, images, PDF files or text records</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0f5f7d] mb-2">System and audit information</h3>
                <ul className="list-disc pl-6 space-y-1.5 text-[#173042]">
                  <li>Login and account activity</li>
                  <li>User role and authorization status</li>
                  <li>Record creation and update timestamps</li>
                  <li>Hospital or healthcare professional associated with an update</li>
                  <li>Emergency-access activity and other security logs</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="use" className="scroll-mt-24 bg-white border border-[#d7e8f0] rounded-[20px] p-6 sm:p-8 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#eef8ff] text-[#0f6f8f] font-black flex items-center justify-center mb-4 text-sm">
              2
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#173042] mb-3">
              How We Use Information
            </h2>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed mb-4">
              Information may be processed to operate ANVAY and provide connected healthcare functionality, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-[#173042]">
              <li>Creating and managing patient profiles and ANVAY Health IDs</li>
              <li>Maintaining longitudinal medical history across authorized hospitals</li>
              <li>Helping authorized healthcare professionals understand relevant previous health information</li>
              <li>Managing medical documents, medicines, allergies, vaccinations and reports</li>
              <li>Verifying hospitals, doctors and authorized healthcare staff</li>
              <li>Supporting controlled emergency access where required</li>
              <li>Maintaining audit trails, security records and accountability</li>
              <li>Providing permitted patient data export and portability features</li>
              <li>Generating authorized aggregated healthcare analytics</li>
              <li>Improving system reliability, usability and security</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="access" className="scroll-mt-24 bg-white border border-[#d7e8f0] rounded-[20px] p-6 sm:p-8 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#eef8ff] text-[#0f6f8f] font-black flex items-center justify-center mb-4 text-sm">
              3
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#173042] mb-3">
              Who Can Access Information
            </h2>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed mb-4">
              ANVAY uses role-based access. Authentication alone does not mean that a user can access every patient record.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4">
              <div className="border border-[#d7e8f0] bg-[#fbfeff] rounded-2xl p-4">
                <strong className="block text-[#0b5169] text-sm font-bold mb-1">Patient</strong>
                <p className="text-xs sm:text-sm text-[#607786] m-0">May view their own available profile and healthcare information.</p>
              </div>
              <div className="border border-[#d7e8f0] bg-[#fbfeff] rounded-2xl p-4">
                <strong className="block text-[#0b5169] text-sm font-bold mb-1">Doctor</strong>
                <p className="text-xs sm:text-sm text-[#607786] m-0">May access or update patient information only where permitted and authorized.</p>
              </div>
              <div className="border border-[#d7e8f0] bg-[#fbfeff] rounded-2xl p-4">
                <strong className="block text-[#0b5169] text-sm font-bold mb-1">Hospital Admin</strong>
                <p className="text-xs sm:text-sm text-[#607786] m-0">May manage hospital staff, doctors and authorized healthcare operations.</p>
              </div>
              <div className="border border-[#d7e8f0] bg-[#fbfeff] rounded-2xl p-4">
                <strong className="block text-[#0b5169] text-sm font-bold mb-1">Government / Admin</strong>
                <p className="text-xs sm:text-sm text-[#607786] m-0">May access permitted healthcare/network information, particularly authorized or aggregated information.</p>
              </div>
              <div className="border border-[#d7e8f0] bg-[#fbfeff] rounded-2xl p-4 sm:col-span-2">
                <strong className="block text-[#0b5169] text-sm font-bold mb-1">Super Admin</strong>
                <p className="text-xs sm:text-sm text-[#607786] m-0">May perform restricted platform administration, verification and security-related actions.</p>
              </div>
            </div>

            <div className="mt-4 border-l-4 border-[#18a999] bg-[#effbf8] p-4 rounded-xl text-xs sm:text-sm text-[#173042]">
              <strong>Access principle:</strong> Patient data access should depend on authentication, verification, role and authorization.
            </div>
          </section>

          {/* Section 4 */}
          <section id="sharing" className="scroll-mt-24 bg-white border border-[#d7e8f0] rounded-[20px] p-6 sm:p-8 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#eef8ff] text-[#0f6f8f] font-black flex items-center justify-center mb-4 text-sm">
              4
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#173042] mb-3">
              Sharing of Health Information
            </h2>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed mb-3">
              ANVAY is designed so that patient health information is not publicly exposed. Information may be shared only where necessary with:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm sm:text-base text-[#173042] mb-3">
              <li>Authorized healthcare professionals</li>
              <li>Verified hospitals participating in the healthcare network</li>
              <li>Authorized administrative roles</li>
              <li>Technology service providers needed to operate the platform</li>
              <li>Authorities where disclosure is legally required</li>
            </ul>
            <p className="text-sm sm:text-base font-semibold text-[#0f5f7d]">
              ANVAY does not intend to sell patient medical information.
            </p>
          </section>

          {/* Section 5 */}
          <section id="emergency" className="scroll-mt-24 bg-white border border-[#d7e8f0] rounded-[20px] p-6 sm:p-8 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#eef8ff] text-[#0f6f8f] font-black flex items-center justify-center mb-4 text-sm">
              5
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#173042] mb-3">
              Emergency / Break-Glass Access
            </h2>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed mb-3">
              During a genuine medical emergency, authorized healthcare personnel may receive controlled access to essential patient information needed to support urgent treatment.
            </p>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed mb-3">
              Emergency information may include identity details, important allergies, relevant medicines, major health conditions and other critical medical information.
            </p>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed mb-4">
              Emergency access should remain auditable and may record the user, hospital, date, time and reason for access where applicable.
            </p>
            <div className="border-l-4 border-[#18a999] bg-[#effbf8] p-4 rounded-xl text-xs sm:text-sm text-[#173042]">
              Emergency access should be limited to information reasonably required for the emergency and should not create unrestricted access to a patient's full record.
            </div>
          </section>

          {/* Section 6 */}
          <section id="security" className="scroll-mt-24 bg-white border border-[#d7e8f0] rounded-[20px] p-6 sm:p-8 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#eef8ff] text-[#0f6f8f] font-black flex items-center justify-center mb-4 text-sm">
              6
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#173042] mb-3">
              Data Storage & Security
            </h2>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed mb-3">
              ANVAY may use services such as Firebase Authentication, Cloud Firestore and Firebase Storage as part of its application infrastructure.
            </p>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed mb-4">
              Security measures implemented or designed for the platform may include authentication, role-based access control, Firestore security rules, hospital and doctor verification, access restrictions, audit logs, restricted administrative operations and versioned healthcare records.
            </p>
            <div className="border-l-4 border-[#18a999] bg-[#effbf8] p-4 rounded-xl text-xs sm:text-sm text-[#173042]">
              <strong>No absolute-security claim:</strong> ANVAY uses reasonable technical and organizational measures designed to protect information, but no electronic system can guarantee absolute security.
            </div>
          </section>

          {/* Section 7 */}
          <section id="integrity" className="scroll-mt-24 bg-white border border-[#d7e8f0] rounded-[20px] p-6 sm:p-8 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#eef8ff] text-[#0f6f8f] font-black flex items-center justify-center mb-4 text-sm">
              7
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#173042] mb-3">
              Medical Record Integrity
            </h2>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed mb-3">
              Healthcare records may use version history and record attribution to preserve accountability and continuity of care.
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm sm:text-base text-[#173042]">
              <li>Existing medical entries should not be silently overwritten.</li>
              <li>Corrections may preserve earlier information.</li>
              <li>Updates may store the creator, hospital and timestamp.</li>
              <li>Previous versions may be retained where necessary for traceability.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section id="retention" className="scroll-mt-24 bg-white border border-[#d7e8f0] rounded-[20px] p-6 sm:p-8 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#eef8ff] text-[#0f6f8f] font-black flex items-center justify-center mb-4 text-sm">
              8
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#173042] mb-3">
              Data Retention
            </h2>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed">
              Information may be retained for as long as reasonably necessary to provide healthcare functionality, maintain medical history, support security and audit requirements, preserve record integrity, or satisfy applicable legal obligations.
            </p>
          </section>

          {/* Section 9 */}
          <section id="deletion" className="scroll-mt-24 bg-white border border-[#d7e8f0] rounded-[20px] p-6 sm:p-8 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#eef8ff] text-[#0f6f8f] font-black flex items-center justify-center mb-4 text-sm">
              9
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#173042] mb-3">
              Account Deletion
            </h2>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed mb-3">
              Users may request deletion of their account where the feature is available. Account deletion does not necessarily mean that every healthcare record, audit record or legally required record can be immediately erased.
            </p>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed">
              Certain information may remain where necessary for healthcare continuity, fraud prevention, security, auditability, record integrity or legal obligations.
            </p>
          </section>

          {/* Section 10 */}
          <section id="rights" className="scroll-mt-24 bg-white border border-[#d7e8f0] rounded-[20px] p-6 sm:p-8 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#eef8ff] text-[#0f6f8f] font-black flex items-center justify-center mb-4 text-sm">
              10
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#173042] mb-3">
              User Rights
            </h2>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed mb-3">
              Depending on the functionality available and applicable requirements, users may be able to:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm sm:text-base text-[#173042] mb-3">
              <li>View their personal information and available medical records</li>
              <li>Request correction of inaccurate information</li>
              <li>Export available personal or healthcare information</li>
              <li>Report suspected unauthorized access</li>
              <li>Request account deletion</li>
              <li>Ask questions about privacy and data handling</li>
            </ul>
            <p className="text-xs sm:text-sm text-[#607786]">
              Some medical information may require correction through an authorized healthcare provider rather than direct patient editing.
            </p>
          </section>

          {/* Section 11 */}
          <section id="documents" className="scroll-mt-24 bg-white border border-[#d7e8f0] rounded-[20px] p-6 sm:p-8 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#eef8ff] text-[#0f6f8f] font-black flex items-center justify-center mb-4 text-sm">
              11
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#173042] mb-3">
              Patient Documents
            </h2>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed mb-3">
              ANVAY may allow authorized users to upload healthcare or identity-related documents, including medical reports, prescriptions, images, PDFs and permitted identification documents.
            </p>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed">
              Users should upload only information and documents they are authorized to provide.
            </p>
          </section>

          {/* Section 12 */}
          <section id="thirdparty" className="scroll-mt-24 bg-white border border-[#d7e8f0] rounded-[20px] p-6 sm:p-8 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#eef8ff] text-[#0f6f8f] font-black flex items-center justify-center mb-4 text-sm">
              12
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#173042] mb-3">
              Third-Party Services
            </h2>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed mb-3">
              ANVAY may rely on third-party infrastructure such as Firebase Authentication, Cloud Firestore, Firebase Storage and other hosting or technical services necessary to operate the platform.
            </p>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed">
              These providers may process limited information required to provide their services, subject to their own policies and technical controls.
            </p>
          </section>

          {/* Section 13 */}
          <section id="minors" className="scroll-mt-24 bg-white border border-[#d7e8f0] rounded-[20px] p-6 sm:p-8 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#eef8ff] text-[#0f6f8f] font-black flex items-center justify-center mb-4 text-sm">
              13
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#173042] mb-3">
              Information Relating to Minors
            </h2>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed">
              Where ANVAY is used for a minor, the healthcare provider, parent, guardian or other authorized person should ensure that the child's information is handled with the permissions and safeguards required in the relevant context.
            </p>
          </section>

          {/* Section 14 */}
          <section id="storage" className="scroll-mt-24 bg-white border border-[#d7e8f0] rounded-[20px] p-6 sm:p-8 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#eef8ff] text-[#0f6f8f] font-black flex items-center justify-center mb-4 text-sm">
              14
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#173042] mb-3">
              Cookies & Browser Storage
            </h2>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed">
              ANVAY may use browser storage, authentication persistence or similar technologies for purposes such as maintaining secure login sessions, remembering language preferences, storing basic application settings and supporting security functionality.
            </p>
          </section>

          {/* Section 15 */}
          <section id="incidents" className="scroll-mt-24 bg-white border border-[#d7e8f0] rounded-[20px] p-6 sm:p-8 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#eef8ff] text-[#0f6f8f] font-black flex items-center justify-center mb-4 text-sm">
              15
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#173042] mb-3">
              Security Incidents
            </h2>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed">
              Users should report suspected unauthorized access, data exposure or other security concerns through the platform's available support channel. Reported incidents should be reviewed and appropriate corrective action taken where necessary.
            </p>
          </section>

          {/* Section 16 - PROTOTYPE DISCLAIMER (Visibly Highlighted) */}
          <section id="prototype" className="scroll-mt-24 bg-[#fff7e8] border-2 border-[#f1cf83] rounded-[20px] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffebbe] text-[#805b08] font-black flex items-center justify-center text-sm">
                16
              </div>
              <div className="flex items-center gap-2 text-[#805b08] font-extrabold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Notice</span>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#805b08] mb-3">
              Important Prototype Disclaimer
            </h2>
            <p className="text-sm sm:text-base text-[#6b4703] leading-relaxed mb-3">
              <strong>ANVAY is currently a development/prototype project.</strong> It is intended for demonstration, academic, research or development purposes unless specifically deployed and approved for production use.
            </p>
            <p className="text-sm sm:text-base text-[#6b4703] leading-relaxed">
              The current version should not be represented as automatically certified or compliant with healthcare or privacy frameworks. Production deployment would require additional security, privacy, regulatory, clinical-safety, threat-modeling and compliance review.
            </p>
          </section>

          {/* Section 17 */}
          <section id="changes" className="scroll-mt-24 bg-white border border-[#d7e8f0] rounded-[20px] p-6 sm:p-8 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#eef8ff] text-[#0f6f8f] font-black flex items-center justify-center mb-4 text-sm">
              17
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#173042] mb-3">
              Changes to this Privacy Policy
            </h2>
            <p className="text-sm sm:text-base text-[#173042] leading-relaxed">
              This Privacy Policy may be updated when ANVAY features, security practices, data-processing activities or applicable requirements change. The latest revision date will be displayed near the top of this page.
            </p>
          </section>

          {/* Section 18 - Contact Us */}
          <section id="contact" className="scroll-mt-24 bg-gradient-to-br from-[#0d617d] to-[#148c8e] text-white rounded-[20px] p-8 sm:p-10 text-center shadow-lg shadow-[#0d617d]/20 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-white/15 text-white font-black flex items-center justify-center mx-auto text-sm">
              18
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Contact Us
            </h2>
            <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto leading-relaxed">
              If you have questions about this Privacy Policy, data handling or a suspected privacy issue, contact the ANVAY team through the project's official support channel.
            </p>
            <p className="text-sm sm:text-base text-white font-bold">
              Email: support@example.com
            </p>
            <div className="pt-2">
              <a
                href="mailto:support@example.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0b5169] rounded-xl font-extrabold text-sm hover:bg-[#eef8ff] transition shadow-md"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Support</span>
              </a>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-[#d7e8f0] bg-white">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-[#607786]">
          <div>© 2026 ANVAY — One Patient. One Health Identity. Connected Healthcare.</div>
          <div className="flex items-center gap-5 flex-wrap font-semibold">
            <Link to="/privacy-policy" className="hover:text-[#0f6f8f] transition text-[#0f6f8f]">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[#0f6f8f] transition">
              Terms of Service
            </Link>
            <a href="mailto:support@example.com" className="hover:text-[#0f6f8f] transition">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
