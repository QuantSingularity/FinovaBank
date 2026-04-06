package com.finova.savings.service;

import com.finova.savings.model.SavingsGoal;
import com.finova.savings.repository.SavingsGoalRepository;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SavingsGoalServiceImpl implements SavingsGoalService {

  private final SavingsGoalRepository savingsGoalRepository;

  @Override
  @Transactional(readOnly = true)
  public SavingsGoal getSavingsGoalById(Long id) {
    return savingsGoalRepository.findById(id).orElse(null);
  }

  @Override
  @Transactional(readOnly = true)
  public List<SavingsGoal> getAllSavingsGoals() {
    return savingsGoalRepository.findAll();
  }

  @Override
  public SavingsGoal createSavingsGoal(SavingsGoal savingsGoal) {
    if (savingsGoal.getCustomerId() == null || savingsGoal.getCustomerId().isBlank()) {
      throw new IllegalArgumentException("Customer ID is required");
    }
    if (savingsGoal.getGoalName() == null || savingsGoal.getGoalName().isBlank()) {
      throw new IllegalArgumentException("Goal name is required");
    }
    if (savingsGoal.getTargetAmount() == null
        || savingsGoal.getTargetAmount().compareTo(BigDecimal.ZERO) <= 0) {
      throw new IllegalArgumentException("Target amount must be positive");
    }
    if (savingsGoal.getCurrentAmount() == null) {
      savingsGoal.setCurrentAmount(BigDecimal.ZERO);
    }
    if (savingsGoal.getStatus() == null) {
      savingsGoal.setStatus(SavingsGoal.GoalStatus.IN_PROGRESS);
    }
    log.info("Creating savings goal '{}' for customer: {}",
        savingsGoal.getGoalName(), savingsGoal.getCustomerId());
    return savingsGoalRepository.save(savingsGoal);
  }

  @Override
  public SavingsGoal updateSavingsGoal(Long id, SavingsGoal savingsGoal) {
    SavingsGoal existingGoal =
        savingsGoalRepository
            .findById(id)
            .orElseThrow(() -> new RuntimeException("Savings goal not found with ID: " + id));

    if (savingsGoal.getGoalName() != null) {
      existingGoal.setGoalName(savingsGoal.getGoalName());
    }
    if (savingsGoal.getTargetAmount() != null) {
      existingGoal.setTargetAmount(savingsGoal.getTargetAmount());
    }
    if (savingsGoal.getCurrentAmount() != null) {
      existingGoal.setCurrentAmount(savingsGoal.getCurrentAmount());
    }
    if (savingsGoal.getTargetDate() != null) {
      existingGoal.setTargetDate(savingsGoal.getTargetDate());
    }
    if (savingsGoal.getStatus() != null) {
      existingGoal.setStatus(savingsGoal.getStatus());
    }
    if (savingsGoal.getDescription() != null) {
      existingGoal.setDescription(savingsGoal.getDescription());
    }

    if (existingGoal.getCurrentAmount() != null
        && existingGoal.getTargetAmount() != null
        && existingGoal.getCurrentAmount().compareTo(existingGoal.getTargetAmount()) >= 0
        && existingGoal.getStatus() == SavingsGoal.GoalStatus.IN_PROGRESS) {
      existingGoal.setStatus(SavingsGoal.GoalStatus.COMPLETED);
      log.info("Savings goal {} automatically marked as COMPLETED", id);
    }

    log.info("Updated savings goal with ID: {}", id);
    return savingsGoalRepository.save(existingGoal);
  }

  @Override
  public void deleteSavingsGoal(Long id) {
    if (!savingsGoalRepository.existsById(id)) {
      throw new RuntimeException("Savings goal not found with ID: " + id);
    }
    savingsGoalRepository.deleteById(id);
    log.info("Deleted savings goal with ID: {}", id);
  }
}
