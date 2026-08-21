package com.vishwasa.service;

import com.vishwasa.dto.VolunteerRegistrationRequest;
import com.vishwasa.entity.Volunteer;
import com.vishwasa.repository.UserRepository;
import com.vishwasa.repository.VolunteerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VolunteerService {

    private final VolunteerRepository volunteerRepository;
    private final UserRepository userRepository;

    public Volunteer registerVolunteer(VolunteerRegistrationRequest request, Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }

        if (volunteerRepository.findByUserId(userId).isPresent()) {
            return volunteerRepository.findByUserId(userId).get();
        }

        String district = request.getDistrict() != null ? request.getDistrict() : "Belagavi";

        Volunteer volunteer = Volunteer.builder()
                .userId(userId)
                .address(request.getAddress() != null ? request.getAddress() : "Belagavi Field Office")
                .village(request.getVillage() != null ? request.getVillage() : district)
                .district(district)
                .state(request.getState() != null ? request.getState() : "Karnataka")
                .pincode(request.getPincode() != null ? request.getPincode() : "590001")
                .latitude(request.getLatitude() != null ? request.getLatitude() : 15.8497)
                .longitude(request.getLongitude() != null ? request.getLongitude() : 74.5086)
                .verificationRadiusKm(request.getVerificationRadiusKm() != null ? request.getVerificationRadiusKm() : 25)
                .available(true)
                .completedVerifications(0)
                .activeVerifications(0)
                .reliabilityScore(5.0)
                .languages(request.getLanguages() != null ? request.getLanguages() : "Kannada, English")
                .occupation(request.getOccupation())
                .education(request.getEducation())
                .verified(false)
                .build();

        return volunteerRepository.save(volunteer);
    }

    public Volunteer getVolunteerById(Long id) {
        return volunteerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Volunteer not found"));
    }

    public Volunteer getVolunteerByUserId(Long userId) {
        return volunteerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Volunteer not found"));
    }

    public List<Volunteer> findNearbyVolunteers(double latitude, double longitude, double radiusKm) {
        return volunteerRepository.findNearbyVolunteers(latitude, longitude, radiusKm);
    }

    public Volunteer updateAvailability(Long volunteerId, Boolean available) {
        Volunteer volunteer = getVolunteerById(volunteerId);
        volunteer.setAvailable(available);
        return volunteerRepository.save(volunteer);
    }

    public Volunteer verifyVolunteer(Long volunteerId, Boolean verified, String document) {
        Volunteer volunteer = getVolunteerById(volunteerId);
        volunteer.setVerified(verified);
        volunteer.setVerificationDocument(document);
        return volunteerRepository.save(volunteer);
    }

    public Volunteer incrementCompletedVerifications(Long volunteerId) {
        Volunteer volunteer = getVolunteerById(volunteerId);
        volunteer.setCompletedVerifications(volunteer.getCompletedVerifications() + 1);
        return volunteerRepository.save(volunteer);
    }
}
