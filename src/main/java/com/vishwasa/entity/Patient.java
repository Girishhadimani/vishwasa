package com.vishwasa.entity;

import com.vishwasa.enums.Priority;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    private String aadhaarNumber;

    @Column(nullable = false)
    private Boolean identityVerified = false;

    @Column
    private String verificationReference;

    @Column
    private LocalDateTime verificationDate;

    @Column
    private String verificationMethod;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String village;

    @Column(nullable = false)
    private String district;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String pincode;

    @Column
    private String emergencyContactName;

    @Column
    private String emergencyContactPhone;

    @Column
    private String familyIncome;

    @Column
    private Integer familyMembers;

    @Column
    private String occupation;

    @Column
    private Boolean hasInsurance = false;

    @Column
    private String insuranceDetails;

    @Column
    private Boolean hasGovernmentScheme = false;

    @Column
    private String governmentSchemeDetails;

    @Column
    private Priority priority = Priority.NORMAL;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
