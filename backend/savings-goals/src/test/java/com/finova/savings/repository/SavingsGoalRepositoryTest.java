package com.finova.savings.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import com.finova.savings.model.SavingsGoal;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest
public class SavingsGoalRepositoryTest {

  @Autowired private TestEntityManager entityManager;

  @Autowired private SavingsGoalRepository savingsGoalRepository;

  @Test
  public void whenFindById_thenReturnSavingsGoal() {
    SavingsGoal goal = new SavingsGoal();
    goal.setGoalName("Vacation Fund");
    goal.setTargetAmount(new BigDecimal("5000.00"));
    goal.setCurrentAmount(new BigDecimal("1000.00"));
    goal.setCustomerId("customer123");

    entityManager.persist(goal);
    entityManager.flush();

    Optional<SavingsGoal> found = savingsGoalRepository.findById(goal.getId());

    assertThat(found).isPresent();
    assertEquals("Vacation Fund", found.get().getGoalName());
    assertEquals(0, new BigDecimal("5000.00").compareTo(found.get().getTargetAmount()));
  }

  @Test
  public void testSaveSavingsGoal() {
    SavingsGoal goal = new SavingsGoal();
    goal.setGoalName("Emergency Fund");
    goal.setTargetAmount(new BigDecimal("3000.00"));
    goal.setCustomerId("customer456");

    SavingsGoal saved = savingsGoalRepository.save(goal);

    assertNotNull(saved.getId());
    assertEquals("Emergency Fund", saved.getGoalName());
    assertEquals(SavingsGoal.GoalStatus.IN_PROGRESS, saved.getStatus());
  }
}
