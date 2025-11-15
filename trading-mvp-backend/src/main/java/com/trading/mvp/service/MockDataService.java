package com.trading.mvp.service;

import com.trading.mvp.model.Competition;
import com.trading.mvp.repository.CompetitionRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Service
public class MockDataService {

    @Autowired
    private CompetitionRepository competitionRepository;

    @PostConstruct
    public void initMockData() {
        // Only create mock data if database is empty
        if (competitionRepository.count() == 0) {
            List<Competition> mockCompetitions = Arrays.asList(
                    createCompetition(
                            "Beginner Trading Challenge",
                            "Perfect for new traders to get started with virtual trading",
                            BigDecimal.ZERO,
                            new BigDecimal("1000"),
                            LocalDate.now(),
                            LocalDate.now().plusDays(7),
                            100,
                            23
                    ),
                    createCompetition(
                            "Pro Trader Championship",
                            "Advanced trading competition for experienced traders",
                            new BigDecimal("50"),
                            new BigDecimal("5000"),
                            LocalDate.now().plusDays(3),
                            LocalDate.now().plusDays(10),
                            50,
                            12
                    ),
                    createCompetition(
                            "Weekend Sprint",
                            "Quick 2-day competition with fast-paced trading",
                            new BigDecimal("10"),
                            new BigDecimal("500"),
                            LocalDate.now().plusDays(5),
                            LocalDate.now().plusDays(7),
                            200,
                            89
                    ),
                    createCompetition(
                            "Monthly Marathon",
                            "30-day long trading competition with big prizes",
                            new BigDecimal("25"),
                            new BigDecimal("10000"),
                            LocalDate.now().plusDays(2),
                            LocalDate.now().plusDays(32),
                            150,
                            45
                    ),
                    createCompetition(
                            "Crypto Specialist Challenge",
                            "Focused on cryptocurrency trading strategies",
                            new BigDecimal("15"),
                            new BigDecimal("2500"),
                            LocalDate.now().plusDays(1),
                            LocalDate.now().plusDays(14),
                            75,
                            31
                    )
            );

            competitionRepository.saveAll(mockCompetitions);
            System.out.println("Mock competitions created successfully!");
        }
    }

    private Competition createCompetition(String name, String description, BigDecimal entryFee,
                                          BigDecimal prizePool, LocalDate startDate, LocalDate endDate,
                                          Integer maxParticipants, Integer currentParticipants) {
        Competition competition = new Competition();
        competition.setName(name);
        competition.setDescription(description);
        competition.setEntryFee(entryFee);
        competition.setPrizePool(prizePool);
        competition.setStartDate(startDate);
        competition.setEndDate(endDate);
        competition.setMaxParticipants(maxParticipants);
        competition.setCurrentParticipants(currentParticipants);
        competition.setStatus("OPEN");
        return competition;
    }
}
