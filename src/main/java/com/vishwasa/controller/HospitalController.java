package com.vishwasa.controller;

import com.vishwasa.dto.HospitalRegistrationRequest;
import com.vishwasa.entity.Hospital;
import com.vishwasa.service.HospitalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HospitalController {

    private final HospitalService hospitalService;

    @PostMapping("/register")
    public ResponseEntity<Hospital> registerHospital(@Valid @RequestBody HospitalRegistrationRequest request) {
        Hospital hospital = hospitalService.registerHospital(request, 1L); // TODO: Get from authenticated user
        return ResponseEntity.ok(hospital);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Hospital> getHospital(@PathVariable Long id) {
        Hospital hospital = hospitalService.getHospitalById(id);
        return ResponseEntity.ok(hospital);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Hospital> getHospitalByUserId(@PathVariable Long userId) {
        Hospital hospital = hospitalService.getHospitalByUserId(userId);
        return ResponseEntity.ok(hospital);
    }

    @GetMapping
    public ResponseEntity<List<Hospital>> getAllHospitals() {
        List<Hospital> hospitals = hospitalService.getAllHospitals();
        return ResponseEntity.ok(hospitals);
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<Hospital> verifyHospital(
            @PathVariable Long id,
            @RequestParam Boolean verified,
            @RequestParam(required = false) String document) {
        Hospital hospital = hospitalService.verifyHospital(id, verified, document);
        return ResponseEntity.ok(hospital);
    }

    @PutMapping("/{id}/partnership")
    public ResponseEntity<Hospital> setPartnership(
            @PathVariable Long id,
            @RequestParam Boolean partner,
            @RequestParam(required = false) String partnershipType,
            @RequestParam(required = false) Double discountPercentage) {
        Hospital hospital = hospitalService.setPartnership(id, partner, partnershipType, discountPercentage);
        return ResponseEntity.ok(hospital);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Hospital> updateHospitalDetails(
            @PathVariable Long id,
            @Valid @RequestBody HospitalRegistrationRequest request) {
        Hospital hospital = hospitalService.updateHospitalDetails(id, request);
        return ResponseEntity.ok(hospital);
    }
}
