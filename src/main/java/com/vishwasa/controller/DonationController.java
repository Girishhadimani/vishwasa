package com.vishwasa.controller;

import com.vishwasa.dto.DonationRequest;
import com.vishwasa.entity.Donation;
import com.vishwasa.entity.DonationCampaign;
import com.vishwasa.service.DonationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DonationController {

    private final DonationService donationService;

    @PostMapping
    public ResponseEntity<Donation> createDonation(@Valid @RequestBody DonationRequest request) {
        Donation donation = donationService.createDonation(request);
        return ResponseEntity.ok(donation);
    }

    @PostMapping("/{transactionId}/complete")
    public ResponseEntity<Donation> completeDonation(
            @PathVariable String transactionId,
            @RequestParam String paymentReference,
            @RequestParam(required = false) String gatewayTransactionId) {
        Donation donation = donationService.completeDonation(transactionId, paymentReference, gatewayTransactionId);
        return ResponseEntity.ok(donation);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Donation> getDonation(@PathVariable Long id) {
        Donation donation = donationService.getDonationById(id);
        return ResponseEntity.ok(donation);
    }

    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<Donation> getDonationByTransactionId(@PathVariable String transactionId) {
        Donation donation = donationService.getDonationByTransactionId(transactionId);
        return ResponseEntity.ok(donation);
    }

    @GetMapping("/campaign/{campaignId}")
    public ResponseEntity<List<Donation>> getDonationsByCampaign(@PathVariable Long campaignId) {
        List<Donation> donations = donationService.getDonationsByCampaign(campaignId);
        return ResponseEntity.ok(donations);
    }

    @GetMapping("/donor/{email}")
    public ResponseEntity<List<Donation>> getDonationsByDonorEmail(@PathVariable String email) {
        List<Donation> donations = donationService.getDonationsByDonorEmail(email);
        return ResponseEntity.ok(donations);
    }

    @PostMapping("/campaigns")
    public ResponseEntity<DonationCampaign> createCampaign(
            @RequestParam Long medicalCaseId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam BigDecimal targetAmount) {
        DonationCampaign campaign = donationService.createCampaign(medicalCaseId, title, description, targetAmount);
        return ResponseEntity.ok(campaign);
    }

    @PostMapping("/campaigns/{id}/publish")
    public ResponseEntity<DonationCampaign> publishCampaign(@PathVariable Long id) {
        DonationCampaign campaign = donationService.publishCampaign(id);
        return ResponseEntity.ok(campaign);
    }

    @GetMapping("/campaigns/active")
    public ResponseEntity<List<DonationCampaign>> getActiveCampaigns() {
        List<DonationCampaign> campaigns = donationService.getActiveCampaigns();
        return ResponseEntity.ok(campaigns);
    }

    @GetMapping("/campaigns/published")
    public ResponseEntity<List<DonationCampaign>> getPublishedCampaigns() {
        List<DonationCampaign> campaigns = donationService.getPublishedCampaigns();
        return ResponseEntity.ok(campaigns);
    }

    @GetMapping("/campaigns/number/{campaignNumber}")
    public ResponseEntity<DonationCampaign> getCampaignByNumber(@PathVariable String campaignNumber) {
        DonationCampaign campaign = donationService.getCampaignByNumber(campaignNumber);
        return ResponseEntity.ok(campaign);
    }
}
