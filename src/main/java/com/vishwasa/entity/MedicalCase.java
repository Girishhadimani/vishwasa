package com.vishwasa.entity;

import com.vishwasa.enums.CaseStatus;
import com.vishwasa.enums.Priority;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "medical_cases")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class MedicalCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id")
    private Long patientId;

    @Column(nullable = false)
    private String caseNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CaseStatus status = CaseStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority = Priority.NORMAL;

    @Column(nullable = false)
    private String diagnosis;

    @Column
    private String medicalCondition;

    @Column
    private String symptoms;

    @Column
    private String medicalHistory;

    @Column
    private String documents;

    @Column
    private BigDecimal estimatedCost;

    @Column
    private BigDecimal hospitalDiscount;

    @Column
    private BigDecimal hospitalContribution;

    @Column
    private BigDecimal foundationContribution;

    @Column
    private BigDecimal amountRequired;

    @Column
    private BigDecimal amountRaised;

    @Column
    private BigDecimal amountUtilized;

    @Column(name = "assigned_volunteer_id")
    private Long assignedVolunteerId;

    @Column(name = "assigned_doctor_id")
    private Long assignedDoctorId;

    @Column(name = "assigned_hospital_id")
    private Long assignedHospitalId;

    @Column
    private LocalDateTime volunteerAssignedDate;

    @Column
    private LocalDateTime volunteerVisitDate;

    @Column
    private Boolean physicalVerificationCompleted = false;

    @Column
    private LocalDateTime medicalReviewDate;

    @Column
    private Boolean medicallyVerified = false;

    @Column
    private LocalDateTime approvalDate;

    @Column
    private LocalDateTime treatmentStartDate;

    @Column
    private LocalDateTime treatmentEndDate;

    @Column
    private LocalDateTime closureDate;

    @Column
    private String rejectionReason;

    @Column
    private String additionalInfoRequired;

    @Column
    private Integer verificationScore;

    @Column
    private String notes;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
