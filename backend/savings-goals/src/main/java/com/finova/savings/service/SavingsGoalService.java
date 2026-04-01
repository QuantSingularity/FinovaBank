package com.finova.savings.service;

import com.finova.savings.model.SavingsGoal;
import java.util.List;

public interface SavingsGoalService {

  SavingsGoal getSavingsGoalById(Long id);

  List<SavingsGoal> getAllSavingsGoals();

  SavingsGoal createSavingsGoal(SavingsGoal savingsGoal);

  SavingsGoal updateSavingsGoal(Long id, SavingsGoal savingsGoal);

  void deleteSavingsGoal(Long id);
}
