package com.vishwasa.repository;

import com.vishwasa.entity.DonationCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonationCampaignRepository extends JpaRepository<DonationCampaign, Long> {
    Optional<DonationCampaign> findByCampaignNumber(String campaignNumber);
    List<DonationCampaign> findByMedicalCaseId(Long medicalCaseId);
    List<DonationCampaign> findByActiveTrue();
    List<DonationCampaign> findByPublishedTrueAndActiveTrue();
}
