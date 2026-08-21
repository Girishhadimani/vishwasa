package com.vishwasa.repository;

import com.vishwasa.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    Optional<Hospital> findByUserId(Long userId);
    Optional<Hospital> findByRegistrationNumber(String registrationNumber);
    Hospital findByUserIdAndVerifiedTrue(Long userId);
}
