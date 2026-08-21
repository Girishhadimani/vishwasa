package com.vishwasa.controller;

import com.vishwasa.dto.MedicalCaseRequest;
import com.vishwasa.dto.PatientRegistrationRequest;
import com.vishwasa.entity.MedicalCase;
import com.vishwasa.entity.Patient;
import com.vishwasa.service.MedicalCaseService;
import com.vishwasa.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientService patientService;
    private final MedicalCaseService medicalCaseService;

    @PostMapping("/register")
    public ResponseEntity<Patient> registerPatient(@Valid @RequestBody PatientRegistrationRequest request) {
        Patient patient = patientService.registerPatient(request, 1L); // TODO: Get from authenticated user
        return ResponseEntity.ok(patient);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatient(@PathVariable Long id) {
        Patient patient = patientService.getPatientById(id);
        return ResponseEntity.ok(patient);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Patient> getPatientByUserId(@PathVariable Long userId) {
        Patient patient = patientService.getPatientByUserId(userId);
        return ResponseEntity.ok(patient);
    }

    @PostMapping("/{patientId}/cases")
    public ResponseEntity<MedicalCase> createMedicalCase(
            @PathVariable Long patientId,
            @Valid @RequestBody MedicalCaseRequest request) {
        MedicalCase medicalCase = medicalCaseService.createMedicalCase(patientId, request);
        return ResponseEntity.ok(medicalCase);
    }

    @GetMapping("/cases/{caseId}")
    public ResponseEntity<MedicalCase> getMedicalCase(@PathVariable Long caseId) {
        MedicalCase medicalCase = medicalCaseService.getMedicalCaseById(caseId);
        return ResponseEntity.ok(medicalCase);
    }

    @GetMapping("/cases/number/{caseNumber}")
    public ResponseEntity<MedicalCase> getMedicalCaseByNumber(@PathVariable String caseNumber) {
        MedicalCase medicalCase = medicalCaseService.getMedicalCaseByNumber(caseNumber);
        return ResponseEntity.ok(medicalCase);
    }
}
