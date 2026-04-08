package com.finova.savings.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.finova.savings.model.SavingsGoal;
import com.finova.savings.repository.SavingsGoalRepository;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class SavingsGoalServiceTest {

  @Mock
  private SavingsGoalRepository savingsGoalRepository;

  @InjectMocks
  private SavingsGoalServiceImpl savingsGoalService;

  @Test
  public void testCreateSavingsGoal() {
    SavingsGoal goal = new SavingsGoal();
    goal.setGoalName("Vacation Fund");
    goal.setTargetAmount(new BigDecimal("5000.00"));
    goal.setCustomerId("customer123");

    SavingsGoal saved = new SavingsGoal();
    saved.setId(1L);
    saved.setGoalName("Vacation Fund");
    saved.setTargetAmount(new BigDecimal("5000.00"));
    saved.setCustomerId("customer123");
    saved.setStatus(SavingsGoal.GoalStatus.IN_PROGRESS);

    when(savingsGoalRepository.save(any(SavingsGoal.class))).thenReturn(saved);

    SavingsGoal result = savingsGoalService.createSavingsGoal(goal);

    assertNotNull(result);
    assertNotNull(result.getId());
    assertEquals("Vacation Fund", result.getGoalName());
    assertEquals(SavingsGoal.GoalStatus.IN_PROGRESS, result.getStatus());
    verify(savingsGoalRepository, times(1)).save(any(SavingsGoal.class));
  }

  @Test
  public void testGetSavingsGoalById() {
    SavingsGoal goal = new SavingsGoal();
    goal.setId(1L);
    goal.setGoalName("New Car");
    goal.setTargetAmount(new BigDecimal("15000.00"));
    goal.setCustomerId("customer456");

    when(savingsGoalRepository.findById(1L)).thenReturn(Optional.of(goal));

    SavingsGoal result = savingsGoalService.getSavingsGoalById(1L);

    assertNotNull(result);
    assertEquals("New Car", result.getGoalName());
    verify(savingsGoalRepository, times(1)).findById(1L);
  }

  @Test
  public void testGetAllSavingsGoals() {
    SavingsGoal g1 = new SavingsGoal();
    g1.setId(1L);
    g1.setGoalName("Goal 1");
    g1.setCustomerId("c1");
    g1.setTargetAmount(new BigDecimal("1000.00"));

    SavingsGoal g2 = new SavingsGoal();
    g2.setId(2L);
    g2.setGoalName("Goal 2");
    g2.setCustomerId("c2");
    g2.setTargetAmount(new BigDecimal("2000.00"));

    when(savingsGoalRepository.findAll()).thenReturn(Arrays.asList(g1, g2));

    List<SavingsGoal> results = savingsGoalService.getAllSavingsGoals();

    assertNotNull(results);
    assertEquals(2, results.size());
  }

  @Test
  public void testDeleteSavingsGoal() {
    when(savingsGoalRepository.existsById(1L)).thenReturn(true);
    doNothing().when(savingsGoalRepository).deleteById(1L);

    savingsGoalService.deleteSavingsGoal(1L);

    verify(savingsGoalRepository, times(1)).existsById(1L);
    verify(savingsGoalRepository, times(1)).deleteById(1L);
  }
}
