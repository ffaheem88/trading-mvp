package com.trading.mvp.repository;

import com.trading.mvp.model.Competition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CompetitionRepository extends JpaRepository<Competition, UUID> {
    List<Competition> findByStatus(String status);

    @Query(value = "SELECT * FROM competitions c WHERE " +
            "(CAST(:search AS text) IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%'))) AND " +
            "(CAST(:freeOnly AS text) IS NULL OR :freeOnly = false OR c.entry_fee = 0) " +
            "ORDER BY c.created_at DESC",
            countQuery = "SELECT COUNT(*) FROM competitions c WHERE " +
            "(CAST(:search AS text) IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%'))) AND " +
            "(CAST(:freeOnly AS text) IS NULL OR :freeOnly = false OR c.entry_fee = 0)",
            nativeQuery = true)
    Page<Competition> findWithFilters(
            @Param("search") String search,
            @Param("freeOnly") Boolean freeOnly,
            Pageable pageable
    );
}
