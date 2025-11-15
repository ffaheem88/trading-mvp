package com.trading.mvp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CompetitionResponse {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal entryFee;
    private BigDecimal prizePool;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer currentParticipants;
    private Integer maxParticipants;
    private String status;
    private Boolean hasJoined;
}
