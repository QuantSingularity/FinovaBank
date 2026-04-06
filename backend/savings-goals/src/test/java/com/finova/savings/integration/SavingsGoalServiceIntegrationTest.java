package com.finova.savings.integration;

import static org.junit.jupiter.api.Assertions.*;

import com.finova.savings.SavingsGoalsServiceApplication;
import com.finova.savings.model.SavingsGoal;
import com.finova.savings.service.SavingsGoalService;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@ContextConfiguration(classes = SavingsGoalsServiceApplication.class)
@TestPropertySource(
    properties = {
      "eureka.client.enabled=false",
      "eureka.client.register-with-eureka=false",
      "eureka.client.fetch-registry=false",
      "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,"
          + "org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration,"
          + "org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration"
    })
public class SavingsGoalServiceIntegrationTest {

  @LocalServerPort private int port;

  @Autowired private SavingsGoalService savingsGoalService;

  @Test
  public void testCreateAndGetSavingsGoal() {
    SavingsGoal savingsGoal = new SavingsGoal();
    savingsGoal.setGoalName("Vacation Fund");
    savingsGoal.setTargetAmount(new BigDecimal("5000.00"));
    savingsGoal.setCurrentAmount(new BigDecimal("1000.00"));
    savingsGoal.setTargetDate(LocalDate.now().plusMonths(6));
    savingsGoal.setCustomerId("customer123");

    SavingsGoal savedGoal = savingsGoalService.createSavingsGoal(savingsGoal);

    assertNotNull(savedGoal.getId());

    SavingsGoal retrievedGoal = savingsGoalService.getSavingsGoalById(savedGoal.getId());

    assertEquals(savedGoal.getId(), retrievedGoal.getId());
    assertEquals("Vacation Fund", retrievedGoal.getGoalName());
    assertEquals(0, new BigDecimal("5000.00").compareTo(retrievedGoal.getTargetAmount()));
    assertEquals(0, new BigDecimal("1000.00").compareTo(retrievedGoal.getCurrentAmount()));
    assertEquals("customer123", retrievedGoal.getCustomerId());
  }
}
