package com.vishwasa.controller;

import com.vishwasa.dto.VolunteerRegistrationRequest;
import com.vishwasa.entity.Volunteer;
import com.vishwasa.service.VolunteerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/volunteers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VolunteerController {

    private final VolunteerService volunteerService;

    @PostMapping("/register")
    public ResponseEntity<Volunteer> registerVolunteer(@Valid @RequestBody VolunteerRegistrationRequest request) {
        Volunteer volunteer = volunteerService.registerVolunteer(request, 1L); // TODO: Get from authenticated user
        return ResponseEntity.ok(volunteer);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Volunteer> getVolunteer(@PathVariable Long id) {
        Volunteer volunteer = volunteerService.getVolunteerById(id);
        return ResponseEntity.ok(volunteer);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Volunteer> getVolunteerByUserId(@PathVariable Long userId) {
        Volunteer volunteer = volunteerService.getVolunteerByUserId(userId);
        return ResponseEntity.ok(volunteer);
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<Volunteer>> findNearbyVolunteers(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "25") double radiusKm) {
        List<Volunteer> volunteers = volunteerService.findNearbyVolunteers(latitude, longitude, radiusKm);
        return ResponseEntity.ok(volunteers);
    }

    @PutMapping("/{id}/availability")
    public ResponseEntity<Volunteer> updateAvailability(
            @PathVariable Long id,
            @RequestParam Boolean available) {
        Volunteer volunteer = volunteerService.updateAvailability(id, available);
        return ResponseEntity.ok(volunteer);
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<Volunteer> verifyVolunteer(
            @PathVariable Long id,
            @RequestParam Boolean verified,
            @RequestParam(required = false) String document) {
        Volunteer volunteer = volunteerService.verifyVolunteer(id, verified, document);
        return ResponseEntity.ok(volunteer);
    }
}
