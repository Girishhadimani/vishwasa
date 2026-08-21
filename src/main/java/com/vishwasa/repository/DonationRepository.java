package com.vishwasa.repository;

import com.vishwasa.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    Optional<Donation> findByTransactionId(String transactionId);
    List<Donation> findByCampaignId(Long campaignId);
    List<Donation> findByDonorEmail(String email);
}
