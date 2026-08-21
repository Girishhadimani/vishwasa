package com.vishwasa.controller;

import com.vishwasa.dto.DoctorRegistrationRequest;
import com.vishwasa.entity.Doctor;
import com.vishwasa.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping("/register")
    public ResponseEntity<Doctor> registerDoctor(@Valid @RequestBody DoctorRegistrationRequest request) {
        Doctor doctor = doctorService.registerDoctor(request, 1L); // TODO: Get from authenticated user
        return ResponseEntity.ok(doctor);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctor(@PathVariable Long id) {
        Doctor doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(doctor);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Doctor> getDoctorByUserId(@PathVariable Long userId) {
        Doctor doctor = doctorService.getDoctorByUserId(userId);
        return ResponseEntity.ok(doctor);
    }

    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        List<Doctor> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(doctors);
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<Doctor> verifyDoctor(
            @PathVariable Long id,
            @RequestParam Boolean verified,
            @RequestParam(required = false) String document) {
        Doctor doctor = doctorService.verifyDoctor(id, verified, document);
        return ResponseEntity.ok(doctor);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Doctor> updateDoctorDetails(
            @PathVariable Long id,
            @Valid @RequestBody DoctorRegistrationRequest request) {
        Doctor doctor = doctorService.updateDoctorDetails(id, request);
        return ResponseEntity.ok(doctor);
    }
}
