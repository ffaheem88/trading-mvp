package com.trading.mvp.repository;

import com.trading.mvp.model.CompetitionParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompetitionParticipantRepository extends JpaRepository<CompetitionParticipant, UUID> {
    boolean existsByCompetitionIdAndUserId(UUID competitionId, UUID userId);
    Optional<CompetitionParticipant> findByCompetitionIdAndUserId(UUID competitionId, UUID userId);
    List<CompetitionParticipant> findByUserId(UUID userId);
}
