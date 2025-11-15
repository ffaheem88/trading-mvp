package com.trading.mvp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "competitions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Competition {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "entry_fee")
    private BigDecimal entryFee = BigDecimal.ZERO;

    @Column(name = "prize_pool")
    private BigDecimal prizePool = new BigDecimal("1000");

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "max_participants")
    private Integer maxParticipants = 100;

    @Column(name = "current_participants")
    private Integer currentParticipants = 0;

    @Column(nullable = false)
    private String status = "OPEN"; // OPEN, CLOSED, FINISHED

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
