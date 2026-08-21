package com.vishwasa.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "doctors")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    private String medicalRegistrationNumber;

    @Column(nullable = false)
    private String specialization;

    @Column
    private String qualification;

    @Column
    private String experience;

    @Column
    private String hospitalAffiliation;

    @Column(name = "hospital_id")
    private Long hospitalId;

    @Column(nullable = false)
    private Boolean verified = false;

    @Column
    private String verificationDocument;

    @Column
    private LocalDateTime verificationDate;

    @Column
    private String languages;

    @Column
    private String consultationHours;

    @Column
    private String contactNumber;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
