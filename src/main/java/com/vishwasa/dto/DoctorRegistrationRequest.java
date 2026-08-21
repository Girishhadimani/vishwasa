package com.vishwasa.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorRegistrationRequest {
    @NotBlank
    private String medicalRegistrationNumber;

    @NotBlank
    private String specialization;

    private String qualification;

    private String experience;

    private String hospitalAffiliation;

    private Long hospitalId;

    private String languages;

    private String consultationHours;

    private String contactNumber;
}
