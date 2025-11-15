package com.trading.mvp.controller;

import com.trading.mvp.dto.response.CompetitionResponse;
import com.trading.mvp.dto.response.PageResponse;
import com.trading.mvp.service.CompetitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/competitions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class CompetitionController {

    @Autowired
    private CompetitionService competitionService;

    @GetMapping
    public ResponseEntity<List<CompetitionResponse>> getAllCompetitions(Principal principal) {
        String userEmail = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(competitionService.getAllCompetitions(userEmail));
    }

    @GetMapping("/paginated")
    public ResponseEntity<PageResponse<CompetitionResponse>> getCompetitionsPaginated(
            Principal principal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean freeOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {
        String userEmail = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(competitionService.getCompetitionsWithFilters(
                userEmail, search, freeOnly, page, size));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CompetitionResponse>> getMyCompetitions(Principal principal) {
        return ResponseEntity.ok(competitionService.getUserCompetitions(principal.getName()));
    }

    @PostMapping("/{competitionId}/join")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> joinCompetition(
            @PathVariable UUID competitionId,
            Principal principal) {
        try {
            competitionService.joinCompetition(competitionId, principal.getName());
            return ResponseEntity.ok(Map.of("message", "Successfully joined competition!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{competitionId}/leave")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> leaveCompetition(
            @PathVariable UUID competitionId,
            Principal principal) {
        try {
            competitionService.leaveCompetition(competitionId, principal.getName());
            return ResponseEntity.ok(Map.of("message", "Successfully left competition!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
