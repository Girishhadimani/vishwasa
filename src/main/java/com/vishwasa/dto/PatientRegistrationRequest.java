package com.vishwasa.dto;

import com.vishwasa.enums.Priority;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientRegistrationRequest {
    private String aadhaarNumber;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String hospital;
    private String documentNumber;
    private String password;
    
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String village;
    private String district;
    private String state;
    private String pincode;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String familyIncome;
    private Integer familyMembers;
    private String occupation;
    private Boolean hasInsurance = false;
    private String insuranceDetails;
    private Boolean hasGovernmentScheme = false;
    private String governmentSchemeDetails;
    private Priority priority = Priority.NORMAL;
}
