package com.vishwasa.config;

import com.vishwasa.entity.*;
import com.vishwasa.enums.CaseStatus;
import com.vishwasa.enums.DonationStatus;
import com.vishwasa.enums.Priority;
import com.vishwasa.enums.Role;
import com.vishwasa.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final VolunteerRepository volunteerRepository;
    private final MedicalCaseRepository medicalCaseRepository;
    private final DonationCampaignRepository campaignRepository;
    private final DonationRepository donationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("🚀 Starting Vishwasa PostgreSQL Database Initializer...");

        // 1. Seed Initial Users for all 8 Roles
        User adminUser = initUser("admin@vishwasa.org", "Vishwasa Executive Director", Role.FOUNDATION_ADMIN, "Belagavi");
        User patientUser = initUser("patient@vishwasa.org", "Aarav Kumar (Patient Family)", Role.PATIENT, "Belagavi");
        User donorUser = initUser("donor@vishwasa.org", "Rajesh Kulkarni", Role.PATIENT, "Belagavi");
        User volUser = initUser("volunteer.belagavi@vishwasa.org", "Ramesh Patil", Role.VOLUNTEER, "Belagavi");
        User docUser = initUser("doctor.kles@vishwasa.org", "Dr. K. Srinivas", Role.DOCTOR, "Belagavi");
        User hospUser = initUser("hospital.admin@vishwasa.org", "KLES Hospital Admin", Role.HOSPITAL_ADMIN, "Belagavi");
        User ashaUser = initUser("asha.belagavi@vishwasa.org", "Sunita Kamble", Role.ASHA_WORKER, "Belagavi");

        // 2. Seed Hospital
        Hospital klesHosp = hospitalRepository.findAll().stream().findFirst().orElseGet(() -> 
            hospitalRepository.save(Hospital.builder()
                .name("KLES Dr. Prabhakar Kore Hospital, Belagavi")
                .registrationNumber("HOSP-KLES-8802")
                .type("NABH Accredited Tertiary Center")
                .address("Club Road, Belagavi, North Karnataka 590001")
                .district("Belagavi")
                .state("Karnataka")
                .pincode("590001")
                .latitude(15.8497)
                .longitude(74.5086)
                .contactNumber("+91 0831 247-3777")
                .email("hospital.admin@vishwasa.org")
                .verified(true)
                .partner(true)
                .partnershipType("Model C (Mixed Contribution)")
                .bedCapacity(1400)
                .build())
        );

        // 3. Seed Doctor
        if (doctorRepository.count() == 0) {
            doctorRepository.save(Doctor.builder()
                .userId(docUser.getId())
                .hospitalId(klesHosp.getId())
                .medicalRegistrationNumber("KMC-88204")
                .qualification("MD (Pediatric Cardiology)")
                .specialization("Pediatric Cardiology")
                .verified(true)
                .build());
        }

        // 4. Seed Patient
        Patient aaravPatient = patientRepository.findAll().stream().findFirst().orElseGet(() ->
            patientRepository.save(Patient.builder()
                .userId(patientUser.getId())
                .aadhaarNumber("482910492840")
                .fullName("Aarav Kumar (Age 6)")
                .district("Belagavi")
                .identityVerified(true)
                .verificationMethod("Aadhaar UIDAI")
                .verificationReference("REF-UIDAI-88402")
                .build())
        );

        // 5. Seed Volunteer
        if (volunteerRepository.count() == 0) {
            volunteerRepository.save(Volunteer.builder()
                .userId(volUser.getId())
                .district("Belagavi")
                .verified(true)
                .available(true)
                .reliabilityScore(5.0)
                .completedVerifications(28)
                .build());
        }

        // 6. Seed Medical Case
        MedicalCase cardiacCase = medicalCaseRepository.findAll().stream().findFirst().orElseGet(() ->
            medicalCaseRepository.save(MedicalCase.builder()
                .caseNumber("MC-8021")
                .patientId(aaravPatient.getId())
                .assignedHospitalId(klesHosp.getId())
                .diagnosis("Ventricular Septal Defect (VSD) - Open Heart Surgery & ICU Recovery")
                .estimatedCost(new BigDecimal("450000"))
                .amountRaised(new BigDecimal("342000"))
                .hospitalDiscount(new BigDecimal("50000"))
                .foundationContribution(new BigDecimal("33000"))
                .priority(Priority.EMERGENCY)
                .status(CaseStatus.APPROVED)
                .medicallyVerified(true)
                .physicalVerificationCompleted(true)
                .build())
        );

        // 7. Seed Campaign ID 1
        DonationCampaign mainCampaign = campaignRepository.findAll().stream().findFirst().orElseGet(() ->
            campaignRepository.save(DonationCampaign.builder()
                .campaignNumber("CMP-8021")
                .medicalCaseId(cardiacCase.getId())
                .title("Emergency Pediatric Heart Surgery for 6-Year-Old Aarav")
                .description("Direct 100% Hospital Disbursement Fund for Aarav's VSD Heart Surgery")
                .targetAmount(new BigDecimal("450000"))
                .currentAmount(new BigDecimal("342000"))
                .active(true)
                .published(true)
                .donorCount(164)
                .publishedDate(LocalDateTime.now())
                .build())
        );

        // 8. Seed Initial Donation
        if (donationRepository.count() == 0) {
            donationRepository.save(Donation.builder()
                .transactionId("DON-9001")
                .campaignId(mainCampaign.getId())
                .donorName("Rajesh Kulkarni")
                .donorEmail("donor@vishwasa.org")
                .amount(new BigDecimal("25000"))
                .paymentMethod("UPI (ghadimani145@okaxis)")
                .status(DonationStatus.COMPLETED)
                .paymentReference("UPI-UTR-423456789012")
                .receiptSent(true)
                .build());
        }

        log.info("✅ Vishwasa PostgreSQL Database Initialized Successfully with Seed Data!");
    }

    private User initUser(String email, String fullName, Role role, String district) {
        return userRepository.findByEmail(email).orElseGet(() ->
            userRepository.save(User.builder()
                .username(email)
                .email(email)
                .password(passwordEncoder.encode("password123"))
                .fullName(fullName)
                .phoneNumber("+91 98450 11223")
                .roles(Set.of(role))
                .district(district)
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .build())
        );
    }
}
