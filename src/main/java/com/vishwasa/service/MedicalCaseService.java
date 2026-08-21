package com.vishwasa.service;

import com.vishwasa.dto.MedicalCaseRequest;
import com.vishwasa.entity.MedicalCase;
import com.vishwasa.entity.Patient;
import com.vishwasa.enums.CaseStatus;
import com.vishwasa.repository.MedicalCaseRepository;
import com.vishwasa.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MedicalCaseService {

    private final MedicalCaseRepository medicalCaseRepository;
    private final PatientRepository patientRepository;

    public MedicalCase createMedicalCase(Long patientId, MedicalCaseRequest request) {
        if (!patientRepository.existsById(patientId)) {
            throw new RuntimeException("Patient not found");
        }

        String caseNumber = "MED-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        MedicalCase medicalCase = MedicalCase.builder()
                .patientId(patientId)
                .caseNumber(caseNumber)
                .status(CaseStatus.SUBMITTED)
                .priority(request.getPriority())
                .diagnosis(request.getDiagnosis())
                .medicalCondition(request.getMedicalCondition())
                .symptoms(request.getSymptoms())
                .medicalHistory(request.getMedicalHistory())
                .documents(request.getDocuments())
                .estimatedCost(request.getEstimatedCost())
                .amountRequired(request.getEstimatedCost())
                .amountRaised(java.math.BigDecimal.ZERO)
                .amountUtilized(java.math.BigDecimal.ZERO)
                .physicalVerificationCompleted(false)
                .medicallyVerified(false)
                .notes(request.getNotes())
                .build();

        return medicalCaseRepository.save(medicalCase);
    }

    public MedicalCase getMedicalCaseById(Long id) {
        return medicalCaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical case not found"));
    }

    public MedicalCase getMedicalCaseByNumber(String caseNumber) {
        return medicalCaseRepository.findByCaseNumber(caseNumber)
                .orElseThrow(() -> new RuntimeException("Medical case not found"));
    }

    public List<MedicalCase> getCasesByPatientId(Long patientId) {
        return medicalCaseRepository.findByPatientId(patientId);
    }

    public List<MedicalCase> getCasesByStatus(CaseStatus status) {
        return medicalCaseRepository.findByStatus(status);
    }

    public MedicalCase updateStatus(Long caseId, CaseStatus status) {
        MedicalCase medicalCase = getMedicalCaseById(caseId);
        medicalCase.setStatus(status);
        return medicalCaseRepository.save(medicalCase);
    }

    public MedicalCase assignVolunteer(Long caseId, Long volunteerId) {
        MedicalCase medicalCase = getMedicalCaseById(caseId);
        medicalCase.setAssignedVolunteerId(volunteerId);
        medicalCase.setVolunteerAssignedDate(LocalDateTime.now());
        medicalCase.setStatus(CaseStatus.FIELD_VERIFICATION);
        return medicalCaseRepository.save(medicalCase);
    }

    public MedicalCase completePhysicalVerification(Long caseId, Boolean verified, Integer verificationScore) {
        MedicalCase medicalCase = getMedicalCaseById(caseId);
        medicalCase.setPhysicalVerificationCompleted(verified);
        medicalCase.setVerificationScore(verificationScore);
        medicalCase.setVolunteerVisitDate(LocalDateTime.now());
        if (verified) {
            medicalCase.setStatus(CaseStatus.MEDICAL_REVIEW);
        } else {
            medicalCase.setStatus(CaseStatus.REJECTED);
        }
        return medicalCaseRepository.save(medicalCase);
    }

    public MedicalCase assignDoctor(Long caseId, Long doctorId) {
        MedicalCase medicalCase = getMedicalCaseById(caseId);
        medicalCase.setAssignedDoctorId(doctorId);
        return medicalCaseRepository.save(medicalCase);
    }

    public MedicalCase completeMedicalReview(Long caseId, Boolean verified, String notes) {
        MedicalCase medicalCase = getMedicalCaseById(caseId);
        medicalCase.setMedicallyVerified(verified);
        medicalCase.setMedicalReviewDate(LocalDateTime.now());
        medicalCase.setNotes(notes);
        if (verified) {
            medicalCase.setStatus(CaseStatus.HOSPITAL_ESTIMATE);
        } else {
            medicalCase.setStatus(CaseStatus.REJECTED);
        }
        return medicalCaseRepository.save(medicalCase);
    }

    public MedicalCase assignHospital(Long caseId, Long hospitalId) {
        MedicalCase medicalCase = getMedicalCaseById(caseId);
        medicalCase.setAssignedHospitalId(hospitalId);
        return medicalCaseRepository.save(medicalCase);
    }

    public MedicalCase updateHospitalEstimate(Long caseId, java.math.BigDecimal estimatedCost,
                                              java.math.BigDecimal hospitalDiscount,
                                              java.math.BigDecimal hospitalContribution) {
        MedicalCase medicalCase = getMedicalCaseById(caseId);
        medicalCase.setEstimatedCost(estimatedCost);
        medicalCase.setHospitalDiscount(hospitalDiscount);
        medicalCase.setHospitalContribution(hospitalContribution);

        java.math.BigDecimal amountRequired = estimatedCost
                .subtract(hospitalDiscount != null ? hospitalDiscount : java.math.BigDecimal.ZERO)
                .subtract(hospitalContribution != null ? hospitalContribution : java.math.BigDecimal.ZERO);
        medicalCase.setAmountRequired(amountRequired);

        return medicalCaseRepository.save(medicalCase);
    }

    public MedicalCase approveCase(Long caseId) {
        MedicalCase medicalCase = getMedicalCaseById(caseId);
        medicalCase.setStatus(CaseStatus.APPROVED);
        medicalCase.setApprovalDate(LocalDateTime.now());
        return medicalCaseRepository.save(medicalCase);
    }

    public MedicalCase startTreatment(Long caseId) {
        MedicalCase medicalCase = getMedicalCaseById(caseId);
        medicalCase.setStatus(CaseStatus.TREATMENT_STARTED);
        medicalCase.setTreatmentStartDate(LocalDateTime.now());
        return medicalCaseRepository.save(medicalCase);
    }

    public MedicalCase completeTreatment(Long caseId) {
        MedicalCase medicalCase = getMedicalCaseById(caseId);
        medicalCase.setStatus(CaseStatus.TREATMENT_COMPLETED);
        medicalCase.setTreatmentEndDate(LocalDateTime.now());
        return medicalCaseRepository.save(medicalCase);
    }

    public MedicalCase closeCase(Long caseId) {
        MedicalCase medicalCase = getMedicalCaseById(caseId);
        medicalCase.setStatus(CaseStatus.CLOSED);
        medicalCase.setClosureDate(LocalDateTime.now());
        return medicalCaseRepository.save(medicalCase);
    }
}
