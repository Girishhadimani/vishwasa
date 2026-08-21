package com.vishwasa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalRegistrationRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String registrationNumber;

    @NotBlank
    private String type;

    private String category;

    @NotBlank
    private String address;

    @NotBlank
    private String district;

    @NotBlank
    private String state;

    @NotBlank
    private String pincode;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    private String contactNumber;

    private String email;

    private String website;

    private String emergencyServices;

    private String specialties;

    private Integer bedCapacity;

    private String operatingHours;
}
