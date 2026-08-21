package com.vishwasa.service;

import com.vishwasa.dto.HospitalRegistrationRequest;
import com.vishwasa.entity.Hospital;
import com.vishwasa.repository.HospitalRepository;
import com.vishwasa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HospitalService {

    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;

    public Hospital registerHospital(HospitalRegistrationRequest request, Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }

        if (hospitalRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("Hospital profile already exists for this user");
        }

        if (hospitalRepository.findByRegistrationNumber(request.getRegistrationNumber()).isPresent()) {
            throw new RuntimeException("Hospital with this registration number already exists");
        }

        Hospital hospital = Hospital.builder()
                .userId(userId)
                .name(request.getName())
                .registrationNumber(request.getRegistrationNumber())
                .type(request.getType())
                .category(request.getCategory())
                .address(request.getAddress())
                .district(request.getDistrict())
                .state(request.getState())
                .pincode(request.getPincode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .contactNumber(request.getContactNumber())
                .email(request.getEmail())
                .website(request.getWebsite())
                .emergencyServices(request.getEmergencyServices())
                .specialties(request.getSpecialties())
                .bedCapacity(request.getBedCapacity())
                .operatingHours(request.getOperatingHours())
                .verified(false)
                .partner(false)
                .build();

        return hospitalRepository.save(hospital);
    }

    public Hospital getHospitalById(Long id) {
        return hospitalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hospital not found"));
    }

    public Hospital getHospitalByUserId(Long userId) {
        return hospitalRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Hospital not found"));
    }

    public List<Hospital> getAllHospitals() {
        return hospitalRepository.findAll();
    }

    public Hospital verifyHospital(Long hospitalId, Boolean verified, String document) {
        Hospital hospital = getHospitalById(hospitalId);
        hospital.setVerified(verified);
        hospital.setVerificationDocument(document);
        return hospitalRepository.save(hospital);
    }

    public Hospital setPartnership(Long hospitalId, Boolean partner, String partnershipType, Double discountPercentage) {
        Hospital hospital = getHospitalById(hospitalId);
        hospital.setPartner(partner);
        hospital.setPartnershipType(partnershipType);
        hospital.setDiscountPercentage(discountPercentage);
        return hospitalRepository.save(hospital);
    }

    public Hospital updateHospitalDetails(Long hospitalId, HospitalRegistrationRequest request) {
        Hospital hospital = getHospitalById(hospitalId);
        hospital.setName(request.getName());
        hospital.setContactNumber(request.getContactNumber());
        hospital.setEmail(request.getEmail());
        hospital.setWebsite(request.getWebsite());
        hospital.setEmergencyServices(request.getEmergencyServices());
        hospital.setSpecialties(request.getSpecialties());
        hospital.setBedCapacity(request.getBedCapacity());
        hospital.setOperatingHours(request.getOperatingHours());
        return hospitalRepository.save(hospital);
    }
}
