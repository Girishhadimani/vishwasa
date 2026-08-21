package com.vishwasa.repository;

import com.vishwasa.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUserId(Long userId);
    Optional<Doctor> findByMedicalRegistrationNumber(String registrationNumber);
    Doctor findByUserIdAndVerifiedTrue(Long userId);
}
