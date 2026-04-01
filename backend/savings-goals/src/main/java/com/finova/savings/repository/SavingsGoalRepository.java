package com.finova.savings.repository;

import com.finova.savings.model.SavingsGoal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, Long> {

  List<SavingsGoal> findByCustomerId(String customerId);

  List<SavingsGoal> findByAccountId(Long accountId);

  List<SavingsGoal> findByStatus(SavingsGoal.GoalStatus status);
}
