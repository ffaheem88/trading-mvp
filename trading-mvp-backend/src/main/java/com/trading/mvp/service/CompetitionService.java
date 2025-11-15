package com.trading.mvp.service;

import com.trading.mvp.dto.response.CompetitionResponse;
import com.trading.mvp.dto.response.PageResponse;
import com.trading.mvp.model.Competition;
import com.trading.mvp.model.CompetitionParticipant;
import com.trading.mvp.model.User;
import com.trading.mvp.repository.CompetitionParticipantRepository;
import com.trading.mvp.repository.CompetitionRepository;
import com.trading.mvp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CompetitionService {

    @Autowired
    private CompetitionRepository competitionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompetitionParticipantRepository participantRepository;

    public List<CompetitionResponse> getAllCompetitions(String userEmail) {
        List<Competition> competitions = competitionRepository.findAll();

        // Get user if authenticated
        UUID userId = null;
        if (userEmail != null) {
            userId = userRepository.findByEmail(userEmail)
                    .map(User::getId)
                    .orElse(null);
        }

        final UUID finalUserId = userId;
        return competitions.stream()
                .map(competition -> mapToResponse(competition, finalUserId))
                .collect(Collectors.toList());
    }

    public PageResponse<CompetitionResponse> getCompetitionsWithFilters(
            String userEmail,
            String search,
            Boolean freeOnly,
            int page,
            int size) {

        // Create pageable without sorting (sorting handled in native SQL query)
        Pageable pageable = PageRequest.of(page, size);

        // Get user if authenticated
        UUID userId = null;
        if (userEmail != null) {
            userId = userRepository.findByEmail(userEmail)
                    .map(User::getId)
                    .orElse(null);
        }

        // Fetch competitions with filters
        Page<Competition> competitionPage = competitionRepository.findWithFilters(
                search, freeOnly, pageable);

        // Map to response
        final UUID finalUserId = userId;
        List<CompetitionResponse> content = competitionPage.getContent().stream()
                .map(competition -> mapToResponse(competition, finalUserId))
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                competitionPage.getNumber(),
                competitionPage.getSize(),
                competitionPage.getTotalElements(),
                competitionPage.getTotalPages(),
                competitionPage.isLast(),
                competitionPage.isFirst()
        );
    }

    public List<CompetitionResponse> getUserCompetitions(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<CompetitionParticipant> participants = participantRepository.findByUserId(user.getId());
        return participants.stream()
                .map(participant -> mapToResponse(participant.getCompetition(), user.getId()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void joinCompetition(UUID competitionId, String userEmail) {
        // Find competition
        Competition competition = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new RuntimeException("Competition not found"));

        // Check if competition is open
        if (!"OPEN".equals(competition.getStatus())) {
            throw new RuntimeException("Competition is not open for joining");
        }

        // Check if competition is full
        if (competition.getCurrentParticipants() >= competition.getMaxParticipants()) {
            throw new RuntimeException("Competition is full");
        }

        // Find user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user already joined
        if (participantRepository.existsByCompetitionIdAndUserId(competitionId, user.getId())) {
            throw new RuntimeException("You have already joined this competition");
        }

        // Create participant
        CompetitionParticipant participant = new CompetitionParticipant();
        participant.setCompetition(competition);
        participant.setUser(user);
        participantRepository.save(participant);

        // Update participant count
        competition.setCurrentParticipants(competition.getCurrentParticipants() + 1);
        competitionRepository.save(competition);
    }

    @Transactional
    public void leaveCompetition(UUID competitionId, String userEmail) {
        // Find competition
        Competition competition = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new RuntimeException("Competition not found"));

        // Find user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user is a participant
        CompetitionParticipant participant = participantRepository
                .findByCompetitionIdAndUserId(competitionId, user.getId())
                .orElseThrow(() -> new RuntimeException("You are not a participant in this competition"));

        // Remove participant
        participantRepository.delete(participant);

        // Update participant count
        competition.setCurrentParticipants(competition.getCurrentParticipants() - 1);
        competitionRepository.save(competition);
    }

    private CompetitionResponse mapToResponse(Competition competition, UUID userId) {
        boolean hasJoined = false;
        if (userId != null) {
            hasJoined = participantRepository.existsByCompetitionIdAndUserId(
                    competition.getId(), userId);
        }

        return new CompetitionResponse(
                competition.getId(),
                competition.getName(),
                competition.getDescription(),
                competition.getEntryFee(),
                competition.getPrizePool(),
                competition.getStartDate(),
                competition.getEndDate(),
                competition.getCurrentParticipants(),
                competition.getMaxParticipants(),
                competition.getStatus(),
                hasJoined
        );
    }
}
