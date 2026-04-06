package com.finova.loan.repository;

import static org.junit.jupiter.api.Assertions.*;

import com.finova.loan.LoanManagementApplication;
import com.finova.loan.model.Loan;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ContextConfiguration;

@DataJpaTest
@ContextConfiguration(classes = LoanManagementApplication.class)
public class LoanRepositoryTest {

  @Autowired private LoanRepository loanRepository;

  @Test
  public void testSaveAndFindLoan() {
    Loan loan = new Loan();
    loan.setLoanNumber("LOAN123456");
    loan.setAmount(new BigDecimal("10000.00"));
    loan.setInterestRate(new BigDecimal("5.25"));
    loan.setTermMonths(36);
    loan.setCustomerId("customer123");
    loan.setStatus(Loan.LoanStatus.PENDING);

    Loan savedLoan = loanRepository.save(loan);

    assertNotNull(savedLoan.getId());
    assertEquals("LOAN123456", savedLoan.getLoanNumber());
    assertEquals(Loan.LoanStatus.PENDING, savedLoan.getStatus());
  }

  @Test
  public void testFindById() {
    Loan loan = new Loan();
    loan.setLoanNumber("LOAN999");
    loan.setAmount(new BigDecimal("5000.00"));
    loan.setCustomerId("customer456");
    loan.setStatus(Loan.LoanStatus.APPROVED);

    Loan saved = loanRepository.save(loan);

    assertTrue(loanRepository.findById(saved.getId()).isPresent());
    assertEquals("LOAN999", loanRepository.findById(saved.getId()).get().getLoanNumber());
  }
}
