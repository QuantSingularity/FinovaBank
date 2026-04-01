package com.finova.savings.controller;

import com.finova.savings.model.SavingsGoal;
import com.finova.savings.service.SavingsGoalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/savings-goals")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Savings Goals", description = "Savings goal management endpoints")
public class SavingsGoalController {

  private final SavingsGoalService savingsGoalService;

  @GetMapping("/{id}")
  @Operation(summary = "Get savings goal by ID")
  public ResponseEntity<SavingsGoal> getSavingsGoalById(@PathVariable Long id) {
    log.debug("Fetching savings goal with ID: {}", id);
    SavingsGoal goal = savingsGoalService.getSavingsGoalById(id);
    if (goal == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(goal);
  }

  @GetMapping
  @Operation(summary = "Get all savings goals")
  public ResponseEntity<List<SavingsGoal>> getAllSavingsGoals() {
    log.debug("Fetching all savings goals");
    return ResponseEntity.ok(savingsGoalService.getAllSavingsGoals());
  }

  @PostMapping
  @Operation(summary = "Create a savings goal")
  public ResponseEntity<SavingsGoal> createSavingsGoal(@Valid @RequestBody SavingsGoal savingsGoal) {
    log.info("Creating savings goal for customer: {}", savingsGoal.getCustomerId());
    SavingsGoal created = savingsGoalService.createSavingsGoal(savingsGoal);
    log.info("Savings goal created with ID: {}", created.getId());
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  @PutMapping("/{id}")
  @Operation(summary = "Update a savings goal")
  public ResponseEntity<SavingsGoal> updateSavingsGoal(
      @PathVariable Long id, @Valid @RequestBody SavingsGoal savingsGoal) {
    log.info("Updating savings goal with ID: {}", id);
    SavingsGoal updated = savingsGoalService.updateSavingsGoal(id, savingsGoal);
    if (updated == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(updated);
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete a savings goal")
  public ResponseEntity<Void> deleteSavingsGoal(@PathVariable Long id) {
    log.info("Deleting savings goal with ID: {}", id);
    savingsGoalService.deleteSavingsGoal(id);
    return ResponseEntity.noContent().build();
  }
}
