import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportPatientMedicalSummary = (patient, records = []) => {
  const doc = new jsPDF();

  // Primary Header
  doc.setFillColor(15, 118, 110); // clinical-700
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ANVAY - Interconnected Hospital Healthcare Network', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Longitudinal Patient Medical Summary Document', 14, 19);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 145, 19);

  // Patient Identity Box
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(14, 32, 182, 38, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, 32, 182, 38, 'S');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${patient.fullName} (${patient.gender}, ${patient.age} yrs)`, 20, 41);

  doc.setFontSize(10);
  doc.setTextColor(13, 148, 136); // clinical-600
  doc.text(`ANVAY HEALTH ID: ${patient.anvayId}`, 20, 48);

  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Blood Group: ${patient.bloodGroup || 'Not Recorded'}`, 20, 56);
  doc.text(`Govt Identity Ref: ${patient.govtIdRef || 'N/A'}`, 75, 56);
  doc.text(`Emergency Phone: ${patient.emergencyContactPhone || 'N/A'}`, 130, 56);

  doc.text(`Originating Hospital: ${patient.registeredByHospitalName || 'Network Hospital'}`, 20, 64);
  doc.text(`Location: ${patient.district || 'N/A'}, ${patient.state || 'N/A'}`, 130, 64);

  let currentY = 76;

  // 1. Confirmed Allergies
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text('1. Clinical Allergies & Sensitivities', 14, currentY);
  currentY += 4;

  const allergyRows = (patient.allergies || []).map(a => [
    a.substance || 'None',
    a.severity || 'Mild',
    a.reaction || 'None reported',
    a.status || 'Confirmed',
    a.hospital || 'Network Hospital',
    a.diagnosedBy || 'Physician'
  ]);

  if (allergyRows.length === 0) {
    allergyRows.push(['No Known Allergies Recorded (Verification Required)', '-', '-', 'Unconfirmed', '-', '-']);
  }

  doc.autoTable({
    startY: currentY,
    head: [['Substance', 'Severity', 'Reaction', 'Status', 'Diagnosing Hospital', 'Diagnosing Doctor']],
    body: allergyRows,
    theme: 'grid',
    headStyles: { fillStyle: 'F', fillColor: [51, 65, 85], textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // 2. Active Conditions & Medications
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text('2. Active Chronic Conditions & Prescriptions', 14, currentY);
  currentY += 4;

  const conditionRows = (patient.chronicConditions || []).map(c => [
    c.condition,
    c.status || 'Active',
    c.diagnosedDate || 'N/A',
    c.hospital || 'Network Hospital',
    c.doctor || 'Physician'
  ]);

  const medicineRows = (patient.activeMedicines || []).map(m => [
    m.medicineName,
    m.dosage,
    m.startDate || 'N/A',
    m.hospital || 'Network Hospital',
    m.prescribedBy || 'Physician'
  ]);

  const combinedMedRows = [...conditionRows, ...medicineRows];
  if (combinedMedRows.length === 0) {
    combinedMedRows.push(['No active chronic conditions or medications recorded', '-', '-', '-', '-']);
  }

  doc.autoTable({
    startY: currentY,
    head: [['Clinical Item / Medicine', 'Status / Regimen', 'Recorded Date', 'Source Hospital', 'Prescribing Doctor']],
    body: combinedMedRows,
    theme: 'grid',
    headStyles: { fillStyle: 'F', fillColor: [51, 65, 85], textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // Check if we need a new page for Longitudinal Records Table
  if (currentY > 200) {
    doc.addPage();
    currentY = 20;
  }

  // 3. Multi-Hospital Longitudinal Medical Records
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text('3. Longitudinal Clinical Encounters & Diagnostic Reports (Chronological)', 14, currentY);
  currentY += 4;

  const recordRows = (records || []).map(r => [
    new Date(r.createdAt).toLocaleDateString(),
    r.recordType || 'General',
    r.title || 'Clinical Encounter',
    r.hospitalName || 'Network Hospital',
    r.doctorName || 'Doctor',
    r.verificationStatus || 'Verified',
    r.recordId || '-'
  ]);

  if (recordRows.length === 0) {
    recordRows.push(['-', '-', 'No prior clinical records found', '-', '-', '-', '-']);
  }

  doc.autoTable({
    startY: currentY,
    head: [['Record Date', 'Record Type', 'Clinical Summary / Diagnosis', 'Source Hospital', 'Source Doctor', 'Hospital Verification Status', 'Record ID']],
    body: recordRows,
    theme: 'grid',
    headStyles: { fillStyle: 'F', fillColor: [15, 118, 110], textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    margin: { left: 14, right: 14 }
  });

  // Footer Disclaimer
  const finalY = doc.lastAutoTable.finalY + 12;
  const pageHeight = doc.internal.pageSize.height;
  const footerY = Math.min(finalY, pageHeight - 15);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text(
    'ANVAY Interoperability Guarantee: Each entry permanently preserves its source hospital, source doctor, and timestamp metadata.',
    14,
    footerY
  );
  doc.text('For authorized hospital verification, consult the central ANVAY Registry.', 14, footerY + 4);

  // Save the PDF
  doc.save(`ANVAY_Medical_Summary_${patient.anvayId}.pdf`);
};
