package com.vishwasa.service;

import com.vishwasa.dto.DoctorRegistrationRequest;
import com.vishwasa.entity.Doctor;
import com.vishwasa.repository.DoctorRepository;
import com.vishwasa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public Doctor registerDoctor(DoctorRegistrationRequest request, Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }

        if (doctorRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("Doctor profile already exists for this user");
        }

        if (doctorRepository.findByMedicalRegistrationNumber(request.getMedicalRegistrationNumber()).isPresent()) {
            throw new RuntimeException("Doctor with this registration number already exists");
        }

        Doctor doctor = Doctor.builder()
                .userId(userId)
                .medicalRegistrationNumber(request.getMedicalRegistrationNumber())
                .specialization(request.getSpecialization())
                .qualification(request.getQualification())
                .experience(request.getExperience())
                .hospitalAffiliation(request.getHospitalAffiliation())
                .hospitalId(request.getHospitalId())
                .languages(request.getLanguages())
                .consultationHours(request.getConsultationHours())
                .contactNumber(request.getContactNumber())
                .verified(false)
                .build();

        return doctorRepository.save(doctor);
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    public Doctor getDoctorByUserId(Long userId) {
        return doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor verifyDoctor(Long doctorId, Boolean verified, String document) {
        Doctor doctor = getDoctorById(doctorId);
        doctor.setVerified(verified);
        doctor.setVerificationDocument(document);
        return doctorRepository.save(doctor);
    }

    public Doctor updateDoctorDetails(Long doctorId, DoctorRegistrationRequest request) {
        Doctor doctor = getDoctorById(doctorId);
        doctor.setSpecialization(request.getSpecialization());
        doctor.setQualification(request.getQualification());
        doctor.setExperience(request.getExperience());
        doctor.setHospitalAffiliation(request.getHospitalAffiliation());
        doctor.setHospitalId(request.getHospitalId());
        doctor.setLanguages(request.getLanguages());
        doctor.setConsultationHours(request.getConsultationHours());
        doctor.setContactNumber(request.getContactNumber());
        return doctorRepository.save(doctor);
    }
}
