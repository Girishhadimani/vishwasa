package com.vishwasa.entity;

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
@Table(name = "donation_campaigns")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class DonationCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String campaignNumber;

    @Column(name = "medical_case_id")
    private Long medicalCaseId;

    @Column(nullable = false)
    private String title;

    @Column
    private String description;

    @Column
    private String patientDisplayName;

    @Column
    private String patientAge;

    @Column
    private String patientDistrict;

    @Column
    private String treatmentType;

    @Column
    private String hospitalName;

    @Column(nullable = false)
    private BigDecimal targetAmount;

    @Column(nullable = false)
    private BigDecimal currentAmount = BigDecimal.ZERO;

    @Column
    private Boolean emergency = false;

    @Column
    private Boolean active = true;

    @Column
    private LocalDateTime startDate;

    @Column
    private LocalDateTime endDate;

    @Column
    private LocalDateTime publishedDate;

    @Column
    private Boolean published = false;

    @Column
    private String featuredImage;

    @Column
    private String story;

    @Column
    private Integer donorCount = 0;

    @Column
    private Integer shareCount = 0;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
