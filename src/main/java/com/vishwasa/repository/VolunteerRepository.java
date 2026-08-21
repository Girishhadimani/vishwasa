package com.vishwasa.repository;

import com.vishwasa.entity.Volunteer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {
    Optional<Volunteer> findByUserId(Long userId);
    Volunteer findByUserIdAndVerifiedTrue(Long userId);

    @Query("SELECT v FROM Volunteer v WHERE v.verified = true AND v.available = true " +
           "AND (6371 * acos(cos(radians(:lat)) * cos(radians(v.latitude)) * " +
           "cos(radians(v.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(v.latitude)))) < :radius")
    List<Volunteer> findNearbyVolunteers(@Param("lat") double latitude,
                                          @Param("lng") double longitude,
                                          @Param("radius") double radiusKm);
}
