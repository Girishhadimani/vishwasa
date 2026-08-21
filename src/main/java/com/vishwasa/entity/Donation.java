package com.vishwasa.entity;

import com.vishwasa.enums.DonationStatus;
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
@Table(name = "donations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String transactionId;

    @Column(name = "campaign_id")
    private Long campaignId;

    @Column
    private String donorName;

    @Column
    private String donorEmail;

    @Column
    private String donorPhone;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column
    private Boolean anonymous = false;

    @Column
    private String paymentMethod;

    @Column
    private String paymentReference;

    @Column
    private String paymentGatewayTransactionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationStatus status = DonationStatus.PENDING;

    @Column
    private String message;

    @Column
    private Boolean receiptSent = false;

    @Column
    private LocalDateTime receiptSentDate;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
