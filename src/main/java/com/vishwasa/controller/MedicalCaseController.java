package com.vishwasa.controller;

import com.vishwasa.entity.MedicalCase;
import com.vishwasa.enums.CaseStatus;
import com.vishwasa.service.MedicalCaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-cases")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MedicalCaseController {

    private final MedicalCaseService medicalCaseService;

    @GetMapping("/{id}")
    public ResponseEntity<MedicalCase> getMedicalCase(@PathVariable Long id) {
        MedicalCase medicalCase = medicalCaseService.getMedicalCaseById(id);
        return ResponseEntity.ok(medicalCase);
    }

    @GetMapping("/number/{caseNumber}")
    public ResponseEntity<MedicalCase> getMedicalCaseByNumber(@PathVariable String caseNumber) {
        MedicalCase medicalCase = medicalCaseService.getMedicalCaseByNumber(caseNumber);
        return ResponseEntity.ok(medicalCase);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalCase>> getCasesByPatient(@PathVariable Long patientId) {
        List<MedicalCase> cases = medicalCaseService.getCasesByPatientId(patientId);
        return ResponseEntity.ok(cases);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<MedicalCase>> getCasesByStatus(@PathVariable CaseStatus status) {
        List<MedicalCase> cases = medicalCaseService.getCasesByStatus(status);
        return ResponseEntity.ok(cases);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<MedicalCase> updateStatus(
            @PathVariable Long id,
            @RequestParam CaseStatus status) {
        MedicalCase medicalCase = medicalCaseService.updateStatus(id, status);
        return ResponseEntity.ok(medicalCase);
    }

    @PutMapping("/{id}/assign-volunteer")
    public ResponseEntity<MedicalCase> assignVolunteer(
            @PathVariable Long id,
            @RequestParam Long volunteerId) {
        MedicalCase medicalCase = medicalCaseService.assignVolunteer(id, volunteerId);
        return ResponseEntity.ok(medicalCase);
    }

    @PutMapping("/{id}/complete-verification")
    public ResponseEntity<MedicalCase> completePhysicalVerification(
            @PathVariable Long id,
            @RequestParam Boolean verified,
            @RequestParam Integer verificationScore) {
        MedicalCase medicalCase = medicalCaseService.completePhysicalVerification(id, verified, verificationScore);
        return ResponseEntity.ok(medicalCase);
    }

    @PutMapping("/{id}/assign-doctor")
    public ResponseEntity<MedicalCase> assignDoctor(
            @PathVariable Long id,
            @RequestParam Long doctorId) {
        MedicalCase medicalCase = medicalCaseService.assignDoctor(id, doctorId);
        return ResponseEntity.ok(medicalCase);
    }

    @PutMapping("/{id}/complete-medical-review")
    public ResponseEntity<MedicalCase> completeMedicalReview(
            @PathVariable Long id,
            @RequestParam Boolean verified,
            @RequestParam(required = false) String notes) {
        MedicalCase medicalCase = medicalCaseService.completeMedicalReview(id, verified, notes);
        return ResponseEntity.ok(medicalCase);
    }

    @PutMapping("/{id}/assign-hospital")
    public ResponseEntity<MedicalCase> assignHospital(
            @PathVariable Long id,
            @RequestParam Long hospitalId) {
        MedicalCase medicalCase = medicalCaseService.assignHospital(id, hospitalId);
        return ResponseEntity.ok(medicalCase);
    }

    @PutMapping("/{id}/update-estimate")
    public ResponseEntity<MedicalCase> updateHospitalEstimate(
            @PathVariable Long id,
            @RequestParam java.math.BigDecimal estimatedCost,
            @RequestParam java.math.BigDecimal hospitalDiscount,
            @RequestParam java.math.BigDecimal hospitalContribution) {
        MedicalCase medicalCase = medicalCaseService.updateHospitalEstimate(
                id, estimatedCost, hospitalDiscount, hospitalContribution);
        return ResponseEntity.ok(medicalCase);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<MedicalCase> approveCase(@PathVariable Long id) {
        MedicalCase medicalCase = medicalCaseService.approveCase(id);
        return ResponseEntity.ok(medicalCase);
    }

    @PutMapping("/{id}/start-treatment")
    public ResponseEntity<MedicalCase> startTreatment(@PathVariable Long id) {
        MedicalCase medicalCase = medicalCaseService.startTreatment(id);
        return ResponseEntity.ok(medicalCase);
    }

    @PutMapping("/{id}/complete-treatment")
    public ResponseEntity<MedicalCase> completeTreatment(@PathVariable Long id) {
        MedicalCase medicalCase = medicalCaseService.completeTreatment(id);
        return ResponseEntity.ok(medicalCase);
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<MedicalCase> closeCase(@PathVariable Long id) {
        MedicalCase medicalCase = medicalCaseService.closeCase(id);
        return ResponseEntity.ok(medicalCase);
    }
}
