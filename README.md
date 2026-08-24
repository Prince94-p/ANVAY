🏥 ANVAY — Healthcare Interoperability Network

One Patient. One Health Identity. Connected Healthcare.

ANVAY is a secure healthcare interoperability platform designed to connect hospitals through a unified digital network.

The platform enables authorized healthcare institutions to securely access and update a patient’s longitudinal medical history, allowing medical information to remain available across different hospitals while maintaining accountability, verification, and access control.

⸻

🎯 Problem

Patient medical records are often fragmented across different hospitals.

When a patient visits another healthcare institution:

* Previous medical history may not be immediately available
* Tests may need to be repeated
* Important allergies or medications may be unknown
* Emergency treatment may lack critical information
* Records exist in different formats and systems

ANVAY aims to solve this by creating an interconnected hospital network with a unified patient identity.

⸻

💡 Solution

Every patient receives a unique ANVAY Health ID.

Example:

ANVAY-2026-8F29

This identity connects the patient’s healthcare records across authorized hospitals.

Hospital A
    │
    │ Creates / Updates Record
    ▼
┌───────────────────────────┐
│      ANVAY NETWORK        │
│                           │
│   Unified Patient Record  │
└───────────────────────────┘
    ▲                 ▲
    │                 │
Hospital B        Hospital C

When the patient visits another connected hospital, authorized healthcare professionals can access relevant previous records and add new medical information.

⸻

✨ Key Features

🪪 Unique ANVAY Health ID

Every patient receives one unique healthcare identity that connects their medical history across the network.

🏥 Hospital-to-Hospital Connectivity

Verified hospitals can securely access authorized patient records created by other hospitals.

👨‍⚕️ Doctor & Staff Management

Hospitals can manage doctors and authorized healthcare staff with role-based access.

✅ Hospital & Doctor Verification

Healthcare institutions and medical professionals can be verified before receiving access to sensitive healthcare functionality.

📋 Longitudinal Medical History

Patient records can include:

* Medical history
* Diagnoses
* Medicines
* Allergies
* Vaccinations
* Medical reports
* Hospital visits
* Uploaded medical documents

🔒 Immutable Medical History

Existing medical entries are not silently overwritten.

Corrections and updates preserve previous information to maintain traceability and accountability.

🏷️ Record Attribution

Medical records can identify:

* Hospital
* Healthcare professional
* Creation timestamp
* Record history

📄 Multi-format Medical Documents
 
The system supports medical information and documents in formats such as:

* PDF
* Images
* Text

🚨 Emergency / Break-Glass Access

Emergency workflows provide controlled access to critical patient information when required.

Emergency access is designed to remain auditable.

⚠️ Missing Record Indicators

ANVAY can highlight incomplete healthcare information such as:

Vaccination information missing
Last follow-up pending
Medical information incomplete

📤 Patient Data Export

Medical summaries can be generated for sharing or portability.

🏛️ Government Dashboard

Authorized government-level users can access healthcare analytics and relevant hospital/network information according to their permissions.

📊 Disease Analytics

Aggregated healthcare information can be visualized to assist with monitoring and analysis.

📝 Audit Logs

Important actions can be recorded for security, accountability, and traceability.

🗑️ Controlled Account Deletion

Account deletion can follow an approval workflow instead of immediately removing healthcare-related accounts and information.

⸻

👥 User Roles

ANVAY supports multiple role-based interfaces:

Role	Main Purpose
Patient	View personal healthcare information
Doctor	Access and update authorized patient records
Hospital	Manage doctors, patients and healthcare records
Government	View authorized healthcare/network analytics
Super Admin	Platform administration and verification

⸻

🔐 Security Principles

ANVAY is designed around:

* Role-Based Access Control
* Firebase Authentication
* Firestore Security Rules
* Hospital verification
* Doctor verification
* Controlled emergency access
* Audit logging
* Immutable/versioned medical records
* Restricted administrative operations

Note: ANVAY is currently a development/prototype project. Production healthcare deployment would require additional security, privacy, regulatory, clinical-safety, threat-modeling, and compliance review.

⸻

🛠️ Technology Stack

Frontend

* React 18
* Vite
* Tailwind CSS
* React Router
* Lucide React
* Recharts
* jsPDF

Backend & Cloud

* Node.js
* Express.js
* Firebase
* Firebase Authentication
* Cloud Firestore
* Firebase Storage
* Firebase Cloud Functions

Internationalization

* i18next
* react-i18next
* Browser Language Detection

⸻

📂 Project Structure

ANVAY/
│
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── firebase.js
│   └── ...
│
├── server/
│   └── server.js
│
├── functions/
│   ├── index.js
│   └── package.json
│
├── .env.example
├── firebase.json
├── firestore.rules
├── storage.rules
├── package.json
├── tailwind.config.js
├── vite.config.js
└── index.html

⸻

🚀 Getting Started

1. Clone Repository

git clone https://github.com/Prince94-p/ANVAY.git
cd ANVAY

2. Install Dependencies

npm install

Install Firebase Functions dependencies:

cd functions
npm install
cd ..

3. Configure Environment Variables

Copy the example environment file:

cp .env.example .env.local

Add your Firebase configuration to .env.local:

VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"

Never commit .env.local containing your local environment configuration.

⸻

▶️ Run Development Server

Run frontend and backend together:

npm run dev

Development services will start using the project’s configured Vite and Express ports.

You can also run them separately:

npm run client

and:

npm run server

⸻

🏗️ Build

Create a production frontend build:

npm run build

Preview the production build:

npm run preview

⸻

🔄 Healthcare Record Flow

Patient Registration
        │
        ▼
ANVAY Health ID Generated
        │
        ▼
Patient Visits Hospital A
        │
        ▼
Medical Record Created
        │
        ▼
ANVAY Longitudinal Record
        │
        ▼
Patient Visits Hospital B
        │
        ▼
Verified Identity / ANVAY ID
        │
        ▼
Authorized History Access
        │
        ▼
New Check-up Added
        │
        ▼
Updated Longitudinal History

⸻

🔮 Vision

ANVAY aims to demonstrate how healthcare institutions can move from isolated medical records toward a connected healthcare ecosystem.

One Patient
     ↓
One Health Identity
     ↓
Multiple Authorized Hospitals
     ↓
One Connected Medical History

The goal is simple:

Right information. Right hospital. Right time.

⸻

👨‍💻 Development

Developed as part of the ANVAY / NEXUS Healthcare Network project.

Repository:

Prince94-p/ANVAY

⸻

⚠️ Disclaimer

ANVAY is currently a prototype/development project and should not be treated as a production clinical system.

Real-world healthcare deployment requires appropriate security testing, privacy safeguards, regulatory compliance, clinical validation, infrastructure hardening, and authorization controls.

⸻

<p align="center">
  <strong>ANVAY Healthcare Network</strong><br>
  Connecting Healthcare. Preserving History. Improving Access.
</p>
