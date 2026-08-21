package com.vishwasa.dto;

import com.vishwasa.enums.Priority;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalCaseRequest {
    @NotBlank
    private String diagnosis;

    private String medicalCondition;

    private String symptoms;

    private String medicalHistory;

    private String documents;

    private BigDecimal estimatedCost;

    private Priority priority = Priority.NORMAL;

    private String notes;
}
