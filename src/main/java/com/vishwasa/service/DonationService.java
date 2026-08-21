package com.vishwasa.service;

import com.vishwasa.dto.DonationRequest;
import com.vishwasa.entity.Donation;
import com.vishwasa.entity.DonationCampaign;
import com.vishwasa.entity.MedicalCase;
import com.vishwasa.enums.DonationStatus;
import com.vishwasa.repository.DonationCampaignRepository;
import com.vishwasa.repository.DonationRepository;
import com.vishwasa.repository.MedicalCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DonationService {

    private final DonationRepository donationRepository;
    private final DonationCampaignRepository campaignRepository;
    private final MedicalCaseRepository medicalCaseRepository;

    @Transactional
    public Donation createDonation(DonationRequest request) {
        Long campaignId = request.getCampaignId() != null ? request.getCampaignId() : 1L;
        
        DonationCampaign campaign = campaignRepository.findById(campaignId)
                .orElseGet(() -> campaignRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Campaign not found")));

        String transactionId = request.getTransactionId() != null ? request.getTransactionId()
                : "DON-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Donation donation = Donation.builder()
                .transactionId(transactionId)
                .campaignId(campaign.getId())
                .donorName(request.getDonorName() != null ? request.getDonorName() : "Generous Supporter")
                .donorEmail(request.getDonorEmail() != null ? request.getDonorEmail() : "donor@vishwasa.org")
                .donorPhone(request.getDonorPhone())
                .amount(request.getAmount())
                .anonymous(request.getAnonymous() != null ? request.getAnonymous() : false)
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "UPI")
                .message(request.getMessage())
                .status(DonationStatus.COMPLETED)
                .paymentReference(transactionId)
                .receiptSent(true)
                .build();

        Donation savedDonation = donationRepository.save(donation);

        // Update campaign amount & donor count directly in PostgreSQL DB
        campaign.setCurrentAmount(campaign.getCurrentAmount().add(request.getAmount()));
        campaign.setDonorCount(campaign.getDonorCount() + 1);
        campaignRepository.save(campaign);

        return savedDonation;
    }

    public Donation completeDonation(String transactionId, String paymentReference, String gatewayTransactionId) {
        Donation donation = donationRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Donation not found"));

        donation.setStatus(DonationStatus.COMPLETED);
        donation.setPaymentReference(paymentReference);
        donation.setPaymentGatewayTransactionId(gatewayTransactionId);

        Donation savedDonation = donationRepository.save(donation);

        // Update campaign amount
        DonationCampaign campaign = campaignRepository.findById(savedDonation.getCampaignId())
                .orElseThrow(() -> new RuntimeException("Campaign not found"));
        campaign.setCurrentAmount(campaign.getCurrentAmount().add(savedDonation.getAmount()));
        campaign.setDonorCount(campaign.getDonorCount() + 1);
        campaignRepository.save(campaign);

        // Update medical case
        MedicalCase medicalCase = medicalCaseRepository.findById(campaign.getMedicalCaseId())
                .orElseThrow(() -> new RuntimeException("Medical case not found"));
        medicalCase.setAmountRaised(medicalCase.getAmountRaised().add(savedDonation.getAmount()));
        medicalCaseRepository.save(medicalCase);

        return savedDonation;
    }

    public Donation getDonationById(Long id) {
        return donationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Donation not found"));
    }

    public Donation getDonationByTransactionId(String transactionId) {
        return donationRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Donation not found"));
    }

    public List<Donation> getDonationsByCampaign(Long campaignId) {
        return donationRepository.findByCampaignId(campaignId);
    }

    public List<Donation> getDonationsByDonorEmail(String email) {
        return donationRepository.findByDonorEmail(email);
    }

    public DonationCampaign createCampaign(Long medicalCaseId, String title, String description, BigDecimal targetAmount) {
        if (!medicalCaseRepository.existsById(medicalCaseId)) {
            throw new RuntimeException("Medical case not found");
        }

        String campaignNumber = "CMP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        DonationCampaign campaign = DonationCampaign.builder()
                .campaignNumber(campaignNumber)
                .medicalCaseId(medicalCaseId)
                .title(title)
                .description(description)
                .targetAmount(targetAmount)
                .currentAmount(BigDecimal.ZERO)
                .active(true)
                .published(false)
                .donorCount(0)
                .shareCount(0)
                .build();

        return campaignRepository.save(campaign);
    }

    public DonationCampaign publishCampaign(Long campaignId) {
        DonationCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        campaign.setPublished(true);
        campaign.setPublishedDate(LocalDateTime.now());
        campaign.setStartDate(LocalDateTime.now());

        return campaignRepository.save(campaign);
    }

    public List<DonationCampaign> getActiveCampaigns() {
        return campaignRepository.findByActiveTrue();
    }

    public List<DonationCampaign> getPublishedCampaigns() {
        return campaignRepository.findByPublishedTrueAndActiveTrue();
    }

    public DonationCampaign getCampaignByNumber(String campaignNumber) {
        return campaignRepository.findByCampaignNumber(campaignNumber)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));
    }
}
