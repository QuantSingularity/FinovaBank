package com.finova.savings.controller;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.finova.savings.SavingsGoalsServiceApplication;
import com.finova.savings.model.SavingsGoal;
import com.finova.savings.service.SavingsGoalService;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SavingsGoalController.class)
@ContextConfiguration(classes = SavingsGoalsServiceApplication.class)
public class SavingsGoalControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private SavingsGoalService savingsGoalService;

  private static final ObjectMapper objectMapper = new ObjectMapper();

  static {
    objectMapper.registerModule(new JavaTimeModule());
  }

  private static String asJsonString(final Object obj) {
    try {
      return objectMapper.writeValueAsString(obj);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  @Test
  public void contextLoads() throws Exception {
    assert (mockMvc != null);
  }

  @Test
  public void testGetSavingsGoalById() throws Exception {
    SavingsGoal goal = new SavingsGoal();
    goal.setId(1L);
    goal.setGoalName("Vacation Fund");
    goal.setTargetAmount(new BigDecimal("2000.00"));
    goal.setCurrentAmount(new BigDecimal("500.00"));
    goal.setCustomerId("customer1");

    when(savingsGoalService.getSavingsGoalById(1L)).thenReturn(goal);

    mockMvc
        .perform(get("/api/savings-goals/{id}", 1L).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", is(1)))
        .andExpect(jsonPath("$.goalName", is("Vacation Fund")))
        .andExpect(jsonPath("$.targetAmount", is(2000.00)));

    verify(savingsGoalService, times(1)).getSavingsGoalById(1L);
  }

  @Test
  public void testGetAllSavingsGoals() throws Exception {
    SavingsGoal goal1 = new SavingsGoal();
    goal1.setId(1L);
    goal1.setGoalName("Vacation");
    goal1.setTargetAmount(new BigDecimal("2000.00"));
    goal1.setCustomerId("customer1");

    SavingsGoal goal2 = new SavingsGoal();
    goal2.setId(2L);
    goal2.setGoalName("New Car");
    goal2.setTargetAmount(new BigDecimal("10000.00"));
    goal2.setCustomerId("customer2");

    List<SavingsGoal> goals = Arrays.asList(goal1, goal2);
    when(savingsGoalService.getAllSavingsGoals()).thenReturn(goals);

    mockMvc
        .perform(get("/api/savings-goals").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[0].goalName", is("Vacation")))
        .andExpect(jsonPath("$[1].goalName", is("New Car")));

    verify(savingsGoalService, times(1)).getAllSavingsGoals();
  }

  @Test
  public void testCreateSavingsGoal() throws Exception {
    SavingsGoal goalToCreate = new SavingsGoal();
    goalToCreate.setGoalName("Emergency Fund");
    goalToCreate.setTargetAmount(new BigDecimal("5000.00"));
    goalToCreate.setCustomerId("customer123");

    SavingsGoal createdGoal = new SavingsGoal();
    createdGoal.setId(3L);
    createdGoal.setGoalName("Emergency Fund");
    createdGoal.setTargetAmount(new BigDecimal("5000.00"));
    createdGoal.setCurrentAmount(new BigDecimal("0.00"));
    createdGoal.setCustomerId("customer123");

    when(savingsGoalService.createSavingsGoal(any(SavingsGoal.class))).thenReturn(createdGoal);

    mockMvc
        .perform(
            post("/api/savings-goals")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(goalToCreate)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id", is(3)))
        .andExpect(jsonPath("$.goalName", is("Emergency Fund")));

    verify(savingsGoalService, times(1)).createSavingsGoal(any(SavingsGoal.class));
  }

  @Test
  public void testUpdateSavingsGoal() throws Exception {
    SavingsGoal goalUpdates = new SavingsGoal();
    goalUpdates.setCurrentAmount(new BigDecimal("750.00"));
    goalUpdates.setGoalName("Vacation Fund");
    goalUpdates.setTargetAmount(new BigDecimal("2000.00"));
    goalUpdates.setCustomerId("customer1");

    SavingsGoal updatedGoal = new SavingsGoal();
    updatedGoal.setId(1L);
    updatedGoal.setGoalName("Vacation Fund");
    updatedGoal.setTargetAmount(new BigDecimal("2000.00"));
    updatedGoal.setCurrentAmount(new BigDecimal("750.00"));
    updatedGoal.setCustomerId("customer1");

    when(savingsGoalService.updateSavingsGoal(eq(1L), any(SavingsGoal.class)))
        .thenReturn(updatedGoal);

    mockMvc
        .perform(
            put("/api/savings-goals/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(goalUpdates)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", is(1)))
        .andExpect(jsonPath("$.currentAmount", is(750.00)));

    verify(savingsGoalService, times(1)).updateSavingsGoal(eq(1L), any(SavingsGoal.class));
  }

  @Test
  public void testDeleteSavingsGoal() throws Exception {
    doNothing().when(savingsGoalService).deleteSavingsGoal(1L);

    mockMvc
        .perform(delete("/api/savings-goals/{id}", 1L))
        .andExpect(status().isNoContent());

    verify(savingsGoalService, times(1)).deleteSavingsGoal(1L);
  }
}
