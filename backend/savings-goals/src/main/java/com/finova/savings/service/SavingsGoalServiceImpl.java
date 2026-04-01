package com.finova.savings.service;

import com.finova.savings.model.SavingsGoal;
import com.finova.savings.repository.SavingsGoalRepository;
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
    log.info("Creating savings goal for customer: {}", savingsGoal.getCustomerId());
    return savingsGoalRepository.save(savingsGoal);
  }

  @Override
  public SavingsGoal updateSavingsGoal(Long id, SavingsGoal savingsGoal) {
    SavingsGoal existingGoal = savingsGoalRepository.findById(id).orElse(null);
    if (existingGoal != null) {
      existingGoal.setGoalName(savingsGoal.getGoalName());
      existingGoal.setTargetAmount(savingsGoal.getTargetAmount());
      existingGoal.setCurrentAmount(savingsGoal.getCurrentAmount());
      if (savingsGoal.getTargetDate() != null) {
        existingGoal.setTargetDate(savingsGoal.getTargetDate());
      }
      if (savingsGoal.getStatus() != null) {
        existingGoal.setStatus(savingsGoal.getStatus());
      }
      if (savingsGoal.getDescription() != null) {
        existingGoal.setDescription(savingsGoal.getDescription());
      }
      log.info("Updated savings goal with ID: {}", id);
      return savingsGoalRepository.save(existingGoal);
    }
    return null;
  }

  @Override
  public void deleteSavingsGoal(Long id) {
    savingsGoalRepository.deleteById(id);
    log.info("Deleted savings goal with ID: {}", id);
  }
}
