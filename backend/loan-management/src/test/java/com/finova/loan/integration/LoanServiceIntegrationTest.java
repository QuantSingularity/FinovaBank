package com.finova.loan.integration;

import static org.junit.jupiter.api.Assertions.*;

import com.finova.loan.LoanManagementApplication;
import com.finova.loan.model.Loan;
import com.finova.loan.service.LoanService;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@ContextConfiguration(classes = LoanManagementApplication.class)
@TestPropertySource(
    properties = {
      "eureka.client.enabled=false",
      "eureka.client.register-with-eureka=false",
      "eureka.client.fetch-registry=false",
      "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,"
          + "org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration,"
          + "org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration"
    })
public class LoanServiceIntegrationTest {

  @LocalServerPort private int port;

  @Autowired private LoanService loanService;

  @Test
  public void testCreateAndGetLoan() {
    Loan loan = new Loan();
    loan.setLoanNumber("LOAN123456");
    loan.setAmount(new BigDecimal("10000.00"));
    loan.setInterestRate(new BigDecimal("5.25"));
    loan.setTermMonths(36);
    loan.setCustomerId("customer123");

    Loan savedLoan = loanService.createLoan(loan);

    assertNotNull(savedLoan.getId());

    Loan retrievedLoan = loanService.getLoanById(savedLoan.getId());

    assertEquals(savedLoan.getId(), retrievedLoan.getId());
    assertEquals("LOAN123456", retrievedLoan.getLoanNumber());
    assertEquals(0, new BigDecimal("10000.00").compareTo(retrievedLoan.getAmount()));
    assertEquals(0, new BigDecimal("5.25").compareTo(retrievedLoan.getInterestRate()));
    assertEquals(36, retrievedLoan.getTermMonths());
    assertEquals("customer123", retrievedLoan.getCustomerId());
  }
}
