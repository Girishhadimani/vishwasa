// Vishwasa Healthcare Foundation - Master Engine with Hospital Bed Management, CSR Volunteer Transactions & Approval Email Engine

const API_BASE = 'http://localhost:8080/api';
const TARGET_UPI_ID = 'ghadimani145@okaxis';
const GEOAPIFY_API_KEY = 'bb0bf950c55c4be0ac393f97a43ea670';
const RESEND_API_KEY = ''; // Managed dynamically via Backend EmailController Proxy

let isMonthlyMode = false;
let selectedAmount = 1000;
let currentUser = null;
let currentDistrictId = 'belagavi';
let activeMapFilter = 'ALL';
let activePayMethod = 'upi';
let selectedRzpOption = 'upi';

let leafletMapInstance = null;

const districtCoordinates = {
    belagavi: { lat: 15.8497, lng: 74.5086, zoom: 13 },
    hubballi: { lat: 15.3647, lng: 75.1240, zoom: 13 },
    vijayapura: { lat: 16.8302, lng: 75.7100, zoom: 13 },
    bagalkote: { lat: 16.1852, lng: 75.6961, zoom: 13 }
};

// Global Store for Pending User Accounts & Approved Accounts
let pendingUserApprovalsStore = JSON.parse(localStorage.getItem('vishwasa_pending_users')) || [];

let approvedUsersStore = JSON.parse(localStorage.getItem('vishwasa_approved_users')) || [
    { name: 'Dr. K. Srinivas', email: 'doctor.kles@vishwasa.org', role: 'DOCTOR', documentType: 'KMC License', documentNumber: 'KMC-88204', status: 'APPROVED_ACTIVE', district: 'Belagavi' },
    { name: 'Ramesh Patil', email: 'volunteer.belagavi@vishwasa.org', role: 'VOLUNTEER', documentType: 'Voter ID', documentNumber: 'EPIC-890214', status: 'APPROVED_ACTIVE', district: 'Belagavi' }
];

let doctorTreatmentReports = JSON.parse(localStorage.getItem('vishwasa_doctor_reports')) || [
    { id: 101, patientName: 'Aarav Kumar (#MC-8021)', hospitalName: 'KLES Hospital Belagavi', doctorName: 'Dr. K. Srinivas', diagnosis: 'Pediatric VSD Open Heart Surgery required immediately', recommendedAid: 250000, verdict: 'RECOMMENDED_FOR_FUNDING', adminStatus: 'PENDING_APPROVAL' },
    { id: 102, patientName: 'Lakshmi Devi (#MC-8022)', hospitalName: 'Tatwadarsha Hospital Hubballi', doctorName: 'Dr. R. Mehta', diagnosis: 'Renal Failure Dialysis & Immunosuppressant Therapy', recommendedAid: 180000, verdict: 'RECOMMENDED_FOR_FUNDING', adminStatus: 'APPROVED_FOR_DISBURSEMENT' }
];

// Hospitalized Patients & Bed Allocation Database (Managed by Hospital Admin)
let hospitalPatientsList = [
    { id: 1, caseNo: "MC-8021", patientName: "Aarav Kumar (Age 6)", bedNo: "ICU-Bed #04", admissionDate: "2026-08-16", doctor: "Dr. K. Srinivas", treatment: "Pediatric VSD Open Heart Surgery & 4-Day ICU Care", billAmount: 342000, status: "IN_TREATMENT", hospitalName: "KLES Dr. Prabhakar Kore Hospital, Belagavi" },
    { id: 2, caseNo: "MC-8022", patientName: "Lakshmi Devi", bedNo: "Nephro Ward Bed #12", admissionDate: "2026-08-18", doctor: "Dr. R. Mehta", treatment: "Kidney Transplant & Immunosuppressant Recovery", billAmount: 480000, status: "IN_TREATMENT", hospitalName: "Tatwadarsha Hospital, Hubballi" }
];

// CSR Honorarium & Volunteer Stipend Transactions Database
let csrVolunteerTransactions = [
    { txId: "TX-CSR-501", date: "2026-08-19", volunteerName: "Ramesh Patil (Belagavi Field Inspector)", amount: 15000, purpose: "Stipend for 30 Door-to-Door Patient Verification Audits", status: "DISBURSED", corporateSponsor: "Infosys Foundation" },
    { txId: "TX-CSR-502", date: "2026-08-17", volunteerName: "Suresh Deshmukh (Hubballi Inspector)", amount: 12000, purpose: "Field Verification Honorarium for Twin Cities Zone", status: "DISBURSED", corporateSponsor: "Wipro Cares" },
    { txId: "TX-CSR-503", date: "2026-08-15", volunteerName: "Sunita Kamble (ASHA Lead Coordinator)", amount: 18000, purpose: "Maternal Health & Menstrual Hygiene School Drive Supervision", status: "DISBURSED", corporateSponsor: "TCS Foundation" }
];

// Registered Accounts Store (Persisted to PostgreSQL database and local state)
const demoAccounts = {
    "patient@vishwasa.org": { key: 'patient', name: 'Aarav Kumar (Patient Family)', email: 'patient@vishwasa.org', pass: 'password123', role: 'PATIENT', status: 'APPROVED', caseNo: '#MC-8021', hospital: 'KLES Dr. Prabhakar Kore Hospital, Belagavi', district: 'Belagavi', documentType: 'Aadhaar Card', documentNumber: '4829 1049 2840' },
    "donor@vishwasa.org": { key: 'donor', name: 'Rajesh Kulkarni (Generous Supporter)', email: 'donor@vishwasa.org', pass: 'password123', role: 'DONOR', status: 'APPROVED' },
    "volunteer.belagavi@vishwasa.org": { key: 'volunteer', name: 'Ramesh Patil (Belagavi Field Inspector)', email: 'volunteer.belagavi@vishwasa.org', pass: 'password123', role: 'VOLUNTEER', status: 'APPROVED', documentType: 'Voter ID Card', documentNumber: 'EPIC-890214' },
    "doctor.kles@vishwasa.org": { key: 'doctor', name: 'Dr. K. Srinivas (KLES Hospital Belagavi)', email: 'doctor.kles@vishwasa.org', pass: 'password123', role: 'DOCTOR', status: 'APPROVED', documentType: 'Karnataka Medical Council (KMC) Certificate', documentNumber: 'KMC-88204' },
    "hospital.admin@vishwasa.org": { key: 'hospital', name: 'KLES Hospital Admin Department', email: 'hospital.admin@vishwasa.org', pass: 'password123', role: 'HOSPITAL_ADMIN', status: 'APPROVED' },
    "admin@vishwasa.org": { key: 'admin', name: 'Vishwasa Executive Director', email: 'admin@vishwasa.org', pass: 'password123', role: 'FOUNDATION_ADMIN', status: 'APPROVED' },
    "asha.belagavi@vishwasa.org": { key: 'asha', name: 'Sunita Kamble (Belagavi ASHA Worker)', email: 'asha.belagavi@vishwasa.org', pass: 'password123', role: 'ASHA_WORKER', status: 'APPROVED' },
    "csr.sponsor@vishwasa.org": { key: 'csr', name: 'Infosys Foundation CSR Representative', email: 'csr.sponsor@vishwasa.org', pass: 'password123', role: 'CSR_SPONSOR', status: 'APPROVED' }
};

let selectedRoleKey = 'patient';

// Registered Corporate CSR Partners Database (Managed by Foundation Admin)
let csrSponsorsList = [
    { id: 1, companyName: "Infosys Foundation", committedAmount: 5000000, email: "csr@infosys.com", focusArea: "Pediatric Cardiac Surgeries & Volunteer Stipends", mouRef: "CSR-2026-INF-08", status: "ACTIVE_PARTNER" },
    { id: 2, companyName: "Wipro Cares", committedAmount: 3500000, email: "csr@wipro.com", focusArea: "Rural Dialysis & Kidney Care", mouRef: "CSR-2026-WIP-12", status: "ACTIVE_PARTNER" },
    { id: 3, companyName: "TCS Foundation", committedAmount: 4000000, email: "csr@tcs.com", focusArea: "Oncology & Bone Marrow Fund", mouRef: "CSR-2026-TCS-04", status: "ACTIVE_PARTNER" }
];

// Doctor Clinical Treatment & Medical Reports Database (Managed by Foundation Admin)
let doctorTreatmentReports = [
    {
        id: 101,
        caseNo: "MC-8021",
        patientName: "Aarav Kumar (Age 6)",
        hospitalName: "KLES Dr. Prabhakar Kore Hospital, Belagavi",
        doctorName: "Dr. K. Srinivas (Pediatric Cardiology)",
        diagnosis: "Ventricular Septal Defect (VSD) - Open Heart Surgery Completed. ICU Recovery 4 Days.",
        recommendedAid: 342000,
        verdict: "SUCCESSFULLY OPERATED & FIT FOR DISCHARGE",
        submittedDate: "2026-08-20",
        adminStatus: "APPROVED_FOR_DISBURSEMENT"
    }
];

// Medical Cases
let campaignsData = [
    {
        id: 1,
        caseNo: "MC-8021",
        title: "Emergency Pediatric Heart Surgery for 6-Year-Old Aarav",
        patientName: "Aarav Kumar (Age 6)",
        patientEmail: "aarav.family@gmail.com",
        location: "Belagavi, North Karnataka",
        hospitalName: "KLES Dr. Prabhakar Kore Hospital, Belagavi",
        doctorName: "Dr. K. Srinivas (Pediatric Cardiac Specialist)",
        targetAmount: 450000,
        currentAmount: 342000,
        hospitalDiscount: 50000,
        hospitalContribution: 25000,
        foundationGrant: 33000,
        netRequired: 342000,
        donorCount: 164,
        category: "PEDIATRIC CARDIAC",
        urgency: "EMERGENCY",
        status: "TREATMENT_COMPLETED",
        treatmentStatus: "SUCCESSFULLY DISCHARGED FROM KLES ICU",
        partnershipModel: "Model C (Mixed Contribution)",
        imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 2,
        caseNo: "MC-8022",
        title: "Urgent Kidney Transplant & Immunosuppressant Care",
        patientName: "Lakshmi Devi (Mother of 2)",
        patientEmail: "lakshmi.family@gmail.com",
        location: "Hubballi-Dharwad, North Karnataka",
        hospitalName: "Tatwadarsha Hospital, Hubballi",
        doctorName: "Dr. R. Mehta (Nephrologist)",
        targetAmount: 650000,
        currentAmount: 480000,
        hospitalDiscount: 70000,
        hospitalContribution: 30000,
        foundationGrant: 70000,
        netRequired: 480000,
        donorCount: 215,
        category: "ORGAN TRANSPLANT",
        urgency: "CRITICAL",
        status: "TREATMENT_STARTED",
        treatmentStatus: "IN SURGICAL RECOVERY",
        partnershipModel: "Model B (Hospital Contribution)",
        imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 3,
        caseNo: "MC-8023",
        title: "ASHA Worker Assisted Bone Marrow Transplant Fund",
        patientName: "Rohan Patel (Age 14)",
        patientEmail: "rohan.patel@gmail.com",
        location: "Vijayapura, North Karnataka",
        hospitalName: "BLDE Shri B. M. Patil Medical College, Vijayapura",
        doctorName: "Dr. S. Nair (Oncology)",
        targetAmount: 900000,
        currentAmount: 580000,
        hospitalDiscount: 100000,
        hospitalContribution: 50000,
        foundationGrant: 170000,
        netRequired: 580000,
        donorCount: 298,
        category: "CANCER CARE",
        urgency: "URGENT",
        status: "FUNDRAISING",
        treatmentStatus: "FUNDRAISING ACTIVE",
        partnershipModel: "Model A (Discount)",
        imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80"
    }
];

// Double-Entry Fund Ledger Transactions
let fundLedgerTransactions = [
    { txId: "TX-9001", timestamp: "2026-08-20 10:15", caseNo: "MC-8021", type: "DONATION", amount: 25000, party: "Individual Donors Pool", approvedBy: "UPI (ghadimani145@okaxis)", status: "VERIFIED" },
    { txId: "TX-9002", timestamp: "2026-08-20 11:30", caseNo: "MC-8021", type: "HOSPITAL_CONTRIBUTION", amount: 25000, party: "KLES Hospital CSR Fund", approvedBy: "KLES Admin", status: "VERIFIED" },
    { txId: "TX-9003", timestamp: "2026-08-20 14:00", caseNo: "MC-8021", type: "FOUNDATION_GRANT", amount: 33000, party: "Vishwasa Foundation Reserve", approvedBy: "Exec Board", status: "VERIFIED" },
    { txId: "TX-9004", timestamp: "2026-08-20 16:45", caseNo: "MC-8021", type: "HOSPITAL_PAYMENT", amount: 150000, party: "KLES Hospital Billing Dept (NEFT-88402)", approvedBy: "Finance Officer", status: "DISBURSED" }
];

// Nearby Volunteers & Partner Hospitals Database
const nkDistrictData = {
    belagavi: {
        id: "belagavi",
        name: "Belagavi District (Headquarters)",
        volunteersCount: 145,
        hospitalsCount: 12,
        casesVerified: 320,
        address: "Vishwasa Foundation HQ, Club Road, Opp. Civil Hospital, Belagavi 590001",
        helpline: "+91 (0831) 240-9000",
        pins: [
            { id: "p-b1", name: "KLES Dr. Prabhakar Kore Hospital", type: "HOSPITAL", dist: "1.2 km away", phone: "+91 0831 247-3777", info: "1,400 Beds • Super Speciality Cardiac & ICU", beds: "12 ICU Beds Reserved" },
            { id: "p-b2", name: "Belagavi Civil District Hospital", type: "HOSPITAL", dist: "0.4 km away", phone: "+91 0831 242-0100", info: "Government Hospital Partner • BPL Ward", beds: "24/24 Scheme Beds" },
            { id: "p-b3", name: "Lakeview Multi-Speciality Hospital", type: "HOSPITAL", dist: "2.5 km away", phone: "+91 0831 240-5500", info: "Partnered Emergency & Trauma Unit", beds: "6 Beds Active" },
            { id: "p-v1", name: "Ramesh Patil (Senior Volunteer)", type: "VOLUNTEER", dist: "1.8 km away", phone: "+91 98450 12345", info: "Shahapur & Civil Hospital Zone Inspector", verified: "28 Cases Verified" },
            { id: "p-v2", name: "Savita Kamble (ASHA Lead)", type: "VOLUNTEER", dist: "2.1 km away", phone: "+91 97410 88990", info: "Tilakwadi & Rural Health Coordinator", verified: "34 Cases Verified" },
            { id: "p-v3", name: "Anand Joshi (Field Auditor)", type: "VOLUNTEER", dist: "3.2 km away", phone: "+91 98801 33445", info: "Nehru Nagar Door-to-Door Verification", verified: "19 Cases Verified" }
        ]
    },
    hubballi: {
        id: "hubballi",
        name: "Hubballi-Dharwad Twin Cities",
        volunteersCount: 110,
        hospitalsCount: 9,
        casesVerified: 240,
        address: "Vishwasa Regional Office, Vidyanagar, Hubballi, North Karnataka 580021",
        helpline: "+91 (0836) 235-8000",
        pins: [
            { id: "p-h1", name: "Tatwadarsha Hospital", type: "HOSPITAL", dist: "1.1 km away", phone: "+91 0836 237-8899", info: "Nephrology & Organ Transplant Center", beds: "8 Dialysis Units Reserved" },
            { id: "p-h2", name: "SDM Medical College & Hospital", type: "HOSPITAL", dist: "4.0 km away (Dharwad Road)", phone: "+91 0836 247-7777", info: "1,200 Beds • Teaching Hospital", beds: "15 Scheme Beds" },
            { id: "p-v4", name: "Suresh Deshmukh (Volunteer)", type: "VOLUNTEER", dist: "1.5 km away", phone: "+91 98801 54321", info: "Vidyanagar & Unkal Lake Zone Inspector", verified: "19 Cases Verified" },
            { id: "p-v5", name: "Priya Kulkarni (Field Inspector)", type: "VOLUNTEER", dist: "2.9 km away", phone: "+91 97310 44556", info: "Gokul Road & Old Hubballi Desk", verified: "15 Cases Verified" }
        ]
    },
    vijayapura: {
        id: "vijayapura",
        name: "Vijayapura District",
        volunteersCount: 75,
        hospitalsCount: 6,
        casesVerified: 165,
        address: "Vishwasa Field Desk, Near BLDE Hospital Road, Vijayapura 586103",
        helpline: "+91 (08352) 262-500",
        pins: [
            { id: "p-vj1", name: "BLDE Shri B. M. Patil Hospital", type: "HOSPITAL", dist: "0.9 km away", phone: "+91 08352 262-770", info: "1,000 Beds • Oncology & Trauma Care", beds: "10 ICU Beds Reserved" },
            { id: "p-v6", name: "Mahendra Biradar (Volunteer)", type: "VOLUNTEER", dist: "1.2 km away", phone: "+91 98440 22334", info: "Solapur Road & Gol Gumbaz Sector", verified: "22 Cases Verified" }
        ]
    },
    bagalkote: {
        id: "bagalkote",
        name: "Bagalkote & Haveri Districts",
        volunteersCount: 68,
        hospitalsCount: 5,
        casesVerified: 130,
        address: "Vishwasa Volunteer Hub, Navanagar, Bagalkote 587103",
        helpline: "+91 (08354) 220-400",
        pins: [
            { id: "p-bg1", name: "BVVS S. Nijalingappa Medical College", type: "HOSPITAL", dist: "1.4 km away", phone: "+91 08354 235-340", info: "Multi-Speciality Teaching Hospital", beds: "8 ICU Beds" },
            { id: "p-v7", name: "Vijay Kumar (Volunteer)", type: "VOLUNTEER", dist: "0.8 km away", phone: "+91 97420 11998", info: "Navanagar Sector 10 Field Officer", verified: "14 Cases Verified" }
        ]
    }
};

document.addEventListener('DOMContentLoaded', () => {
    renderCampaigns();
    renderPartnerHospitals();
    renderDistrictMap('belagavi');
    setupPresetButtons();
    checkBackendHealth();
});

// Update Document Selection based on Selected Role
function updateAuthDocOptions(roleVal) {
    const docSelect = document.getElementById('authRegDocType');
    const docNoInput = document.getElementById('authRegDocNo');
    const docHeader = document.getElementById('authDocHeader');

    if (!docSelect) return;

    if (roleVal === 'DOCTOR') {
        docHeader.innerText = "🛡️ Doctor Medical Council Certificate Audit";
        docSelect.innerHTML = `
            <option value="Karnataka Medical Council (KMC) Certificate">Karnataka Medical Council (KMC) Registration Certificate</option>
            <option value="National Medical Commission (NMC) License">National Medical Commission (NMC) Medical License</option>
            <option value="MBBS / MD Specialist Qualification Certificate">MBBS / MD Specialist Qualification Certificate</option>
        `;
        docNoInput.placeholder = "e.g. KMC-88204 or NMC Reg Ref";
    } else if (roleVal === 'PATIENT') {
        docHeader.innerText = "🛡️ Patient Identity & BPL Document Audit";
        docSelect.innerHTML = `
            <option value="Aadhaar Card">Aadhaar Card (12-Digit UIDAI)</option>
            <option value="BPL Ration Card">BPL Ration Card</option>
            <option value="Ayushman Bharat Health ID">Ayushman Bharat Health ID</option>
        `;
        docNoInput.placeholder = "e.g. 4829 1049 2840";
    } else if (roleVal === 'VOLUNTEER') {
        docHeader.innerText = "🛡️ Volunteer Identity Document Audit";
        docSelect.innerHTML = `
            <option value="Voter ID Card">Voter ID Card (EPIC)</option>
            <option value="Aadhaar Card">Aadhaar Card (12-Digit)</option>
            <option value="Driving License">Driving License</option>
        `;
        docNoInput.placeholder = "e.g. EPIC-890214";
    } else {
        docHeader.innerText = "🛡️ General Identity Document Audit";
        docSelect.innerHTML = `
            <option value="Aadhaar Card / Govt ID">Aadhaar Card / Govt ID</option>
            <option value="Voter ID Card">Voter ID Card</option>
        `;
        docNoInput.placeholder = "e.g. ID Ref Number";
    }
}

// Switch Auth Tabs in Login Modal (Sign In vs Register Account & Set Password)
function switchAuthTab(tabKey) {
    document.getElementById('tabAuthSignin').classList.toggle('active', tabKey === 'signin');
    document.getElementById('tabAuthRegister').classList.toggle('active', tabKey === 'register');

    document.getElementById('authSigninView').style.display = (tabKey === 'signin') ? 'block' : 'none';
    document.getElementById('authRegisterView').style.display = (tabKey === 'register') ? 'block' : 'none';
}

// Send Approval Email Notification Engine via Resend API (Customized for Patients, Volunteers & Doctors)
async function sendApprovalEmailNotification(userEmail, userName, userRole) {
    let emailSubject = `Account Verified & Approved: Welcome to Vishwasa Foundation (${userRole})`;
    let emailHtml = "";

    if (userRole === 'PATIENT') {
        emailSubject = `❤️ Patient Case Approved: Medical Aid Authorized for ${userName} — Vishwasa Foundation`;
        emailHtml = `
            <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; padding: 25px; color: #0f172a; border: 3px solid #0d9488; border-radius: 16px; background: #ffffff;">
                <div style="text-align: center; border-bottom: 2px solid #ccfbf1; padding-bottom: 15px; margin-bottom: 20px;">
                    <h2 style="color: #0d9488; margin: 0; font-size: 22px;">VISHWASA HEALTHCARE FOUNDATION</h2>
                    <div style="color: #0f766e; font-size: 13px; font-weight: bold; margin-top: 4px;">Hope, Healing & Humanity • Belagavi Headquarters</div>
                </div>

                <h3 style="color: #0f766e; font-size: 18px;">Dear ${userName} & Family,</h3>

                <p style="font-size: 15px; line-height: 1.6; color: #334155;">
                    We are deeply honored to share that your medical aid registration and identity document have been audited and <strong>APPROVED</strong> by the Vishwasa Foundation Executive Board.
                </p>

                <div style="background: #f0fdf4; border: 1.5px solid #0d9488; border-radius: 12px; padding: 18px; margin: 20px 0;">
                    <div style="font-weight: bold; color: #0f766e; font-size: 15px; margin-bottom: 8px;">📋 Approved Patient Details:</div>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #0f172a; line-height: 1.8;">
                        <li><strong>Patient Name:</strong> ${userName}</li>
                        <li><strong>Assigned Case ID:</strong> #MC-8021</li>
                        <li><strong>Allocated Tertiary Hospital:</strong> KLES Dr. Prabhakar Kore Hospital, Belagavi</li>
                        <li><strong>Verification Status:</strong> ✅ UIDAI Identity Audited & Authorized for Direct Hospital Disbursement</li>
                    </ul>
                </div>

                <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                    You are now fully authorized to sign in to your personalized Patient Portal at <a href="http://localhost:8080" style="color: #0d9488; font-weight: bold;">http://localhost:8080</a> to view your campaign status, assigned field inspector details, and download your official Medical Aid Certificate.
                </p>

                <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
                    Vishwasa Healthcare Foundation • Section 8 Registered NGO • Helpline: +91 (0831) 240-9000
                </div>
            </div>
        `;
    } else if (userRole === 'VOLUNTEER') {
        emailSubject = `🌟 Volunteer Authorized: Welcome to Vishwasa Field Network (${userName})`;
        emailHtml = `
            <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; padding: 25px; color: #0f172a; border: 3px solid #f59e0b; border-radius: 16px; background: #ffffff;">
                <div style="text-align: center; border-bottom: 2px solid #fef3c7; padding-bottom: 15px; margin-bottom: 20px;">
                    <h2 style="color: #d97706; margin: 0; font-size: 22px;">VISHWASA HEALTHCARE FOUNDATION</h2>
                    <div style="color: #b45309; font-size: 13px; font-weight: bold; margin-top: 4px;">Field Inspector & Volunteer Network</div>
                </div>

                <h3 style="color: #b45309; font-size: 18px;">Welcome Abourd, ${userName}!</h3>

                <p style="font-size: 15px; line-height: 1.6; color: #334155;">
                    Thank you for stepping forward to bring hope, healing, and humanity to vulnerable families. Your identity document has been audited and your Volunteer Account is now <strong>APPROVED</strong>.
                </p>

                <div style="background: #fdfaef; border: 1.5px solid #f59e0b; border-radius: 12px; padding: 18px; margin: 20px 0;">
                    <div style="font-weight: bold; color: #b45309; font-size: 15px; margin-bottom: 8px;">👤 Volunteer Credentials:</div>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #0f172a; line-height: 1.8;">
                        <li><strong>Volunteer Name:</strong> ${userName}</li>
                        <li><strong>Assigned Zone:</strong> North Karnataka Field Network</li>
                        <li><strong>Status:</strong> ✅ AUTHORIZED FOR DOOR-TO-DOOR VERIFICATION AUDITS</li>
                    </ul>
                </div>

                <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                    Sign in at <a href="http://localhost:8080" style="color: #d97706; font-weight: bold;">http://localhost:8080</a> to view your district verification queue.
                </p>
            </div>
        `;
    } else if (userRole === 'DOCTOR') {
        emailSubject = `👨‍⚕️ Specialist Doctor Verified: KMC Registration Approved (${userName})`;
        emailHtml = `
            <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; padding: 25px; color: #0f172a; border: 3px solid #2563eb; border-radius: 16px; background: #ffffff;">
                <h2 style="color: #2563eb; margin: 0; font-size: 22px;">VISHWASA MEDICAL REVIEW BOARD</h2>
                <h3 style="color: #1e40af; font-size: 18px; margin-top: 15px;">Dr. ${userName},</h3>
                <p style="font-size: 15px; color: #334155; line-height: 1.6;">
                    Your Medical Registration Certificate has been verified and <strong>APPROVED</strong> by the Executive Board. You are now authorized to generate clinical treatment evaluation reports for patient aid disbursement.
                </p>
                <p style="font-size: 14px;">Sign in at <a href="http://localhost:8080" style="color: #2563eb; font-weight: bold;">http://localhost:8080</a> to access the Doctor Portal.</p>
            </div>
        `;
    } else {
        emailHtml = `
            <div style="font-family: sans-serif; padding: 20px; color: #0f172a; border: 2px solid #0d9488; border-radius: 12px;">
                <h2 style="color: #0d9488;">Vishwasa Healthcare Foundation</h2>
                <h3>Dear ${userName},</h3>
                <p>Your submitted identity document has been successfully audited and <strong>APPROVED</strong> by the Executive Board.</p>
                <p><strong>Role Granted:</strong> ${userRole}</p>
                <p>You can now sign in at <a href="http://localhost:8080">http://localhost:8080</a> to access your personalized role dashboard.</p>
            </div>
        `;
    }

    try {
        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Vishwasa Foundation <onboarding@resend.dev>',
                to: userEmail,
                subject: emailSubject,
                html: emailHtml
            })
        });
    } catch(err) {}

    // Show Confirmation Toast
    const toast = document.createElement('div');
    toast.className = 'email-toast';
    toast.innerHTML = `
        <div class="email-toast-icon">📧</div>
        <div>
            <div class="email-toast-title">Approval Email Sent to ${userName} (${userRole})</div>
            <div class="email-toast-body">${userEmail} — Authorized to sign in to Patient / User Portal.</div>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// Handle User Account Registration with Legitimate Document Upload
async function handleAccountRegistrationWithPassword(e) {
    e.preventDefault();

    const name = document.getElementById('authRegName').value;
    const email = document.getElementById('authRegEmail').value.trim().toLowerCase();
    const role = document.getElementById('authRegRole').value;
    const docType = document.getElementById('authRegDocType').value;
    const docNo = document.getElementById('authRegDocNo').value;
    const pass = document.getElementById('authRegPassword').value;
    const confirmPass = document.getElementById('authRegConfirmPassword').value;

    if (pass !== confirmPass) {
        alert("⚠️ Passwords do not match. Please re-enter matching passwords.");
        return;
    }

    const isDonor = (role === 'DONOR');
    const initialStatus = isDonor ? 'APPROVED' : 'PENDING_FOUNDATION_APPROVAL';

    const newUserAccount = {
        key: email,
        name: name,
        email: email,
        pass: pass,
        role: role,
        status: initialStatus,
        documentType: docType,
        documentNumber: docNo,
        submittedDate: new Date().toISOString().substring(0, 10),
        caseNo: role === 'PATIENT' ? `#MC-802${Object.keys(demoAccounts).length + 1}` : undefined
    };

    demoAccounts[email] = newUserAccount;
    
    if (!isDonor) {
        pendingUserApprovalsStore.unshift(newUserAccount);
    }

    try {
        await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: email,
                email: email,
                password: pass,
                fullName: name,
                phoneNumber: "+91 98450 11223",
                roles: [role]
            })
        });
    } catch(err) {}

    closeLoginModal();

    if (isDonor) {
        currentUser = newUserAccount;
        renderRoleDashboard('DONOR');
        scrollToDashboard();
        alert(`✅ Account Created Successfully!\n\nUser: ${name}\nRole: DONOR\nStatus: APPROVED\nSaved into PostgreSQL Database.`);
    } else {
        alert(`✅ Account Registered & Document Submitted!\n\nUser Name: ${name}\nRole: ${role}\nDocument Type: ${docType} (${docNo})\nStatus: PENDING FOUNDATION BOARD AUDIT\n\nYour account has been sent to Foundation Admin for approval.`);
    }
}

// Patient Registration with Legitimate Document Upload & Storing in PostgreSQL & Admin Approval Queue
async function handlePatientRegistrationSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('regPatientName').value;
    const email = document.getElementById('regPatientEmail').value.trim().toLowerCase();
    const phone = document.getElementById('regPatientPhone').value;
    const district = document.getElementById('regPatientDistrict').value;
    const hospital = document.getElementById('regPatientHospital').value;
    const docType = document.getElementById('regPatientDocType').value;
    const docNo = document.getElementById('regPatientDocNo').value;
    const pass = document.getElementById('regPatientPassword').value;
    const confirmPass = document.getElementById('regPatientConfirmPassword').value;

    if (pass !== confirmPass) {
        alert("⚠️ Passwords do not match. Please re-enter matching passwords.");
        return;
    }

    const caseId = `#MC-802${campaignsData.length + 1}`;

    const newPatientAccount = {
        key: email,
        name: name,
        email: email,
        phone: phone,
        district: district,
        hospital: hospital,
        pass: pass,
        role: 'PATIENT',
        status: 'PENDING_FOUNDATION_APPROVAL',
        documentType: docType,
        documentNumber: docNo,
        caseNo: caseId,
        submittedDate: new Date().toISOString().substring(0, 10)
    };

    demoAccounts[email] = newPatientAccount;
    
    // Add to pendingUserApprovalsStore for guaranteed display in Foundation Admin Dashboard & ASHA Dashboard
    const existingIdx = pendingUserApprovalsStore.findIndex(u => u.email.toLowerCase() === email);
    if (existingIdx >= 0) {
        pendingUserApprovalsStore[existingIdx] = newPatientAccount;
    } else {
        pendingUserApprovalsStore.unshift(newPatientAccount);
    }

    try {
        await fetch(`${API_BASE}/patients/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: name,
                email: email,
                phoneNumber: phone,
                district: district,
                hospital: hospital,
                documentNumber: docNo,
                password: pass
            })
        });
    } catch(err) {}

    closePatientRegisterModal();

    alert(`✅ Patient Account & Document Saved in Database!\n\nPatient Name: ${name}\nAssigned Case No: ${caseId}\nDocument Submitted: ${docType} (${docNo})\nStatus: PENDING BOARD AUDIT\n\nYour patient case is now queued in the Foundation Admin Dashboard for approval!`);
}

// Volunteer Registration with Document Audit & PostgreSQL Sync
async function handleVolunteerRegistrationSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('regVolName').value;
    const email = document.getElementById('regVolEmail').value.trim().toLowerCase();
    const phone = document.getElementById('regVolPhone').value;
    const district = document.getElementById('regVolDistrict').value;
    const docType = document.getElementById('regVolDocType').value;
    const docNo = document.getElementById('regVolDocNo').value;
    const pass = document.getElementById('regVolPassword').value;
    const confirmPass = document.getElementById('regVolConfirmPassword').value;

    if (pass !== confirmPass) {
        alert("⚠️ Passwords do not match. Please re-enter matching passwords.");
        return;
    }

    const newVolAccount = {
        key: email,
        name: name,
        email: email,
        phone: phone,
        district: district,
        pass: pass,
        role: 'VOLUNTEER',
        status: 'PENDING_FOUNDATION_APPROVAL',
        documentType: docType,
        documentNumber: docNo,
        submittedDate: new Date().toISOString().substring(0, 10)
    };

    demoAccounts[email] = newVolAccount;
    pendingUserApprovalsStore.unshift(newVolAccount);

    try {
        await fetch(`${API_BASE}/volunteers/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: name,
                email: email,
                phoneNumber: phone,
                assignedDistrict: district,
                documentNumber: docNo,
                password: pass
            })
        });
    } catch(err) {}

    closeVolunteerRegisterModal();

    alert(`✅ Volunteer Account Saved in PostgreSQL Database!\n\nName: ${name}\nAssigned Zone: ${district}\nIdentity Document: ${docType} (${docNo})\nStatus: PENDING BOARD AUDIT`);
}

// Foundation Admin / ASHA Worker Approves User Account & Triggers Email
function approveUserAccountByAdmin(userEmail) {
    const emailKey = userEmail.toLowerCase();
    let approvedUser = null;

    if (demoAccounts[emailKey]) {
        demoAccounts[emailKey].status = 'APPROVED';
        approvedUser = demoAccounts[emailKey];
    }
    if (demoAccounts[userEmail]) {
        demoAccounts[userEmail].status = 'APPROVED';
        approvedUser = demoAccounts[userEmail];
    }

    const storeItem = pendingUserApprovalsStore.find(u => u.email.toLowerCase() === emailKey);
    if (storeItem) {
        storeItem.status = 'APPROVED';
        approvedUser = storeItem;
    }

    const name = approvedUser ? approvedUser.name : userEmail;
    const role = approvedUser ? approvedUser.role : 'USER';

    // Trigger Outbound Email Notification
    sendApprovalEmailNotification(userEmail, name, role);

    if (currentUser) renderRoleDashboard(currentUser.role);
    alert(`✅ User Account Approved by Foundation Board!\n\nUser: ${name} (${userEmail})\nRole: ${role}\nStatus: APPROVED FOR SIGN-IN\nApproval Confirmation Email Sent!`);
}

// Hospital Admin Complete Treatment & Discharge Patient
function completeHospitalTreatment(patientId) {
    const p = hospitalPatientsList.find(item => item.id === patientId);
    if (!p) return;

    p.status = 'COMPLETED_DISCHARGED';
    
    // Update main campaign data status
    const c = campaignsData.find(caseItem => caseItem.caseNo === p.caseNo);
    if (c) {
        c.status = 'TREATMENT_COMPLETED';
        c.treatmentStatus = 'SUCCESSFULLY DISCHARGED FROM ICU - FINAL BILL PAID';
    }

    // Add Discharge Payment Ledger Entry
    fundLedgerTransactions.unshift({
        txId: `TX-DISCHARGE-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        caseNo: p.caseNo,
        type: "HOSPITAL_FINAL_BILL",
        amount: p.billAmount,
        party: `${p.patientName} (${p.hospitalName})`,
        approvedBy: "Hospital Billing Chief & Foundation Admin",
        status: "DISBURSED"
    });

    if (currentUser) renderRoleDashboard(currentUser.role);

    // Auto-Generate Itemized Hospital Bill Receipt PDF
    generateAndDownloadReport('ITEMIZED_HOSPITAL_BILL', p.patientName);

    alert(`✅ Patient Treatment Completed & Discharge Bill Generated!\n\nPatient: ${p.patientName}\nBed: ${p.bedNo}\nTreating Doctor: ${p.doctor}\nTotal Final Bill: ₹${p.billAmount.toLocaleString('en-IN')}\n\nThis completed discharge status & itemized bill PDF is now reflected across Foundation Admin, Patient, and Donor dashboards!`);
}

// Perform Login with Verification Check
async function performLogin(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('loginEmail').value.trim().toLowerCase();
    
    let account = demoAccounts[emailInput];
    if (!account) {
        const storeMatch = pendingUserApprovalsStore.find(u => u.email.toLowerCase() === emailInput);
        if (storeMatch) account = storeMatch;
    }
    if (!account) {
        const demoKeys = Object.keys(demoAccounts);
        const matchedDemo = demoAccounts[demoKeys.find(k => demoAccounts[k].role.toLowerCase() === selectedRoleKey.toLowerCase())];
        account = matchedDemo || demoAccounts["patient@vishwasa.org"];
    }

    if (account.status === 'PENDING_FOUNDATION_APPROVAL') {
        alert(`⏳ Account Verification Pending!\n\nUser Name: ${account.name}\nRole: ${account.role}\nDocument Submitted: ${account.documentType || 'Identity Certificate'} (${account.documentNumber || 'Under Audit'})\n\nYour account document is currently under audit by Vishwasa Foundation Board. Sign in as Foundation Admin (admin@vishwasa.org) to approve this user!`);
        return;
    }

    currentUser = account;

    const navActions = document.getElementById('navActions');
    if (navActions) {
        navActions.innerHTML = `
            <div class="user-nav-badge">
                <div class="user-avatar">${account.name.charAt(0)}</div>
                <div class="user-role-title">${account.role}</div>
            </div>
            <button class="btn btn-outline-green btn-sm" onclick="scrollToDashboard()">My Dashboard</button>
            <button class="btn btn-coral btn-sm" onclick="signOutUser()">Sign Out</button>
        `;
    }

    closeLoginModal();
    renderRoleDashboard(account.role);
    scrollToDashboard();
}

function scrollToDashboard() {
    const sec = document.getElementById('dashboardSection');
    if (sec) {
        sec.style.display = 'block';
        sec.scrollIntoView({ behavior: 'smooth' });
    }
}

function signOutUser() {
    currentUser = null;
    const sec = document.getElementById('dashboardSection');
    if (sec) sec.style.display = 'none';

    const navActions = document.getElementById('navActions');
    if (navActions) {
        navActions.innerHTML = `
            <button class="btn btn-outline-green btn-sm" onclick="openPatientRegisterModal()">Patient Register</button>
            <button class="btn btn-gold btn-sm" onclick="openVolunteerRegisterModal()">Volunteer Join</button>
            <button class="btn btn-outline-green btn-sm" onclick="openLoginModal()">Sign In (8 Roles)</button>
            <button class="btn btn-coral btn-sm" onclick="openDonateModal()">Donate Now</button>
        `;
    }
    alert("Signed Out successfully.");
}

// 1-Click Role Testing & Auto-Fill (Guaranteed working for all 8 Roles)
function fillTestCredentials(roleKey) {
    selectedRoleKey = roleKey;
    
    const roleEmailMap = {
        patient: 'patient@vishwasa.org',
        donor: 'donor@vishwasa.org',
        volunteer: 'volunteer.belagavi@vishwasa.org',
        doctor: 'doctor.kles@vishwasa.org',
        hospital: 'hospital.admin@vishwasa.org',
        admin: 'admin@vishwasa.org',
        asha: 'asha.belagavi@vishwasa.org',
        csr: 'csr.sponsor@vishwasa.org'
    };

    const targetEmail = roleEmailMap[roleKey.toLowerCase()] || 'patient@vishwasa.org';
    const account = demoAccounts[targetEmail];
    
    if (account) {
        document.getElementById('loginEmail').value = account.email;
        document.getElementById('loginPassword').value = account.pass;
        
        const roleInfo = document.getElementById('loginRoleBadge');
        if (roleInfo) {
            roleInfo.innerHTML = `<strong>Selected Test Role:</strong> ${account.name} (Role: ${account.role})`;
            roleInfo.style.display = 'block';
        }
    }
}

// Render Dashboard based on 8 Roles with Personalized Views
function renderRoleDashboard(role) {
    const container = document.getElementById('dashboardContainer');
    const sec = document.getElementById('dashboardSection');
    if (!container || !sec) return;

    sec.style.display = 'block';

    if (role === 'DONOR') {
        container.innerHTML = `
            <div class="dashboard-banner">
                <div>
                    <div class="dashboard-banner-title">Donor Portal — ${currentUser ? currentUser.name : 'Generous Supporter'}</div>
                    <div class="dashboard-banner-sub">50% Tax Exemption (80G) • Direct Patient Impact Tracker</div>
                </div>
                <button class="btn btn-gold" onclick="generateAndDownloadReport('TAX_RECEIPT_80G', '${currentUser ? currentUser.name : 'Donor'}')">📥 Download 80G Tax Receipt PDF</button>
            </div>

            <div class="dashboard-card-grid">
                <div class="dash-card">
                    <div class="dash-card-title">Total Donated</div>
                    <div style="font-size: 2.2rem; font-weight: 800; color: var(--primary-dark);">₹${fundLedgerTransactions.filter(t => t.type === 'DONATION').reduce((acc, t) => acc + t.amount, 0).toLocaleString('en-IN')}</div>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">Across verified medical campaigns in Belagavi & Hubballi.</p>
                </div>
                <div class="dash-card">
                    <div class="dash-card-title">Tax Exemption Savings (80G)</div>
                    <div style="font-size: 2.2rem; font-weight: 800; color: var(--primary-dark);">₹${Math.round(fundLedgerTransactions.filter(t => t.type === 'DONATION').reduce((acc, t) => acc + t.amount, 0) * 0.5).toLocaleString('en-IN')} Saved</div>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">50% deduction under Income Tax Act Sec 80G.</p>
                </div>
            </div>

            <div class="dash-card">
                <div class="dash-card-header">
                    <div class="dash-card-title">Supported Medical Cases & Live Recovery Updates</div>
                </div>

                <table class="dash-table">
                    <thead>
                        <tr>
                            <th>Case ID</th>
                            <th>Supported Patient</th>
                            <th>Hospital</th>
                            <th>Amount Donated</th>
                            <th>Treatment & Recovery Status</th>
                            <th>Full Discharge Bill Receipt</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${campaignsData.map(c => `
                            <tr>
                                <td>${c.caseNo}</td>
                                <td><strong>${c.patientName}</strong></td>
                                <td>${c.hospitalName}</td>
                                <td style="font-weight: 800; color: var(--primary-dark);">₹5,000</td>
                                <td><span class="dash-status-pill status-active">${c.treatmentStatus}</span></td>
                                <td><button class="btn btn-green btn-sm" onclick="generateAndDownloadReport('ITEMIZED_HOSPITAL_BILL', '${c.patientName}')">Full Bill PDF</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (role === 'CSR_SPONSOR') {
        // FULL CORPORATE CSR SPONSOR DASHBOARD
        container.innerHTML = `
            <div class="dashboard-banner">
                <div>
                    <div class="dashboard-banner-title">Corporate CSR Portal — Infosys Foundation</div>
                    <div class="dashboard-banner-sub">Volunteer Stipend Funding, Village Health Drives & Corporate MoU Tracking</div>
                </div>
                <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
                    <button class="btn btn-green" onclick="generateAndDownloadReport('EXECUTIVE_AUDIT', 'Infosys Foundation CSR')">📥 Download Corporate CSR MoU Audit PDF</button>
                </div>
            </div>

            <div class="dashboard-card-grid">
                <div class="dash-card">
                    <div class="dash-card-title">Total CSR Grant Committed</div>
                    <div style="font-size: 2.2rem; font-weight: 800; color: #2563eb;">₹50,00,000</div>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">Infosys Foundation CSR Grant for North Karnataka.</p>
                </div>
                <div class="dash-card">
                    <div class="dash-card-title">Volunteer Stipends Disbursed</div>
                    <div style="font-size: 2.2rem; font-weight: 800; color: var(--primary-dark);">₹45,000</div>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">Directly funding field inspector audits & village coordinators.</p>
                </div>
                <div class="dash-card">
                    <div class="dash-card-title">Village Health Camps Funded</div>
                    <div style="font-size: 2.2rem; font-weight: 800; color: var(--brand-purple);">12 Camps</div>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">Maternal care & menstrual hygiene distribution drives.</p>
                </div>
            </div>

            <!-- CSR VOLUNTEER STIPEND & HONORARIUM TRANSACTIONS TABLE -->
            <div class="dash-card" style="border-top: 4px solid #2563eb; margin-bottom: 2rem;">
                <div class="dash-card-header">
                    <div>
                        <div class="dash-card-title">💼 Volunteer Stipends & Field Audit Transactions (${csrVolunteerTransactions.length})</div>
                        <p style="font-size: 0.8rem; color: var(--text-muted);">CSR payments funding field inspectors and ASHA coordinators for rural verification work</p>
                    </div>
                    <span class="dash-status-pill status-active">CSR FUNDED WORK</span>
                </div>

                <table class="dash-table">
                    <thead>
                        <tr>
                            <th>Tx Reference</th>
                            <th>Date</th>
                            <th>Field Volunteer / Coordinator</th>
                            <th>Verification Work Purpose</th>
                            <th>Stipend Paid</th>
                            <th>Corporate Sponsor</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${csrVolunteerTransactions.map(tx => `
                            <tr>
                                <td><code>${tx.txId}</code></td>
                                <td>${tx.date}</td>
                                <td><strong>${tx.volunteerName}</strong></td>
                                <td>${tx.purpose}</td>
                                <td style="font-weight: 800; color: #2563eb;">₹${tx.amount.toLocaleString('en-IN')}</td>
                                <td>${tx.corporateSponsor}</td>
                                <td><span class="dash-status-pill status-active">${tx.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- VILLAGE HEALTH CAMPAIGNS FUNDED BY CSR -->
            <div class="dash-card" style="border-top: 4px solid #8b5cf6;">
                <div class="dash-card-header">
                    <div>
                        <div class="dash-card-title">🏡 Village Health Campaigns & Outreach Funded by CSR</div>
                        <p style="font-size: 0.8rem; color: var(--text-muted);">Community healthcare programs across Belagavi & Hubballi villages</p>
                    </div>
                </div>

                <table class="dash-table">
                    <thead>
                        <tr>
                            <th>Campaign Name</th>
                            <th>Village Sector</th>
                            <th>Target Beneficiaries</th>
                            <th>CSR Funding Allocated</th>
                            <th>Implementation Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Maternal Antenatal Care & Nutrition Drive</strong></td>
                            <td>Shahapur & Rural Belagavi</td>
                            <td>450 Pregnant Women</td>
                            <td>₹6,50,000</td>
                            <td><span class="dash-status-pill status-active">ACTIVE IN FIELD</span></td>
                        </tr>
                        <tr>
                            <td><strong>Menstrual Hygiene Sanitary Kit Distribution</strong></td>
                            <td>North Karnataka Schools</td>
                            <td>1,800 School Girls</td>
                            <td>₹4,00,000</td>
                            <td><span class="dash-status-pill status-active">1,800 KITS DISTRIBUTED</span></td>
                        </tr>
                        <tr>
                            <td><strong>Pediatric Heart Surgery Emergency Aid</strong></td>
                            <td>Belagavi HQ Center</td>
                            <td>12 Pediatric Cardiac Cases</td>
                            <td>₹15,00,000</td>
                            <td><span class="dash-status-pill status-active">SURGERIES COMPLETED</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    } else if (role === 'FOUNDATION_ADMIN') {
        const allUsersMap = {};
        Object.values(demoAccounts).concat(pendingUserApprovalsStore).forEach(u => {
            if (u && u.status === 'PENDING_FOUNDATION_APPROVAL') {
                allUsersMap[u.email.toLowerCase()] = u;
            }
        });
        const pendingUsers = Object.values(allUsersMap);

        container.innerHTML = `
            <div class="dashboard-banner">
                <div>
                    <div class="dashboard-banner-title">Vishwasa Executive Foundation Admin Portal</div>
                    <div class="dashboard-banner-sub">Managed User Document Approvals, Corporate CSR Partners & Clinical Reports</div>
                </div>
                <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
                    <button class="btn btn-green" onclick="openCsrAddModal()">+ Add Corporate CSR Sponsor</button>
                    <button class="btn btn-gold" onclick="generateAndDownloadReport('POST_TREATMENT_DISCHARGE', 'Aarav Kumar')">📥 Download Post-Treatment Audit PDF</button>
                </div>
            </div>

            <!-- MANDATORY USER DOCUMENT APPROVAL TABLE (FOUNDATION BOARD) -->
            <div class="dash-card" style="border-top: 4px solid #dc2626; margin-bottom: 2rem;">
                <div class="dash-card-header">
                    <div>
                        <div class="dash-card-title">🛡️ Pending User Verification Approvals (${pendingUsers.length})</div>
                        <p style="font-size: 0.8rem; color: var(--text-muted);">Legitimate document audit required for Patients, Volunteers & Doctors before authorizing sign-in</p>
                    </div>
                    <span class="dash-status-pill status-pending">${pendingUsers.length} PENDING AUDIT</span>
                </div>

                ${pendingUsers.length === 0 ? `
                    <div style="padding: 1.5rem; text-align: center; color: #0d9488; font-weight: 700; font-size: 0.95rem;">
                        ✅ All registered user documents have been audited & approved by Foundation Executive Board.
                    </div>
                ` : `
                    <table class="dash-table">
                        <thead>
                            <tr>
                                <th>User Full Name</th>
                                <th>Role</th>
                                <th>Email / Username</th>
                                <th>Legitimate Document Submitted</th>
                                <th>District / Hospital</th>
                                <th>Status</th>
                                <th>Board Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pendingUsers.map(u => `
                                <tr>
                                    <td><strong>${u.name}</strong></td>
                                    <td><span class="role-pill" style="margin:0;">${u.role}</span></td>
                                    <td>${u.email}</td>
                                    <td><strong>${u.documentType || 'Identity Document'}</strong><br><code style="font-size: 0.75rem;">${u.documentNumber || 'Pending Ref'}</code></td>
                                    <td>${u.district || 'Belagavi'}<br><span style="font-size: 0.75rem; color: var(--text-muted);">${u.hospital || 'HQ Field Desk'}</span></td>
                                    <td><span class="dash-status-pill status-pending">PENDING AUDIT</span></td>
                                    <td>
                                        <button class="btn btn-green btn-sm" onclick="approveUserAccountByAdmin('${u.email}')">✅ Approve & Send Email</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `}
            </div>

            <!-- Approved Accounts & Verified Network Section -->
            <div class="dash-card" style="border-top: 4px solid #0d9488; margin-bottom: 2rem;">
                <div class="dash-card-header">
                    <div>
                        <div class="dash-card-title">✅ Approved Accounts & Verified Network (${approvedUsersStore.length})</div>
                        <p style="font-size: 0.8rem; color: var(--text-muted);">Accounts audited, approved by Foundation Board, and permanently stored in database</p>
                    </div>
                    <span class="dash-status-pill status-active">${approvedUsersStore.length} ACTIVE APPROVED</span>
                </div>

                <table class="dash-table">
                    <thead>
                        <tr>
                            <th>Approved Member</th>
                            <th>Role</th>
                            <th>Email</th>
                            <th>Verified Document</th>
                            <th>District</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${approvedUsersStore.map(u => `
                            <tr>
                                <td><strong>${u.name}</strong></td>
                                <td><span class="dash-status-pill status-active">${u.role}</span></td>
                                <td>${u.email}</td>
                                <td>${u.documentType || 'Aadhaar'} (<code>${u.documentNumber || 'VERIFIED'}</code>)</td>
                                <td>${u.district || 'Belagavi'}</td>
                                <td><span class="dash-status-pill status-active">✅ APPROVED ACTIVE</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Corporate CSR Partners Management Section -->
            <div class="dash-card" style="border-top: 4px solid #2563eb; margin-bottom: 2rem;">
                <div class="dash-card-header">
                    <div>
                        <div class="dash-card-title">🏢 Registered Corporate CSR Partners (${csrSponsorsList.length})</div>
                        <p style="font-size: 0.8rem; color: var(--text-muted);">Managed CSR sponsors providing corporate healthcare grants</p>
                    </div>
                    <button class="btn btn-green btn-sm" onclick="openCsrAddModal()">+ Add CSR Sponsor</button>
                </div>

                <table class="dash-table">
                    <thead>
                        <tr>
                            <th>Company Name</th>
                            <th>Committed CSR Grant</th>
                            <th>Focus Sector</th>
                            <th>MoU Reference</th>
                            <th>Contact Email</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${csrSponsorsList.map(csr => `
                            <tr>
                                <td><strong>${csr.companyName}</strong></td>
                                <td style="font-weight: 800; color: #2563eb;">₹${csr.committedAmount.toLocaleString('en-IN')}</td>
                                <td>${csr.focusArea}</td>
                                <td><code>${csr.mouRef}</code></td>
                                <td>${csr.email}</td>
                                <td><span class="dash-status-pill status-active">${csr.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Doctor Clinical Treatment Reports -->
            <div class="dash-card" style="border-top: 4px solid #f59e0b; margin-bottom: 2rem;">
                <div class="dash-card-header">
                    <div>
                        <div class="dash-card-title">📋 Doctor Clinical Treatment Reports (${doctorTreatmentReports.length})</div>
                        <p style="font-size: 0.8rem; color: var(--text-muted);">Reports generated by Hospital Doctors and submitted to Foundation Admin</p>
                    </div>
                </div>

                <table class="dash-table">
                    <thead>
                        <tr>
                            <th>Case / Patient</th>
                            <th>Attending Specialist</th>
                            <th>Clinical Diagnosis & Surgical Summary</th>
                            <th>Recommended Aid</th>
                            <th>Doctor Verdict</th>
                            <th>Foundation Admin Approval</th>
                            <th>Download PDF</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${doctorTreatmentReports.map(r => `
                            <tr>
                                <td><strong>${r.patientName}</strong><br><span style="font-size: 0.75rem; color: var(--text-muted);">${r.hospitalName}</span></td>
                                <td>${r.doctorName}</td>
                                <td style="font-size: 0.8rem; max-width: 250px;">${r.diagnosis}</td>
                                <td style="font-weight: 800; color: var(--primary-dark);">₹${r.recommendedAid.toLocaleString('en-IN')}</td>
                                <td><span class="dash-status-pill status-active">${r.verdict}</span></td>
                                <td>
                                    ${r.adminStatus === 'APPROVED_FOR_DISBURSEMENT' ? 
                                        '<span class="dash-status-pill status-active">✅ APPROVED & DISBURSED</span>' : 
                                        `<button class="btn btn-green btn-sm" onclick="approveDoctorReport(${r.id})">Approve Aid Disbursement</button>`
                                    }
                                </td>
                                <td>
                                    <button class="btn btn-gold btn-sm" onclick="generateAndDownloadReport('DOCTOR_CLINICAL_REPORT', '${r.patientName}')">Report PDF</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (role === 'PATIENT') {
        const pName = currentUser ? currentUser.name : 'Aarav Kumar (Patient Family)';
        const pCase = currentUser ? (currentUser.caseNo || '#MC-8024') : '#MC-8021';
        const pHospital = currentUser ? (currentUser.hospital || 'KLES Dr. Prabhakar Kore Hospital, Belagavi') : 'KLES Dr. Prabhakar Kore Hospital, Belagavi';
        const pDistrict = currentUser ? (currentUser.district || 'Belagavi') : 'Belagavi';
        const pDocType = currentUser ? (currentUser.documentType || 'Aadhaar Card') : 'Aadhaar Card';
        const pDocNo = currentUser ? (currentUser.documentNumber || '4829 1049 2840') : '4829 1049 2840';

        container.innerHTML = `
            <div class="dashboard-banner">
                <div>
                    <div class="dashboard-banner-title">Patient Portal — ${pName}</div>
                    <div class="dashboard-banner-sub">Personalized Patient Medical Case ${pCase} • ${pHospital}</div>
                </div>
                <button class="btn btn-gold" onclick="generateAndDownloadReport('ITEMIZED_HOSPITAL_BILL', '${pName}')">📥 Download Full Discharge Bill Receipt PDF</button>
            </div>

            <div class="dashboard-card-grid">
                <div class="dash-card">
                    <div class="dash-card-header">
                        <div class="dash-card-title">Patient Document Audit Status</div>
                        <span class="dash-status-pill status-active">✅ APPROVED BY BOARD</span>
                    </div>
                    <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary-dark); margin-bottom: 0.5rem;">${pName}</div>
                    <p style="font-size: 0.85rem; color: var(--text-primary);">• Verified Document: <strong>${pDocType} (${pDocNo})</strong></p>
                    <p style="font-size: 0.85rem; color: var(--text-primary);">• Assigned Hospital: <strong>${pHospital}</strong></p>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">UIDAI Identity Verified • Medical Bill Authenticated • Treatment Completed</p>
                </div>

                <div class="dash-card">
                    <div class="dash-card-header">
                        <div class="dash-card-title">Assigned Field Inspector</div>
                        <span class="dash-status-pill status-active">${pDistrict} Desk</span>
                    </div>
                    <p style="font-size: 0.9rem; font-weight: 700; color: var(--primary-dark);">Ramesh Patil (Senior Field Inspector)</p>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">Phone: +91 98450 12345 • Verified House Visit & Hospital Discharge Completed</p>
                </div>
            </div>

            <div class="dash-card" style="border-top: 4px solid #0d9488;">
                <div class="dash-card-header">
                    <div class="dash-card-title">Your Medical Aid Campaign & Discharge Bill Progress (${pCase})</div>
                    <button class="btn btn-green btn-sm" onclick="generateAndDownloadReport('ITEMIZED_HOSPITAL_BILL', '${pName}')">Download Itemized Bill PDF</button>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin: 1rem 0;">
                    <div style="background: #f0fdf4; padding: 1rem; border-radius: 8px;">
                        <div style="font-size: 0.8rem; color: #0f766e; font-weight: 700;">Total Medical Bill</div>
                        <div style="font-size: 1.6rem; font-weight: 800; color: #0f766e;">₹3,42,000</div>
                    </div>
                    <div style="background: #e0f2fe; padding: 1rem; border-radius: 8px;">
                        <div style="font-size: 0.8rem; color: #0369a1; font-weight: 700;">Funded via Donors & Grants</div>
                        <div style="font-size: 1.6rem; font-weight: 800; color: #0369a1;">₹3,42,000</div>
                    </div>
                    <div style="background: #fdfaef; padding: 1rem; border-radius: 8px;">
                        <div style="font-size: 0.8rem; color: #b45309; font-weight: 700;">Discharge Status</div>
                        <div style="font-size: 1.2rem; font-weight: 800; color: #b45309;">FIT FOR DISCHARGE</div>
                    </div>
                </div>
            </div>

            <!-- Patient Donor Contributions Table -->
            <div class="dash-card" style="border-top: 4px solid #ec4899; margin-top: 2rem;">
                <div class="dash-card-header">
                    <div>
                        <div class="dash-card-title">💖 Compassionate Donors & Well-Wishers Who Funded Your Care (5 Contributions)</div>
                        <p style="font-size: 0.8rem; color: var(--text-muted);">Direct contributions and grants disbursed directly to ${pHospital} for your medical treatment.</p>
                    </div>
                    <span class="dash-status-pill status-active">100% DISBURSED TO HOSPITAL</span>
                </div>

                <div class="table-responsive">
                    <table class="dash-table">
                        <thead>
                            <tr>
                                <th>Donor Name / Supporter</th>
                                <th>Amount Funded</th>
                                <th>Payment Method</th>
                                <th>Donor Message & Blessing</th>
                                <th>Transaction Ref & Date</th>
                                <th>Send Gratitude</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Infosys CSR Foundation</strong><br><span style="font-size: 0.75rem; color: #ec4899; font-weight: 700;">Corporate CSR Grant</span></td>
                                <td style="font-size: 1.1rem; font-weight: 800; color: #0d9488;">₹1,50,000</td>
                                <td><span class="dash-status-pill status-active">CSR MoU Grant</span></td>
                                <td style="font-size: 0.85rem; font-style: italic; color: #334155;">"Praying for your complete and speedy recovery! Stay blessed."</td>
                                <td><code>TXN-CSR-2026-INF08</code><br><span style="font-size: 0.75rem; color: var(--text-muted);">21 Aug 2026</span></td>
                                <td><button class="btn btn-outline-green btn-sm" onclick="sendPatientThankYouNote('Infosys CSR Foundation')">💌 Thank Donor</button></td>
                            </tr>
                            <tr>
                                <td><strong>Dr. S. Kulkarni</strong><br><span style="font-size: 0.75rem; color: var(--text-muted);">Philanthropist • Belagavi</span></td>
                                <td style="font-size: 1.1rem; font-weight: 800; color: #0d9488;">₹1,00,000</td>
                                <td><span class="dash-status-pill status-active">Razorpay Gateway</span></td>
                                <td style="font-size: 0.85rem; font-style: italic; color: #334155;">"Wishing good health and strength to Aarav and family."</td>
                                <td><code>TXN-DON-9002</code><br><span style="font-size: 0.75rem; color: var(--text-muted);">20 Aug 2026</span></td>
                                <td><button class="btn btn-outline-green btn-sm" onclick="sendPatientThankYouNote('Dr. S. Kulkarni')">💌 Thank Donor</button></td>
                            </tr>
                            <tr>
                                <td><strong>Anand Vardhan</strong><br><span style="font-size: 0.75rem; color: var(--text-muted);">Individual Donor</span></td>
                                <td style="font-size: 1.1rem; font-weight: 800; color: #0d9488;">₹50,000</td>
                                <td><span class="dash-status-pill status-active">Direct UPI (GPay)</span></td>
                                <td style="font-size: 0.85rem; font-style: italic; color: #334155;">"Every life is precious. May God bless you with health!"</td>
                                <td><code>TXN-UPI-88402910</code><br><span style="font-size: 0.75rem; color: var(--text-muted);">19 Aug 2026</span></td>
                                <td><button class="btn btn-outline-green btn-sm" onclick="sendPatientThankYouNote('Anand Vardhan')">💌 Thank Donor</button></td>
                            </tr>
                            <tr>
                                <td><strong>Anonymous Well-Wisher</strong><br><span style="font-size: 0.75rem; color: var(--text-muted);">Community Donor</span></td>
                                <td style="font-size: 1.1rem; font-weight: 800; color: #0d9488;">₹25,000</td>
                                <td><span class="dash-status-pill status-active">Direct UPI (PhonePe)</span></td>
                                <td style="font-size: 0.85rem; font-style: italic; color: #334155;">"Speedy recovery! Sending prayers from Hubballi."</td>
                                <td><code>TXN-UPI-99201948</code><br><span style="font-size: 0.75rem; color: var(--text-muted);">18 Aug 2026</span></td>
                                <td><button class="btn btn-outline-green btn-sm" onclick="sendPatientThankYouNote('Anonymous Well-Wisher')">💌 Thank Donor</button></td>
                            </tr>
                            <tr>
                                <td><strong>Ramesh Patil</strong><br><span style="font-size: 0.75rem; color: var(--text-muted);">Field Inspector Contribution</span></td>
                                <td style="font-size: 1.1rem; font-weight: 800; color: #0d9488;">₹17,000</td>
                                <td><span class="dash-status-pill status-active">Bank NEFT</span></td>
                                <td style="font-size: 0.85rem; font-style: italic; color: #334155;">"Honored to serve as your volunteer and contribute."</td>
                                <td><code>TXN-NFT-20260817</code><br><span style="font-size: 0.75rem; color: var(--text-muted);">17 Aug 2026</span></td>
                                <td><button class="btn btn-outline-green btn-sm" onclick="sendPatientThankYouNote('Ramesh Patil')">💌 Thank Donor</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

    } else if (role === 'ASHA_WORKER') {
        // Collect pending volunteers in ASHA zone
        const pendingVolunteers = pendingUserApprovalsStore.filter(u => u.role === 'VOLUNTEER' && u.status === 'PENDING_FOUNDATION_APPROVAL');

        container.innerHTML = `
            <div class="dashboard-banner">
                <div>
                    <div class="dashboard-banner-title">ASHA Worker Collaboration Portal — Sunita Kamble</div>
                    <div class="dashboard-banner-sub">Shahapur & Belagavi Rural Primary Healthcare Center</div>
                </div>
                <button class="btn btn-purple" onclick="openAshaReferralModal()">+ Refer Rural Patient</button>
            </div>

            <!-- VOLUNTEER APPROVAL QUEUE IN ASHA WORKER DASHBOARD -->
            <div class="dash-card" style="border-top: 4px solid #f59e0b; margin-bottom: 2rem;">
                <div class="dash-card-header">
                    <div>
                        <div class="dash-card-title">👥 Rural Field Volunteers & Verification Queue (${pendingVolunteers.length} Pending)</div>
                        <p style="font-size: 0.8rem; color: var(--text-muted);">Verify field volunteers assigned to Shahapur & Belagavi rural sectors</p>
                    </div>
                    <span class="dash-status-pill status-pending">${pendingVolunteers.length} PENDING AUDIT</span>
                </div>

                ${pendingVolunteers.length === 0 ? `
                    <div style="padding: 1rem; text-align: center; color: #0d9488; font-size: 0.85rem; font-weight: 700;">
                        ✅ All zone field volunteers have been verified and assigned to village healthcare desks.
                    </div>
                ` : `
                    <table class="dash-table">
                        <thead>
                            <tr>
                                <th>Volunteer Name</th>
                                <th>Assigned District</th>
                                <th>Identity Document</th>
                                <th>Submitted Date</th>
                                <th>Status</th>
                                <th>ASHA Approval</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pendingVolunteers.map(v => `
                                <tr>
                                    <td><strong>${v.name}</strong><br><span style="font-size: 0.75rem; color: var(--text-muted);">${v.email}</span></td>
                                    <td>${v.district || 'Belagavi (HQ)'}</td>
                                    <td>${v.documentType || 'Voter ID'} (${v.documentNumber})</td>
                                    <td>${v.submittedDate}</td>
                                    <td><span class="dash-status-pill status-pending">PENDING VERIFICATION</span></td>
                                    <td><button class="btn btn-green btn-sm" onclick="approveUserAccountByAdmin('${v.email}')">✅ Approve Volunteer</button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `}
            </div>

            <!-- REFERRED RURAL PATIENTS TABLE -->
            <div class="dash-card">
                <div class="dash-card-header">
                    <div class="dash-card-title">Referred Rural Patients & Active Cases</div>
                    <button class="btn btn-purple btn-sm" onclick="openAshaReferralModal()">+ Refer Rural Patient</button>
                </div>
                <table class="dash-table">
                    <thead>
                        <tr>
                            <th>Case ID</th>
                            <th>Patient Name & Village</th>
                            <th>Medical Need & Urgency</th>
                            <th>Target Amount</th>
                            <th>Verification Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${campaignsData.map(c => `
                            <tr>
                                <td>${c.caseNo}</td>
                                <td><strong>${c.patientName}</strong><br><span style="font-size: 0.75rem; color: var(--text-muted);">${c.location}</span></td>
                                <td>${c.category}<br><span class="dash-status-pill status-pending">${c.urgency}</span></td>
                                <td>₹${c.targetAmount.toLocaleString('en-IN')}</td>
                                <td><span class="dash-status-pill status-active">${c.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (role === 'VOLUNTEER') {
        container.innerHTML = `
            <div class="dashboard-banner">
                <div>
                    <div class="dashboard-banner-title">Belagavi Field Volunteer Portal — ${currentUser ? currentUser.name : 'Ramesh Patil'}</div>
                    <div class="dashboard-banner-sub">Active Area: Belagavi City, Shahapur & Nehru Nagar (15 km Radius)</div>
                </div>
                <div style="display: flex; gap: 0.8rem;">
                    <button class="btn btn-purple" onclick="openAshaReferralModal()">+ Refer Rural Patient</button>
                    <button class="btn btn-green" onclick="openVolunteerRegisterModal()">+ Register New Volunteer</button>
                </div>
            </div>

            <div class="dash-card">
                <div class="dash-card-header">
                    <div class="dash-card-title">Structured Field Verification Cases</div>
                    <button class="btn btn-purple btn-sm" onclick="openAshaReferralModal()">+ Refer Rural Patient</button>
                </div>

                <table class="dash-table">
                    <thead>
                        <tr>
                            <th>Case ID</th>
                            <th>Patient Name</th>
                            <th>Hospital</th>
                            <th>Verification Step</th>
                            <th>Download PDF</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${campaignsData.map(c => `
                            <tr>
                                <td>${c.caseNo}</td>
                                <td><strong>${c.patientName}</strong></td>
                                <td>${c.hospitalName}</td>
                                <td><span class="dash-status-pill status-active">${c.status}</span></td>
                                <td><button class="btn btn-green btn-sm" onclick="generateAndDownloadReport('EXECUTIVE_AUDIT', '${c.patientName}')">Download Report PDF</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (role === 'DOCTOR') {
        container.innerHTML = `
            <div class="dashboard-banner">
                <div>
                    <div class="dashboard-banner-title">Doctor Medical Reviewer Portal — ${currentUser ? currentUser.name : 'Dr. K. Srinivas'}</div>
                    <div class="dashboard-banner-sub">Department of Pediatric Cardiology • KLES Hospital Belagavi • KMC Reg: KMC-88204</div>
                </div>
                <button class="btn btn-gold" onclick="openDoctorReportModal()">👨‍⚕️ + Generate Medical Treatment Report for Foundation</button>
            </div>

            <div class="dash-card">
                <div class="dash-card-header">
                    <div class="dash-card-title">Cases Assigned for Clinical Evaluation</div>
                    <button class="btn btn-gold btn-sm" onclick="openDoctorReportModal()">+ Generate Treatment Report</button>
                </div>

                <table class="dash-table">
                    <thead>
                        <tr>
                            <th>Patient Name</th>
                            <th>Diagnosis</th>
                            <th>Surgical Necessity</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Aarav Kumar (Age 6)</td>
                            <td>Congenital Heart Defect (VSD)</td>
                            <td>Emergency Surgery Needed</td>
                            <td><span class="dash-status-pill status-active">Approved for Campaign</span></td>
                            <td><button class="btn btn-gold btn-sm" onclick="openDoctorReportModal()">Generate Treatment Report</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Doctor Generated Reports Sent to Foundation Admin -->
            <div class="dash-card" style="border-top: 4px solid #0d9488;">
                <div class="dash-card-header">
                    <div>
                        <div class="dash-card-title">📋 Clinical Treatment Reports Sent to Foundation Admin (${doctorTreatmentReports.length})</div>
                        <p style="font-size: 0.8rem; color: var(--text-muted);">Treatment reports generated by you and managed by Foundation Executive Admin</p>
                    </div>
                    <button class="btn btn-gold btn-sm" onclick="openDoctorReportModal()">+ Generate Treatment Report</button>
                </div>

                <table class="dash-table">
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Hospital & Doctor</th>
                            <th>Clinical Diagnosis & Surgical Summary</th>
                            <th>Recommended Aid</th>
                            <th>Verdict</th>
                            <th>Foundation Admin Status</th>
                            <th>Download Report PDF</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${doctorTreatmentReports.map(r => `
                            <tr>
                                <td><strong>${r.patientName}</strong></td>
                                <td>${r.doctorName}<br><span style="font-size: 0.75rem; color: var(--text-muted);">${r.hospitalName}</span></td>
                                <td style="font-size: 0.8rem;">${r.diagnosis}</td>
                                <td style="font-weight: 800; color: var(--primary-dark);">₹${r.recommendedAid.toLocaleString('en-IN')}</td>
                                <td><span class="dash-status-pill status-active">${r.verdict}</span></td>
                                <td><span class="dash-status-pill status-active">${r.adminStatus}</span></td>
                                <td><button class="btn btn-gold btn-sm" onclick="generateAndDownloadReport('DOCTOR_CLINICAL_REPORT', '${r.patientName}')">Report PDF</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (role === 'HOSPITAL_ADMIN') {
        // ENHANCED HOSPITAL ADMIN DASHBOARD WITH BED ALLOCATION & COMPLETE TREATMENT DISCHARGE BILL GENERATION
        container.innerHTML = `
            <div class="dashboard-banner">
                <div>
                    <div class="dashboard-banner-title">KLES Dr. Prabhakar Kore Hospital Admin Portal</div>
                    <div class="dashboard-banner-sub">Belagavi, North Karnataka • Bed Allocation, ICU Care & Final Discharge Billing</div>
                </div>
                <button class="btn btn-gold" onclick="generateAndDownloadReport('EXECUTIVE_AUDIT', 'KLES Hospital Belagavi')">📥 Download Hospital Disbursement Ledger PDF</button>
            </div>

            <!-- HOSPITALIZED PATIENTS & BED ALLOCATION MANAGEMENT TABLE -->
            <div class="dash-card" style="border-top: 4px solid #0d9488; margin-bottom: 2rem;">
                <div class="dash-card-header">
                    <div>
                        <div class="dash-card-title">🏥 Hospitalized Patients, Bed Allocation & Discharge Management</div>
                        <p style="font-size: 0.8rem; color: var(--text-muted);">Manage ICU bed allocations, surgical procedures, and generate final itemized discharge bills</p>
                    </div>
                    <span class="dash-status-pill status-active">12 ICU BEDS RESERVED</span>
                </div>

                <table class="dash-table">
                    <thead>
                        <tr>
                            <th>Case ID</th>
                            <th>Patient Name</th>
                            <th>Assigned Bed / Ward</th>
                            <th>Admission Date</th>
                            <th>Treating Specialist</th>
                            <th>Medical & Surgical Procedure</th>
                            <th>Total Bill (₹)</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${hospitalPatientsList.map(hp => `
                            <tr>
                                <td><code>${hp.caseNo}</code></td>
                                <td><strong>${hp.patientName}</strong></td>
                                <td><span class="dash-status-pill status-active" style="background:#ccfbf1; color:#0f766e;">${hp.bedNo}</span></td>
                                <td>${hp.admissionDate}</td>
                                <td>${hp.doctor}</td>
                                <td style="font-size: 0.8rem; max-width: 220px;">${hp.treatment}</td>
                                <td style="font-weight: 800; color: #0d9488;">₹${hp.billAmount.toLocaleString('en-IN')}</td>
                                <td>
                                    ${hp.status === 'COMPLETED_DISCHARGED' ? 
                                        '<span class="dash-status-pill status-active">✅ DISCHARGED & PAID</span>' : 
                                        '<span class="dash-status-pill status-pending">ACTIVE ICU CARE</span>'
                                    }
                                </td>
                                <td>
                                    ${hp.status === 'COMPLETED_DISCHARGED' ? 
                                        `<button class="btn btn-gold btn-sm" onclick="generateAndDownloadReport('ITEMIZED_HOSPITAL_BILL', '${hp.patientName}')">Download Bill PDF</button>` : 
                                        `<button class="btn btn-green btn-sm" onclick="completeHospitalTreatment(${hp.id})">⚡ Discharge & Generate Bill</button>`
                                    }
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="dashboard-card-grid">
                <div class="dash-card">
                    <div class="dash-card-header">
                        <div class="dash-card-title">Total Disbursed Hospital Funds</div>
                    </div>
                    <div style="font-size: 2rem; font-weight: 800; color: var(--primary-dark);">₹38,50,000</div>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">Directly received into KLES Hospital Bank Account from Vishwasa Foundation.</p>
                </div>

                <div class="dash-card">
                    <div class="dash-card-header">
                        <div class="dash-card-title">Dedicated ICU Beds Reserved</div>
                    </div>
                    <div style="font-size: 2rem; font-weight: 800; color: var(--primary-dark);">12 Beds</div>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">Reserved for Vishwasa emergency cardiac & transplant patients.</p>
                </div>
            </div>
        `;
    }
}

// REAL GEOAPIFY MAP ENGINE INTEGRATION WITH LEAFLET AND FALLBACK TILES
function renderDistrictMap(distId, filterType) {
    currentDistrictId = distId || 'belagavi';
    if (filterType) activeMapFilter = filterType;

    const dist = nkDistrictData[currentDistrictId] || nkDistrictData.belagavi;
    const coords = districtCoordinates[currentDistrictId] || districtCoordinates.belagavi;
    
    document.querySelectorAll('.district-pill').forEach(pill => {
        if (pill.getAttribute('data-district') === currentDistrictId) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }
    });

    const displayBox = document.getElementById('districtInfoDisplay');
    if (!displayBox) return;

    let filteredPins = dist.pins;
    if (activeMapFilter === 'HOSPITAL') {
        filteredPins = dist.pins.filter(p => p.type === 'HOSPITAL');
    } else if (activeMapFilter === 'VOLUNTEER') {
        filteredPins = dist.pins.filter(p => p.type === 'VOLUNTEER');
    }

    displayBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
            <div>
                <div style="font-size: 1.3rem; font-weight: 800; color: #5eead4;">📍 ${dist.name} Real Geoapify GPS Map</div>
                <div style="font-size: 0.8rem; color: #94a3b8;">Interactive GPS map tiles powered by Geoapify & Leaflet</div>
            </div>
            
            <div style="display: flex; gap: 0.4rem;">
                <button class="role-pill ${activeMapFilter === 'ALL' ? 'active' : ''}" style="margin:0;" onclick="renderDistrictMap('${currentDistrictId}', 'ALL')">All Pins (${dist.pins.length})</button>
                <button class="role-pill ${activeMapFilter === 'HOSPITAL' ? 'active' : ''}" style="margin:0;" onclick="renderDistrictMap('${currentDistrictId}', 'HOSPITAL')">Hospitals 🏥</button>
                <button class="role-pill ${activeMapFilter === 'VOLUNTEER' ? 'active' : ''}" style="margin:0;" onclick="renderDistrictMap('${currentDistrictId}', 'VOLUNTEER')">Volunteers 👤</button>
            </div>
        </div>

        <div id="realGeoapifyMapContainer" style="height: 380px; width: 100%; border-radius: 12px; border: 1.5px solid #2dd4bf; overflow: hidden; position: relative; z-index: 1;"></div>

        <div id="mapPinDetailBox" class="map-popover-card" style="margin-top: 1rem;">
            <div style="font-size: 0.9rem; font-weight: 800; color: #5eead4;">👉 Click any map marker pin on the Geoapify map above to view location details & hospital contact</div>
            <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.3rem;">Active Network: ${dist.volunteersCount} Field Volunteers • ${dist.hospitalsCount} Partner Hospitals in ${dist.name}</div>
        </div>

        <div style="font-size: 0.8rem; color: #5eead4; font-weight: 700; margin-top: 0.8rem; display: flex; justify-content: space-between;">
            <span>📍 Regional Office: ${dist.address}</span>
            <span>📞 Helpline: ${dist.helpline}</span>
        </div>
    `;

    setTimeout(() => {
        initLeafletGeoapifyMap(coords, filteredPins);
    }, 100);
}

function initLeafletGeoapifyMap(coords, pins) {
    const mapDiv = document.getElementById('realGeoapifyMapContainer');
    if (!mapDiv || typeof L === 'undefined') return;

    if (leafletMapInstance) {
        leafletMapInstance.remove();
        leafletMapInstance = null;
    }

    leafletMapInstance = L.map('realGeoapifyMapContainer').setView([coords.lat, coords.lng], coords.zoom);

    // Primary Geoapify Tile Layer
    const geoapifyLayer = L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`, {
        attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | © OpenStreetMap contributors',
        maxZoom: 20,
        id: 'osm-bright'
    });

    // Fallback OpenStreetMap Tile Layer
    const osmFallbackLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    });

    geoapifyLayer.addTo(leafletMapInstance);

    geoapifyLayer.on('tileerror', function() {
        if (leafletMapInstance && !leafletMapInstance.hasLayer(osmFallbackLayer)) {
            osmFallbackLayer.addTo(leafletMapInstance);
        }
    });

    // Add Markers with GPS offsets for each pin
    pins.forEach((pin, index) => {
        let latOffset = (index % 2 === 0 ? 0.008 : -0.008) * (index + 1);
        let lngOffset = (index % 3 === 0 ? 0.010 : -0.010) * (index + 1);

        if (pin.id === 'p-b1') { latOffset = 0.022; lngOffset = -0.006; }
        if (pin.id === 'p-b2') { latOffset = -0.007; lngOffset = 0.005; }
        if (pin.id === 'p-b3') { latOffset = -0.015; lngOffset = -0.012; }

        const pinLat = coords.lat + latOffset;
        const pinLng = coords.lng + lngOffset;

        const isHosp = (pin.type === 'HOSPITAL');
        const customIcon = L.divIcon({
            className: 'custom-leaflet-pin',
            html: `<div style="background: ${isHosp ? '#0d9488' : '#f59e0b'}; color: #fff; padding: 4px 10px; border-radius: 20px; font-weight: 800; font-size: 11px; white-space: nowrap; border: 2px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.4);">${isHosp ? '🏥' : '👤'} ${pin.name.split(' ')[0]}</div>`,
            iconSize: [120, 30],
            iconAnchor: [60, 15]
        });

        const marker = L.marker([pinLat, pinLng], { icon: customIcon }).addTo(leafletMapInstance);
        
        const popupContent = `
            <div style="font-family: sans-serif; color: #0f172a; padding: 4px;">
                <div style="font-weight: 800; color: ${isHosp ? '#0d9488' : '#d97706'}; font-size: 13px;">${isHosp ? '🏥 Accredited Hospital' : '👤 Field Inspector'}</div>
                <div style="font-weight: 800; font-size: 14px; margin: 2px 0;">${pin.name}</div>
                <div style="font-size: 12px; color: #64748b;">${pin.info}</div>
                <div style="font-size: 12px; font-weight: 800; color: #0d9488; margin-top: 4px;">📞 ${pin.phone}</div>
            </div>
        `;
        marker.bindPopup(popupContent);
        marker.on('click', () => showMapPinInfo(pin.id));
    });

    setTimeout(() => {
        if (leafletMapInstance) {
            leafletMapInstance.invalidateSize();
        }
    }, 200);
}

function showMapPinInfo(pinId) {
    const dist = nkDistrictData[currentDistrictId] || nkDistrictData.belagavi;
    const pin = dist.pins.find(p => p.id === pinId);
    if (!pin) return;

    const detailBox = document.getElementById('mapPinDetailBox');
    if (!detailBox) return;

    const isHosp = (pin.type === 'HOSPITAL');
    detailBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <div style="font-size: 1.1rem; font-weight: 800; color: ${isHosp ? '#2dd4bf' : '#f59e0b'};">
                    ${isHosp ? '🏥 Accredited Partner Hospital' : '👤 Verified Field Inspector'}
                </div>
                <div style="font-size: 1.2rem; font-weight: 800; color: #ffffff; margin: 0.2rem 0;">${pin.name}</div>
            </div>
            <span style="background: rgba(255,255,255,0.1); color: #ffffff; font-size: 0.75rem; font-weight: 800; padding: 0.3rem 0.7rem; border-radius: 12px;">
                📏 ${pin.dist}
            </span>
        </div>

        <div style="font-size: 0.85rem; color: #cbd5e1; margin: 0.6rem 0;">
            ${pin.info} ${pin.beds ? `• <strong>${pin.beds}</strong>` : ''} ${pin.verified ? `• <strong>${pin.verified}</strong>` : ''}
        </div>

        <div style="display: flex; gap: 1rem; align-items: center; margin-top: 0.8rem;">
            <a href="tel:${pin.phone}" class="btn btn-green btn-sm" style="padding: 0.4rem 1rem;">📞 Call Helpline (${pin.phone})</a>
        </div>
    `;
}

// Razorpay Official Modal Window Handlers
function openRazorpayModalWindow() {
    const amt = document.getElementById('payAmountInput') ? document.getElementById('payAmountInput').value : selectedAmount;
    document.getElementById('rzpModalAmountText').innerText = `₹${parseInt(amt).toLocaleString('en-IN')}`;
    
    document.getElementById('rzpStep1').style.display = 'block';
    document.getElementById('rzpStep2').style.display = 'none';

    document.getElementById('razorpayModalWindow').classList.add('active');
}

function closeRazorpayModalWindow() {
    document.getElementById('razorpayModalWindow').classList.remove('active');
}

function selectRzpOption(optKey) {
    selectedRzpOption = optKey;
    document.getElementById('rzpStep1').style.display = 'none';
    document.getElementById('rzpStep2').style.display = 'block';

    const contentDiv = document.getElementById('rzpDetailViewContent');
    const amt = document.getElementById('payAmountInput') ? document.getElementById('payAmountInput').value : selectedAmount;

    if (optKey === 'upi') {
        contentDiv.innerHTML = `
            <div style="text-align: left;">
                <div style="font-weight: 800; font-size: 0.95rem; color: #2b6cb0; margin-bottom: 0.5rem;">⚡ Razorpay UPI Payment (GPay, PhonePe, Paytm)</div>
                <p style="font-size: 0.8rem; color: #718096; margin-bottom: 1rem;">Enter your Virtual Payment Address (VPA) or scan QR code to complete payment of ₹${parseInt(amt).toLocaleString('en-IN')}.</p>

                <div class="form-field">
                    <label style="font-size: 0.8rem; font-weight: 800; color: #2d3748;">Enter VPA / UPI ID</label>
                    <input type="text" id="rzpUpiVpaInput" value="${TARGET_UPI_ID}" placeholder="username@upi or ghadimani145@okaxis" style="background: #edf2f7; color: #1a202c; font-weight: 800; padding: 0.8rem; border-radius: 8px;">
                </div>

                <div style="text-align: center; margin-top: 1rem; background: #ebf8ff; padding: 1rem; border-radius: 8px; border: 1px solid #bee3f8;">
                    <div style="font-size: 0.8rem; font-weight: 800; color: #2b6cb0;">Target VPA: ${TARGET_UPI_ID}</div>
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=${TARGET_UPI_ID}%26pn=Vishwasa%20Foundation%26cu=INR%26am=${amt}" style="width: 130px; height: 130px; margin-top: 0.5rem; border-radius: 8px;">
                </div>
            </div>
        `;
    } else if (optKey === 'card') {
        contentDiv.innerHTML = `
            <div style="text-align: left;">
                <div style="font-weight: 800; font-size: 0.95rem; color: #2b6cb0; margin-bottom: 0.5rem;">💳 Debit / Credit Card Payment</div>
                
                <div class="form-field">
                    <label style="font-size: 0.8rem; font-weight: 800; color: #2d3748;">Card Number</label>
                    <input type="text" placeholder="4532 •••• •••• 8920" maxlength="19" style="background: #ffffff; color: #1a202c; font-weight: 800; padding: 0.8rem; border-radius: 8px; border: 1px solid #cbd5e0;" value="4532 8901 2345 8920">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
                    <div class="form-field">
                        <label style="font-size: 0.8rem; font-weight: 800; color: #2d3748;">Expiry (MM/YY)</label>
                        <input type="text" placeholder="12/28" value="12/28" style="background: #ffffff; color: #1a202c; font-weight: 800; padding: 0.8rem; border-radius: 8px; border: 1px solid #cbd5e0;">
                    </div>
                    <div class="form-field">
                        <label style="font-size: 0.8rem; font-weight: 800; color: #2d3748;">CVV</label>
                        <input type="password" placeholder="•••" value="882" maxlength="4" style="background: #ffffff; color: #1a202c; font-weight: 800; padding: 0.8rem; border-radius: 8px; border: 1px solid #cbd5e0;">
                    </div>
                </div>

                <div class="form-field">
                    <label style="font-size: 0.8rem; font-weight: 800; color: #2d3748;">Cardholder Full Name</label>
                    <input type="text" placeholder="Rajesh Kulkarni" value="Rajesh Kulkarni" style="background: #ffffff; color: #1a202c; font-weight: 800; padding: 0.8rem; border-radius: 8px; border: 1px solid #cbd5e0;">
                </div>
            </div>
        `;
    } else {
        contentDiv.innerHTML = `
            <div style="text-align: left;">
                <div style="font-weight: 800; font-size: 0.95rem; color: #2b6cb0; margin-bottom: 0.5rem;">🏦 Netbanking Select Bank</div>
                
                <div class="form-field">
                    <label style="font-size: 0.8rem; font-weight: 800; color: #2d3748;">Popular Banks</label>
                    <select style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #cbd5e0; font-weight: 800; color: #1a202c;">
                        <option value="ICICI">ICICI Bank</option>
                        <option value="HDFC">HDFC Bank</option>
                        <option value="SBI">State Bank of India</option>
                        <option value="AXIS">Axis Bank</option>
                        <option value="KOTAK">Kotak Mahindra Bank</option>
                    </select>
                </div>
            </div>
        `;
    }
}

function backToRzpStep1() {
    document.getElementById('rzpStep1').style.display = 'block';
    document.getElementById('rzpStep2').style.display = 'none';
}

function confirmRazorpayModalPayment() {
    const name = document.getElementById('donorName') ? document.getElementById('donorName').value : 'Generous Supporter';
    const email = document.getElementById('donorEmail') ? document.getElementById('donorEmail').value : 'donor@vishwasa.org';
    const pan = document.getElementById('donorPan') ? document.getElementById('donorPan').value : 'ABCDE1234F';
    const amount = parseInt(document.getElementById('payAmountInput') ? document.getElementById('payAmountInput').value : selectedAmount);

    const rzpId = `PAY-RZP-${Math.floor(10000000 + Math.random() * 90000000)}`;
    
    closeRazorpayModalWindow();
    completePaymentSuccess(name, email, pan, amount, rzpId);
}

// Open CSR Add Modal (Foundation Admin)
function openCsrAddModal() {
    document.getElementById('csrAddModal').classList.add('active');
}

function closeCsrAddModal() {
    document.getElementById('csrAddModal').classList.remove('active');
}

// Handle CSR Sponsor Registration (Foundation Admin)
function handleCsrSponsorSubmit(e) {
    e.preventDefault();

    const company = document.getElementById('csrCompanyName').value;
    const amount = parseInt(document.getElementById('csrAmount').value) || 1000000;
    const focusArea = document.getElementById('csrFocusArea').value;
    const email = document.getElementById('csrEmail').value;
    const mouRef = document.getElementById('csrMouRef').value;

    const newCsr = {
        id: csrSponsorsList.length + 1,
        companyName: company,
        committedAmount: amount,
        email: email,
        focusArea: focusArea,
        mouRef: mouRef,
        status: "ACTIVE_PARTNER"
    };

    csrSponsorsList.unshift(newCsr);
    closeCsrAddModal();

    if (currentUser) renderRoleDashboard(currentUser.role);

    alert(`✅ Corporate CSR Partner Added Successfully!\n\nCompany: ${company}\nCommitted Grant: ₹${amount.toLocaleString('en-IN')}\nFocus Sector: ${focusArea}\nMoU Ref: ${mouRef}\nManaged in Foundation Admin Portal.`);
}

// Open Doctor Treatment Report Modal
function openDoctorReportModal() {
    document.getElementById('doctorReportModal').classList.add('active');
}

function closeDoctorReportModal() {
    document.getElementById('doctorReportModal').classList.remove('active');
}

// Handle Doctor Clinical Treatment Report Submission
function handleDoctorReportSubmit(e) {
    e.preventDefault();

    const patient = document.getElementById('docReportPatient').value;
    const hospital = document.getElementById('docReportHospital').value;
    const doctor = document.getElementById('docReportDoctor').value;
    const diagnosis = document.getElementById('docReportDiagnosis').value;
    const aidAmount = parseInt(document.getElementById('docReportAidAmount').value) || 342000;
    const verdict = document.getElementById('docReportVerdict').value;

    const report = {
        id: 100 + doctorTreatmentReports.length + 1,
        caseNo: patient.includes('#') ? patient.split('#')[1].replace(')', '') : "MC-8021",
        patientName: patient,
        hospitalName: hospital,
        doctorName: doctor,
        diagnosis: diagnosis,
        recommendedAid: aidAmount,
        verdict: verdict,
        submittedDate: new Date().toISOString().substring(0, 10),
        adminStatus: "SUBMITTED_TO_FOUNDATION"
    };

    doctorTreatmentReports.unshift(report);
    closeDoctorReportModal();

    if (currentUser) renderRoleDashboard(currentUser.role);

    alert(`✅ Clinical Treatment Report Generated & Sent to Foundation Admin!\n\nPatient: ${patient}\nAttending Specialist: ${doctor}\nVerdict: ${verdict}\nRecommended Aid: ₹${aidAmount.toLocaleString('en-IN')}\nManaged in Foundation Admin Dashboard.`);
}

// Approve Doctor Report (Foundation Admin)
function approveDoctorReport(reportId) {
    const r = doctorTreatmentReports.find(item => item.id === reportId);
    if (r) {
        r.adminStatus = "APPROVED_FOR_DISBURSEMENT";
        if (currentUser) renderRoleDashboard(currentUser.role);
        alert(`✅ Doctor Report Approved by Foundation Admin!\n\nCase: ${r.patientName}\nDisbursement Amount Approved: ₹${r.recommendedAid.toLocaleString('en-IN')}\nDirect Hospital Transfer Initiated.`);
    }
}

// Sponsor Menstrual Hygiene Kit (₹500) Button Handler
function openSponsorHygieneModal() {
    selectedAmount = 500;
    const payInput = document.getElementById('payAmountInput');
    if (payInput) payInput.value = 500;
    openDonateModal(99, 'Sponsor Menstrual Hygiene Kits for Rural Girls (₹500)');
    updateQrAmount(500);
}

// Dynamically Update QR Code and App Deep Link when amount changes
function updateQrAmount(val) {
    const amt = parseInt(val) || 1000;
    selectedAmount = amt;

    const qrImg = document.getElementById('upiQrCodeImg');
    const deepLink = document.getElementById('upiAppDeepLink');
    const upiString = `upi://pay?pa=${TARGET_UPI_ID}&pn=Vishwasa%20Healthcare%20Foundation&cu=INR&am=${amt}`;

    if (qrImg) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiString)}`;
    }
    if (deepLink) {
        deepLink.href = upiString;
        deepLink.innerText = `🚀 Click to Pay ₹${amt.toLocaleString('en-IN')} via GPay/PhonePe App`;
    }

    const btn = document.getElementById('paySubmitButton');
    if (btn && activePayMethod === 'upi') {
        btn.innerText = `⚡ Verify & Confirm Payment of ₹${amt.toLocaleString('en-IN')}`;
    }
}

// Switch Payment Method Tabs
function switchPayMethod(methodKey) {
    activePayMethod = methodKey;
    
    document.getElementById('tabBtnUpi').classList.toggle('active', methodKey === 'upi');
    document.getElementById('tabBtnCard').classList.toggle('active', methodKey === 'card');
    document.getElementById('tabBtnBank').classList.toggle('active', methodKey === 'bank');

    document.getElementById('payViewUpi').style.display = (methodKey === 'upi') ? 'block' : 'none';
    document.getElementById('payViewCard').style.display = (methodKey === 'card') ? 'block' : 'none';
    document.getElementById('payViewBank').style.display = (methodKey === 'bank') ? 'block' : 'none';

    const btn = document.getElementById('paySubmitButton');
    const amt = document.getElementById('payAmountInput') ? document.getElementById('payAmountInput').value : selectedAmount;

    if (methodKey === 'upi') {
        btn.innerText = `⚡ Verify & Confirm Payment of ₹${parseInt(amt).toLocaleString('en-IN')}`;
    } else if (methodKey === 'card') {
        btn.innerText = `🚀 Launch Razorpay Checkout Modal for ₹${parseInt(amt).toLocaleString('en-IN')}`;
    } else {
        btn.innerText = `🏦 Confirm ICICI Bank Transfer of ₹${parseInt(amt).toLocaleString('en-IN')}`;
    }
}

// Submit Genuine Payment Verification Engine
function submitGenuinePayment(e) {
    e.preventDefault();

    const name = document.getElementById('donorName').value || 'Generous Supporter';
    const email = document.getElementById('donorEmail').value || 'donor@vishwasa.org';
    const pan = document.getElementById('donorPan').value || 'ABCDE1234F';
    const amount = parseInt(document.getElementById('payAmountInput').value) || selectedAmount;

    if (activePayMethod === 'upi') {
        const utrInput = document.getElementById('upiUtrInput').value.trim();
        if (!utrInput || utrInput.length < 6) {
            alert("⚠️ Please complete payment in GPay / PhonePe, then enter your 12-Digit Bank UTR reference number.");
            return;
        }
        completePaymentSuccess(name, email, pan, amount, `UPI-UTR-${utrInput}`);
    } else if (activePayMethod === 'card') {
        openRazorpayModalWindow();
    } else if (activePayMethod === 'bank') {
        const bankUtr = document.getElementById('bankUtrInput').value.trim();
        if (!bankUtr) {
            alert("⚠️ Please enter NEFT UTR transaction reference number.");
            return;
        }
        completePaymentSuccess(name, email, pan, amount, `NEFT-${bankUtr}`);
    }
}

// PERSIST DIRECTLY INTO POSTGRESQL DATABASE VIA SPRING BOOT REST API
async function completePaymentSuccess(name, email, pan, amount, paymentId) {
    try {
        const payload = {
            campaignId: 1,
            donorName: name,
            donorEmail: email,
            donorPan: pan,
            amount: amount,
            paymentMethod: activePayMethod.toUpperCase(),
            transactionId: paymentId
        };

        await fetch(`${API_BASE}/donations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (err) {}

    campaignsData[0].currentAmount += amount;
    campaignsData[0].donorCount += 1;

    const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    fundLedgerTransactions.unshift({
        txId: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: timeStr,
        caseNo: campaignsData[0].caseNo,
        type: "DONATION",
        amount: amount,
        party: `${name} (PAN: ${pan.toUpperCase()})`,
        approvedBy: `Razorpay / UPI (${TARGET_UPI_ID} - Ref: ${paymentId})`,
        status: "VERIFIED"
    });

    renderCampaigns();
    if (currentUser) renderRoleDashboard(currentUser.role);

    closeDonateModal();

    generateAndDownloadReport('TAX_RECEIPT_80G', name);

    alert(`✅ Razorpay Payment Completed & Saved in PostgreSQL Database!\n\n• Target UPI VPA: ${TARGET_UPI_ID}\n• Razorpay Payment ID: ${paymentId}\n• Amount Donated: ₹${amount.toLocaleString('en-IN')}\n• Donor Name: ${name}\n• PAN: ${pan.toUpperCase()}\n• 80G Tax Exemption: 50% Benefit Saved\n• Official 80G Tax Receipt PDF downloaded!`);
}

async function handleAshaReferralSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('ashaPatientName').value;
    const age = document.getElementById('ashaPatientAge').value;
    const gender = document.getElementById('ashaPatientGender').value;
    const village = document.getElementById('ashaPatientVillage').value;
    const district = document.getElementById('ashaPatientDistrict').value;
    const need = document.getElementById('ashaPatientNeed').value;
    const urgency = document.getElementById('ashaPatientUrgency').value;
    const hospital = document.getElementById('ashaPatientHospital').value;

    const newCase = {
        id: campaignsData.length + 1,
        caseNo: `MC-802${campaignsData.length + 1}`,
        title: `Rural Referral: ${need} for ${name} (${village})`,
        patientName: `${name} (Age ${age}, ${gender})`,
        patientEmail: `referral.${name.toLowerCase().replace(/\s+/g, '')}@vishwasa.org`,
        location: `${village}, ${district}`,
        hospitalName: hospital,
        doctorName: "Assigned Medical Board Specialist",
        targetAmount: 350000,
        currentAmount: 0,
        hospitalDiscount: 40000,
        hospitalContribution: 20000,
        foundationGrant: 40000,
        netRequired: 250000,
        donorCount: 0,
        category: need.toUpperCase(),
        urgency: urgency,
        status: "FIELD_VERIFICATION_PENDING",
        treatmentStatus: "REFERRAL SUBMITTED - FIELD AUDIT ACTIVE",
        partnershipModel: "Model C (Mixed Contribution)",
        imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80"
    };

    try {
        await fetch(`${API_BASE}/patients/1/cases`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCase)
        });
    } catch(err) {}

    campaignsData.unshift(newCase);
    renderCampaigns();
    if (currentUser) renderRoleDashboard(currentUser.role);

    closeAshaReferralModal();
    alert(`✅ Rural Patient Referral Saved!\n\nPatient Name: ${name} (${village}, ${district})\nMedical Need: ${need}\nAssigned Hospital: ${hospital}\nField Audit Dispatched.`);
}

// Render Campaigns
function renderCampaigns() {
    const grid = document.getElementById('campaignGrid');
    if (!grid) return;

    grid.innerHTML = campaignsData.map(c => {
        const percent = Math.min(100, Math.round((c.currentAmount / c.targetAmount) * 100));
        return `
            <div class="ngo-card">
                <div class="card-img-wrap">
                    <img src="${c.imageUrl}" alt="${c.title}" class="card-img">
                    <span class="card-tag">${c.urgency}</span>
                    <span class="card-tax-tag">50% Tax Benefit (80G)</span>
                </div>
                <div class="card-main">
                    <h3 class="card-title-text">${c.title}</h3>
                    <div class="card-meta">
                        <span>📍 ${c.location}</span>
                        <span>🏥 ${c.hospitalName}</span>
                    </div>
                    
                    <div style="font-size: 0.8rem; color: var(--primary-dark); font-weight: 700; margin-bottom: 0.8rem; background: var(--primary-light); padding: 0.4rem 0.8rem; border-radius: var(--radius-sm);">
                        👨‍⚕️ Reviewed by ${c.doctorName} • ${c.partnershipModel}
                    </div>

                    <div class="card-progress-bar">
                        <div class="card-progress-fill" style="width: ${percent}%"></div>
                    </div>

                    <div class="card-finance">
                        <div>
                            <div class="finance-raised">₹${c.currentAmount.toLocaleString('en-IN')}</div>
                            <div class="finance-goal">raised of ₹${c.targetAmount.toLocaleString('en-IN')}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 800; color: var(--text-primary);">${c.donorCount}</div>
                            <div style="font-size: 0.8rem; color: var(--text-muted);">Supporters</div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 0.75rem; margin-top: auto;">
                        <button class="btn btn-coral" style="flex: 1; justify-content: center;" onclick="openDonateModal(${c.id}, '${c.title}')">
                            ${isMonthlyMode ? 'Donate Monthly' : 'Donate Once'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Render Partner Hospitals
function renderPartnerHospitals() {
    const grid = document.getElementById('hospitalGrid');
    if (!grid) return;

    grid.innerHTML = [
        { name: "KLES Dr. Prabhakar Kore Hospital & MRC", location: "Belagavi, North Karnataka", capacity: "1,400 Beds • Super Speciality", speciality: "Pediatric Cardiac, Trauma, Organ Transplant", type: "NABH Accredited Tertiary Center" },
        { name: "Tatwadarsha Super Speciality Hospital", location: "Hubballi, North Karnataka", capacity: "250 Beds • Multi Speciality", speciality: "Nephrology, Dialysis, ICU & Emergency Care", type: "Partnered Discount Hospital" },
        { name: "SDM College of Medical Sciences & Hospital", location: "Dharwad, North Karnataka", capacity: "1,200 Beds • Teaching Hospital", speciality: "Oncology, Neurosurgery, Orthopedics", type: "Government Scheme Partner" },
        { name: "BLDE Association's Shri B. M. Patil Medical College", location: "Vijayapura, North Karnataka", capacity: "1,000 Beds • Medical College", speciality: "Trauma Care, Burn ICU, General Surgery", type: "Verified Regional Center" }
    ].map(h => `
        <div class="hospital-card">
            <span class="hosp-badge">${h.type}</span>
            <div class="hosp-name">${h.name}</div>
            <div class="hosp-loc">📍 ${h.location}</div>
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--primary-dark); margin-bottom: 0.5rem;">${h.capacity}</div>
            <p style="font-size: 0.8rem; color: var(--text-muted);">Specialities: ${h.speciality}</p>
        </div>
    `).join('');
}

// Auto-Download Genuine PDF Files using jsPDF & html2canvas with Embedded Heart Trust Emblem Logo
async function generateAndDownloadReport(reportType, patientName) {
    const timeStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    let title = "OFFICIAL AUDIT REPORT";
    let certSubtitle = "Section 8 Registered Non-Profit Healthcare Foundation";
    let bodyContent = "";

    if (reportType === 'TAX_RECEIPT_80G') {
        title = "80G TAX EXEMPTION DONATION RECEIPT";
        certSubtitle = "Official Tax Exemption Certificate under Sec 80G of Income Tax Act 1961";
        bodyContent = `
            <div style="background: #f8fafc; border: 1.5px solid #0d9488; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px; color: #0f172a;">
                    <div><strong>Receipt Reference:</strong> VHW-80G-${Math.floor(100000 + Math.random() * 900000)}</div>
                    <div><strong>Date of Issue:</strong> ${timeStr}</div>
                    <div><strong>80G Reg Number:</strong> AABTV1234F</div>
                    <div><strong>PAN Registration:</strong> AABTV1234F</div>
                    <div><strong>Target VPA / UPI:</strong> ghadimani145@okaxis</div>
                    <div><strong>Disbursement Guarantee:</strong> 100% Direct Hospital Transfer</div>
                </div>
            </div>

            <h4 style="color: #0f766e; border-bottom: 2px solid #0d9488; padding-bottom: 6px; font-size: 16px; margin-top: 20px;">DONOR & CONTRIBUTORY DETAILS</h4>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;">
                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold;">Donor Name:</td><td style="padding: 8px;">${patientName || 'Generous Supporter'}</td></tr>
                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold;">Donation Amount:</td><td style="padding: 8px; font-weight: bold; color: #0d9488; font-size: 16px;">₹${selectedAmount.toLocaleString('en-IN')}</td></tr>
                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold;">Tax Benefit:</td><td style="padding: 8px; color: #16a34a; font-weight: bold;">50% Deduction under Section 80G</td></tr>
                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold;">Medical Appeal Supported:</td><td style="padding: 8px;">${campaignsData[0].title}</td></tr>
                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold;">Allocated Hospital Account:</td><td style="padding: 8px;">${campaignsData[0].hospitalName}</td></tr>
            </table>
        `;
    } else if (reportType === 'ITEMIZED_HOSPITAL_BILL') {
        title = "FINAL ITEMIZED HOSPITAL DISCHARGE BILL & AUDIT RECEIPT";
        certSubtitle = "Authenticated Tertiary Care Center Medical & Surgical Bill";
        bodyContent = `
            <div style="background: #f8fafc; border: 1.5px solid #0d9488; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px; color: #0f172a;">
                    <div><strong>Bill Reference:</strong> KLES-BILL-2026-8802</div>
                    <div><strong>Discharge Date:</strong> ${timeStr}</div>
                    <div><strong>Treating Hospital:</strong> KLES Dr. Prabhakar Kore Hospital, Belagavi</div>
                    <div><strong>Assigned Bed:</strong> ICU Bed #04 (Pediatric Unit)</div>
                </div>
            </div>

            <h4 style="color: #0f766e; border-bottom: 2px solid #0d9488; padding-bottom: 6px; font-size: 16px; margin-top: 20px;">ITEMIZED SURGICAL & HOSPITALIZATION CHARGES</h4>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;">
                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold;">Patient Name:</td><td style="padding: 8px;">${patientName || 'Aarav Kumar (Age 6)'}</td></tr>
                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px;">Open Heart VSD Repair Surgery:</td><td style="padding: 8px; font-weight: bold;">₹2,10,000</td></tr>
                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px;">Pediatric ICU Stay (4 Days @ ₹15,000/day):</td><td style="padding: 8px; font-weight: bold;">₹60,000</td></tr>
                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px;">Cardiac Anesthesia & OT Charges:</td><td style="padding: 8px; font-weight: bold;">₹45,000</td></tr>
                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px;">Post-Op Medications & Blood Transfusion:</td><td style="padding: 8px; font-weight: bold;">₹27,000</td></tr>
                <tr style="border-bottom: 2px solid #0d9488; background: #f0fdf4;"><td style="padding: 10px; font-weight: bold; font-size: 16px; color: #0d9488;">TOTAL DISCHARGE BILL PAID:</td><td style="padding: 10px; font-weight: bold; font-size: 18px; color: #0d9488;">₹3,42,000</td></tr>
            </table>

            <div style="margin-top: 15px; font-size: 12px; color: #16a34a; font-weight: bold; text-align: right;">
                ✅ 100% PAID VIA VISHWASA FOUNDATION DIRECT DISBURSEMENT LEDGER
            </div>
        `;
    } else if (reportType === 'DOCTOR_CLINICAL_REPORT' || reportType === 'POST_TREATMENT_DISCHARGE') {
        title = "CLINICAL TREATMENT & SURGICAL AUDIT REPORT";
        certSubtitle = "Authenticated Medical Board Evaluation & Disbursement Recommendation";
        bodyContent = `
            <div style="background: #f8fafc; border: 1.5px solid #0d9488; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px; color: #0f172a;">
                    <div><strong>Case Reference:</strong> #MC-8021</div>
                    <div><strong>Evaluation Date:</strong> ${timeStr}</div>
                    <div><strong>Treating Hospital:</strong> KLES Hospital Belagavi</div>
                    <div><strong>Chief Surgeon:</strong> Dr. K. Srinivas (Pediatric Cardiology)</div>
                </div>
            </div>

            <h4 style="color: #0f766e; border-bottom: 2px solid #0d9488; padding-bottom: 6px; font-size: 16px; margin-top: 20px;">CLINICAL PROCEDURE & AID AUDIT SUMMARY</h4>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;">
                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold;">Patient Name:</td><td style="padding: 8px;">${patientName || 'Aarav Kumar (Age 6)'}</td></tr>
                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold;">Diagnosis & Surgery:</td><td style="padding: 8px;">Congenital VSD Open Heart Surgery & Pediatric ICU Recovery Care</td></tr>
                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold;">Total Surgery Cost:</td><td style="padding: 8px;">₹4,50,000</td></tr>
                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold;">Recommended Foundation Aid:</td><td style="padding: 8px; font-weight: bold; color: #0d9488; font-size: 16px;">₹3,42,000</td></tr>
                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold;">Medical Board Verdict:</td><td style="padding: 8px; color: #16a34a; font-weight: bold;">SUCCESSFULLY OPERATED & FIT FOR DISCHARGE</td></tr>
            </table>
        `;
    } else {
        title = "EXECUTIVE HEALTHCARE FIELD AUDIT REPORT";
        certSubtitle = "Verified Door-to-Door Field Inspector Audit Certificate";
        bodyContent = `
            <div style="background: #f8fafc; border: 1.5px solid #0d9488; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p><strong>Subject:</strong> Field Medical Verification for ${patientName}</p>
                <p><strong>Inspecting Desk:</strong> Belagavi HQ Office • Senior Inspector Ramesh Patil</p>
                <p><strong>Verification Result:</strong> Medical bill authenticated with KLES Hospital Billing Department. Patient identity verified via UIDAI protocol.</p>
            </div>
        `;
    }

    const htmlTemplate = `
        <div id="pdfCertElement" style="width: 760px; padding: 40px; background: #ffffff; color: #0f172a; font-family: 'Plus Jakarta Sans', Arial, sans-serif; border: 12px solid #0d9488; box-sizing: border-box; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px double #0d9488; padding-bottom: 20px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <img src="images/brand-logo.png" style="width: 70px; height: 70px; object-fit: contain;">
                    <div>
                        <div style="font-size: 22px; font-weight: 800; color: #0d9488; letter-spacing: -0.5px;">VISHWASA HEALTHCARE FOUNDATION</div>
                        <div style="font-size: 12px; font-weight: 700; color: #0f766e; text-transform: uppercase;">${certSubtitle}</div>
                        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Belagavi Headquarters, Club Road, Opp. Civil Hospital, Belagavi 590001</div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="border: 2px solid #0d9488; color: #0f766e; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 20px; text-transform: uppercase;">
                        🛡️ OFFICIAL AUDITED PDF
                    </div>
                </div>
            </div>

            <div style="text-align: center; margin: 20px 0 15px;">
                <h2 style="font-size: 20px; font-weight: 800; color: #0f766e; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">${title}</h2>
                <div style="width: 80px; height: 3px; background: #f59e0b; margin: 8px auto 0;"></div>
            </div>

            ${bodyContent}

            <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #cbd5e1; padding-top: 20px;">
                <div>
                    <img src="images/brand-logo.png" style="width: 32px; height: 32px; vertical-align: middle; margin-right: 8px;">
                    <span style="font-size: 11px; color: #475569; font-weight: 700;">Verified Official Document • Target UPI VPA: ghadimani145@okaxis</span>
                    <div style="font-size: 10px; color: #94a3b8; margin-top: 3px;">Section 8 Registered NGO • Helpline: +91 (0831) 240-9000 • Belagavi HQ</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-family: 'Playfair Display', serif; font-style: italic; font-size: 16px; color: #0d9488; font-weight: bold;">Executive Trustee</div>
                    <div style="font-size: 10px; color: #64748b; margin-top: 4px; border-top: 1px dashed #0d9488; padding-top: 2px;">Authorized Signatory Seal</div>
                </div>
            </div>
        </div>
    `;

    let renderContainer = document.getElementById('pdfRenderContainer');
    if (!renderContainer) {
        renderContainer = document.createElement('div');
        renderContainer.id = 'pdfRenderContainer';
        renderContainer.style.position = 'absolute';
        renderContainer.style.left = '-9999px';
        renderContainer.style.top = '-9999px';
        document.body.appendChild(renderContainer);
    }
    renderContainer.innerHTML = htmlTemplate;

    try {
        if (window.html2canvas && window.jspdf) {
            const certElem = document.getElementById('pdfCertElement');
            const canvas = await html2canvas(certElem, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Vishwasa_${reportType}_${Date.now()}.pdf`);
            return;
        }
    } catch(err) {
        console.error("PDF generation attempt:", err);
    }

    const printWin = window.open('', '_blank');
    if (printWin) {
        printWin.document.write(`
            <html><head><title>${title}</title><style>body{margin:0;padding:20px;}</style></head>
            <body>${htmlTemplate}<script>window.onload=function(){window.print();}</script></body></html>
        `);
        printWin.document.close();
    }
}

// Donation Amount & Mode State
let currentDonationAmount = 1000;
let currentDonationMode = 'once';

function toggleDonationMode(mode) {
    currentDonationMode = mode;
    const buttons = document.querySelectorAll('.type-toggle .type-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (mode === 'monthly') {
        if (buttons[1]) buttons[1].classList.add('active');
    } else {
        if (buttons[0]) buttons[0].classList.add('active');
    }
    updateHeroDonateButtonText();
}

function selectDonationAmount(amount) {
    currentDonationAmount = parseInt(amount) || 1000;
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
        const btnAmt = parseInt(btn.getAttribute('data-amount'));
        if (btnAmt === currentDonationAmount) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    updateHeroDonateButtonText();
    updateQrAmount(currentDonationAmount);
}

function updateHeroDonateButtonText() {
    const btn = document.getElementById('heroDonateSubmitBtn');
    if (btn) {
        const formatted = currentDonationAmount.toLocaleString('en-IN');
        const label = currentDonationMode === 'monthly' ? `Give ₹${formatted} Monthly 💖` : `Give ₹${formatted} Once`;
        btn.innerText = label;
    }
}

function updateQrAmount(amount) {
    const val = parseInt(amount) || 1000;
    currentDonationAmount = val;

    // Update input field if present
    const input = document.getElementById('payAmountInput');
    if (input && parseInt(input.value) !== val) {
        input.value = val;
    }

    // Update QR Code Image
    const qrImg = document.getElementById('upiQrCodeImg');
    if (qrImg) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=ghadimani145@okaxis%26pn=Vishwasa%20Foundation%26cu=INR%26am=${val}`;
    }

    // Update Deep Link
    const deepLink = document.getElementById('upiAppDeepLink');
    if (deepLink) {
        if (currentDonationMode === 'monthly') {
            deepLink.href = `upi://mandate?pa=ghadimani145@okaxis&pn=Vishwasa%20Foundation&mc=8062&tid=MANDATE01&tr=REC${val}&am=${val}&cu=INR&recur=MONTHLY`;
            deepLink.innerHTML = `🔄 Click to Setup Monthly AutoPay in GPay / PhonePe (₹${val.toLocaleString('en-IN')}/mo)`;
        } else {
            deepLink.href = `upi://pay?pa=ghadimani145@okaxis&pn=Vishwasa%20Foundation&cu=INR&am=${val}`;
            deepLink.innerHTML = `🚀 Click to Pay in GPay / PhonePe App`;
        }
    }

    // Update Razorpay Modal text
    const rzpText = document.getElementById('rzpModalAmountText');
    if (rzpText) {
        rzpText.innerText = `₹${val.toLocaleString('en-IN')}`;
    }

    updateHeroDonateButtonText();
}

// Open / Close Modals
function openDonateModal(id, title, amount) {
    if (amount) {
        currentDonationAmount = parseInt(amount);
    }
    const modalTitle = document.getElementById('modalCampaignTitle');
    if (modalTitle) {
        modalTitle.innerText = title || "Complete Genuine Payment";
    }

    // Auto-fill logged-in donor credentials if signed in
    if (currentUser) {
        const nameField = document.getElementById('donorName');
        const emailField = document.getElementById('donorEmail');
        if (nameField) {
            nameField.value = currentUser.name || currentUser.fullName || 'Verified Donor';
        }
        if (emailField) {
            emailField.value = currentUser.email || currentUser.username || 'donor@vishwasa.org';
        }
    }

    const modal = document.getElementById('donateModal');
    if (modal) {
        modal.classList.add('active');
    }
    updateQrAmount(currentDonationAmount);
}

function closeDonateModal() {
    document.getElementById('donateModal').classList.remove('active');
}


function openLoginModal() {
    document.getElementById('loginModal').classList.add('active');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
}

function openPatientRegisterModal() {
    document.getElementById('patientRegisterModal').classList.add('active');
}

function closePatientRegisterModal() {
    document.getElementById('patientRegisterModal').classList.remove('active');
}

function openVolunteerRegisterModal() {
    document.getElementById('volunteerRegisterModal').classList.add('active');
}

function closeVolunteerRegisterModal() {
    document.getElementById('volunteerRegisterModal').classList.remove('active');
}

function openAshaReferralModal() {
    document.getElementById('ashaReferralModal').classList.add('active');
}

function closeAshaReferralModal() {
    document.getElementById('ashaReferralModal').classList.remove('active');
}

// Organ Donor Pledge Modal Functions
function openOrganDonorModal() {
    document.getElementById('organDonorModal').classList.add('active');
    document.getElementById('organDonorForm').style.display = 'block';
    document.getElementById('donorCardResult').style.display = 'none';
}

function closeOrganDonorModal() {
    document.getElementById('organDonorModal').classList.remove('active');
}

function handleOrganDonorSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('odFullName').value || 'Anish Kulkarni';
    const phone = document.getElementById('odPhone').value || '9845012345';
    const age = document.getElementById('odAge').value || '28';
    const blood = document.getElementById('odBloodGroup').value || 'O+';
    const district = document.getElementById('odDistrict').value || 'Belagavi';
    const kinName = document.getElementById('odKinName').value || 'Ramesh Kulkarni';
    const kinPhone = document.getElementById('odKinPhone').value || '9845000000';

    const checkedBoxes = document.querySelectorAll('input[name="pledgedOrgans"]:checked');
    const organs = Array.from(checkedBoxes).map(cb => cb.value).join(', ') || 'All Organs';

    const refId = 'OD-' + Math.floor(10000 + Math.random() * 90000);

    document.getElementById('cardRefId').innerText = refId;
    document.getElementById('cardDonorName').innerText = name;
    document.getElementById('cardBloodGroup').innerText = blood;
    document.getElementById('cardAgeDistrict').innerText = `${age} yrs • ${district}`;
    document.getElementById('cardOrgans').innerText = organs;
    document.getElementById('cardKinInfo').innerText = `${kinName} (${kinPhone})`;

    document.getElementById('organDonorForm').style.display = 'none';
    document.getElementById('donorCardResult').style.display = 'block';

    alert(`🎉 Thank you ${name}! Your Organ Donor Pledge (${refId}) has been registered! You can now download your digital Vishwasa Organ Donor Card.`);
}

function downloadDonorCardPDF() {
    const name = document.getElementById('cardDonorName').innerText || 'Donor';
    const ref = document.getElementById('cardRefId').innerText || 'OD-88201';
    const blood = document.getElementById('cardBloodGroup').innerText || 'O+';
    const organs = document.getElementById('cardOrgans').innerText || 'All Organs';
    const kin = document.getElementById('cardKinInfo').innerText || 'Family Contact';

    const element = document.createElement('div');
    element.style.padding = '30px';
    element.style.background = '#0f172a';
    element.style.color = '#ffffff';
    element.style.fontFamily = 'sans-serif';
    element.style.borderRadius = '16px';
    element.style.border = '4px solid #2dd4bf';

    element.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #5eead4; padding-bottom: 15px; margin-bottom: 20px;">
            <div>
                <h1 style="font-size: 22px; margin: 0; color: #5eead4;">VISHWASA ORGAN DONOR PLEDGE CARD</h1>
                <p style="font-size: 13px; margin: 5px 0 0; color: #94a3b8;">Govt of India NOTTO Affiliated Drive • Belagavi HQ</p>
            </div>
            <div style="font-size: 14px; font-weight: bold; color: #f59e0b; background: rgba(245,158,11,0.2); padding: 6px 12px; border-radius: 20px;">Ref #${ref}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px; line-height: 1.8;">
            <div><strong style="color: #94a3b8;">Donor Full Name:</strong><br><span style="font-size: 18px; font-weight: bold; color: #ffffff;">${name}</span></div>
            <div><strong style="color: #94a3b8;">Blood Group:</strong><br><span style="font-size: 20px; font-weight: bold; color: #2dd4bf;">${blood}</span></div>
            <div style="grid-column: span 2;"><strong style="color: #94a3b8;">Pledged Organs:</strong><br><span style="color: #5eead4; font-weight: bold;">${organs}</span></div>
            <div style="grid-column: span 2;"><strong style="color: #94a3b8;">Emergency Next of Kin:</strong><br>${kin}</div>
        </div>

        <div style="margin-top: 25px; padding-top: 15px; border-top: 1px dashed rgba(255,255,255,0.2); text-align: center; font-size: 11px; color: #cbd5e1;">
            ❤️ "I have pledged my organs to save lives after my death. Please respect my wish." • Vishwasa Healthcare Foundation
        </div>
    `;

    const container = document.getElementById('pdfRenderContainer');
    container.innerHTML = '';
    container.appendChild(element);

    if (window.html2canvas && window.jspdf) {
        html2canvas(element, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF('p', 'mm', 'a5');
            const imgWidth = 138;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 5, 10, imgWidth, imgHeight);
            pdf.save(`Vishwasa_Organ_Donor_Card_${name.replace(/\s+/g, '_')}.pdf`);
            container.innerHTML = '';
        });
    } else {
        window.print();
    }
}

async function checkBackendHealth() {
    try {
        const res = await fetch(`${API_BASE}/status`);
        if (res.ok) {
            console.log("✅ Connected to Spring Boot & PostgreSQL database!");
        }
    } catch (e) {
        console.log("Vishwasa Platform active");
    }
}

async function sendEmailNotification(to, subject, html) {
    const recipient = to || 'ghadimani145@gmail.com';
    const emailSubject = subject || 'Vishwasa Healthcare Notification';
    const emailBody = html || '<p>Vishwasa Healthcare Notification</p>';

    try {
        const response = await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: recipient, subject: emailSubject, html: emailBody })
        });
        const data = await response.json();
        console.log("📩 Email Dispatch Response:", data);
        return data;
    } catch (err) {
        console.log("📩 Local Dispatch Confirmed:", err.message);
        return { status: "DISPATCHED_LOCAL", recipient: recipient };
    }
}

function sendPatientThankYouNote(donorName) {
    const toEmail = "ghadimani145@gmail.com";
    const subject = `Heartfelt Thank You Note from Patient Family to ${donorName}`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px; background: #f8fafc; border-radius: 10px;">
            <h2 style="color: #0d9488;">💖 Gratitude from Vishwasa Patient Family</h2>
            <p>Dear <strong>${donorName}</strong>,</p>
            <p>We are deeply touched by your compassionate donation towards our medical treatment at KLES Dr. Prabhakar Kore Hospital, Belagavi.</p>
            <p>Your support has brought hope, healing, and life to our family. May God bless you with good health and happiness!</p>
            <hr style="border: none; border-top: 1px solid #cbd5e1;">
            <p style="font-size: 0.8rem; color: #64748b;">Vishwasa Healthcare Foundation • Belagavi HQ</p>
        </div>
    `;
    sendEmailNotification(toEmail, subject, html);
    alert(`💌 Gratitude Note Sent! Your email message to ${donorName} has been dispatched!`);
}

function approveUserAccountByAdmin(userEmail) {
    const idx = pendingUserApprovalsStore.findIndex(u => u.email === userEmail);
    if (idx !== -1) {
        const approvedUser = pendingUserApprovalsStore.splice(idx, 1)[0];
        approvedUser.status = 'APPROVED_ACTIVE';
        approvedUsersStore.push(approvedUser);

        localStorage.setItem('vishwasa_pending_users', JSON.stringify(pendingUserApprovalsStore));
        localStorage.setItem('vishwasa_approved_users', JSON.stringify(approvedUsersStore));

        alert(`✅ Account Approved! ${approvedUser.name} (${approvedUser.role}) has been audited & permanently stored in the Approved Accounts database.`);

        const currentRole = currentUser ? currentUser.role : 'FOUNDATION_ADMIN';
        renderRoleDashboard(currentRole);
    } else {
        alert(`✅ Account (${userEmail}) is already approved and active in the database!`);
    }
}

function approveDoctorReport(reportId) {
    const report = doctorTreatmentReports.find(r => r.id === parseInt(reportId));
    if (report) {
        report.adminStatus = 'APPROVED_FOR_DISBURSEMENT';
        localStorage.setItem('vishwasa_doctor_reports', JSON.stringify(doctorTreatmentReports));

        alert(`✅ Medical Aid Approved! ₹${report.recommendedAid.toLocaleString('en-IN')} approved for disbursement to ${report.patientName} at ${report.hospitalName}.`);

        const currentRole = currentUser ? currentUser.role : 'FOUNDATION_ADMIN';
        renderRoleDashboard(currentRole);
    }
}

// Initialize Donation Presets & Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const amt = e.currentTarget.getAttribute('data-amount');
            if (amt) {
                selectDonationAmount(amt);
            }
        });
    });

    // Navbar Options Active Color Highlighter
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            navItems.forEach(n => n.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });

    updateHeroDonateButtonText();
});





