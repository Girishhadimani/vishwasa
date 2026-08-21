package com.vishwasa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonationRequest {
    private Long campaignId;
    private BigDecimal amount;
    private String donorName;
    private String donorEmail;
    private String donorPhone;
    private String donorPan;
    private String transactionId;
    private Boolean anonymous = false;
    private String paymentMethod;
    private String message;
}
