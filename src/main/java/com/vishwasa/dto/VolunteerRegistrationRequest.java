package com.vishwasa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerRegistrationRequest {
    @NotBlank
    private String address;

    @NotBlank
    private String village;

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

    private Integer verificationRadiusKm = 25;

    private String languages;

    private String occupation;

    private String education;
}
