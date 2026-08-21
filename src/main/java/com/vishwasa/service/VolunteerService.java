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
            throw new RuntimeException("Volunteer profile already exists for this user");
        }

        Volunteer volunteer = Volunteer.builder()
                .userId(userId)
                .address(request.getAddress())
                .village(request.getVillage())
                .district(request.getDistrict())
                .state(request.getState())
                .pincode(request.getPincode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .verificationRadiusKm(request.getVerificationRadiusKm())
                .available(true)
                .completedVerifications(0)
                .activeVerifications(0)
                .reliabilityScore(5.0)
                .languages(request.getLanguages())
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
