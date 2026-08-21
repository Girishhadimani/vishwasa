package com.vishwasa.repository;

import com.vishwasa.entity.MedicalCase;
import com.vishwasa.enums.CaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalCaseRepository extends JpaRepository<MedicalCase, Long> {
    Optional<MedicalCase> findByCaseNumber(String caseNumber);
    List<MedicalCase> findByPatientId(Long patientId);
    List<MedicalCase> findByStatus(CaseStatus status);
    List<MedicalCase> findByAssignedVolunteerId(Long volunteerId);
    List<MedicalCase> findByAssignedDoctorId(Long doctorId);
    List<MedicalCase> findByAssignedHospitalId(Long hospitalId);
    boolean existsByPatientId(Long patientId);
}
