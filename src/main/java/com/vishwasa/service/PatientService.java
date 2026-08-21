package com.vishwasa.service;

import com.vishwasa.dto.PatientRegistrationRequest;
import com.vishwasa.entity.Patient;
import com.vishwasa.entity.User;
import com.vishwasa.enums.Role;
import com.vishwasa.repository.PatientRepository;
import com.vishwasa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Patient registerPatient(PatientRegistrationRequest request, Long userId) {
        String email = request.getEmail() != null ? request.getEmail() : "patient_" + System.currentTimeMillis() + "@vishwasa.org";

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.findByUsername(email)
                .orElseGet(() -> userRepository.save(User.builder()
                        .username(email)
                        .email(email)
                        .fullName(request.getFullName())
                        .phoneNumber(request.getPhoneNumber())
                        .district(request.getDistrict())
                        .roles(Set.of(Role.PATIENT))
                        .password(passwordEncoder.encode(request.getPassword() != null ? request.getPassword() : "password123"))
                        .enabled(true)
                        .accountNonExpired(true)
                        .accountNonLocked(true)
                        .credentialsNonExpired(true)
                        .build())));

        String aadhaar = request.getAadhaarNumber() != null ? request.getAadhaarNumber()
                : (request.getDocumentNumber() != null ? request.getDocumentNumber() : "4829" + (System.currentTimeMillis() % 100000000L));

        return patientRepository.findByAadhaarNumber(aadhaar)
                .orElseGet(() -> patientRepository.save(Patient.builder()
                        .userId(user.getId())
                        .aadhaarNumber(aadhaar)
                        .fullName(request.getFullName())
                        .dateOfBirth(request.getDateOfBirth())
                        .gender(request.getGender())
                        .address(request.getAddress())
                        .village(request.getVillage())
                        .district(request.getDistrict())
                        .state(request.getState())
                        .pincode(request.getPincode())
                        .emergencyContactName(request.getEmergencyContactName())
                        .emergencyContactPhone(request.getPhoneNumber())
                        .familyIncome(request.getFamilyIncome())
                        .identityVerified(false)
                        .build()));
    }

    public Patient getPatientByUserId(Long userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    public Patient updateIdentityVerification(Long patientId, Boolean verified, String reference, String method) {
        Patient patient = getPatientById(patientId);
        patient.setIdentityVerified(verified);
        patient.setVerificationReference(reference);
        patient.setVerificationMethod(method);
        return patientRepository.save(patient);
    }
}
