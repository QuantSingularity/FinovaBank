package com.finova.loan.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.finova.loan.model.Loan;
import com.finova.loan.repository.LoanRepository;
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
public class LoanServiceTest {

  @Mock
  private LoanRepository loanRepository;

  @InjectMocks
  private LoanServiceImpl loanService;

  @Test
  public void testApplyForLoan() {
    Loan loan = new Loan();
    loan.setCustomerId("customer123");
    loan.setAmount(new BigDecimal("10000.00"));
    loan.setInterestRate(new BigDecimal("5.25"));
    loan.setTermMonths(36);

    Loan saved = new Loan();
    saved.setId(1L);
    saved.setCustomerId("customer123");
    saved.setAmount(new BigDecimal("10000.00"));
    saved.setStatus(Loan.LoanStatus.PENDING);

    when(loanRepository.save(any(Loan.class))).thenReturn(saved);

    Loan result = loanService.createLoan(loan);

    assertNotNull(result);
    assertNotNull(result.getId());
    assertEquals(Loan.LoanStatus.PENDING, result.getStatus());
    verify(loanRepository, times(1)).save(any(Loan.class));
  }

  @Test
  public void testGetLoanById() {
    Loan loan = new Loan();
    loan.setId(1L);
    loan.setCustomerId("customer123");
    loan.setAmount(new BigDecimal("5000.00"));
    loan.setStatus(Loan.LoanStatus.APPROVED);

    when(loanRepository.findById(1L)).thenReturn(Optional.of(loan));

    Loan result = loanService.getLoanById(1L);

    assertNotNull(result);
    assertEquals(1L, result.getId());
    assertEquals(Loan.LoanStatus.APPROVED, result.getStatus());
    verify(loanRepository, times(1)).findById(1L);
  }

  @Test
  public void testGetAllLoans() {
    Loan loan1 = new Loan();
    loan1.setId(1L);
    loan1.setCustomerId("c1");
    loan1.setAmount(new BigDecimal("1000.00"));
    loan1.setStatus(Loan.LoanStatus.ACTIVE);

    Loan loan2 = new Loan();
    loan2.setId(2L);
    loan2.setCustomerId("c2");
    loan2.setAmount(new BigDecimal("2000.00"));
    loan2.setStatus(Loan.LoanStatus.PENDING);

    when(loanRepository.findAll()).thenReturn(Arrays.asList(loan1, loan2));

    List<Loan> results = loanService.getAllLoans();

    assertNotNull(results);
    assertEquals(2, results.size());
  }

  @Test
  public void testDeleteLoan() {
    when(loanRepository.existsById(1L)).thenReturn(true);
    doNothing().when(loanRepository).deleteById(1L);

    loanService.deleteLoan(1L);

    verify(loanRepository, times(1)).existsById(1L);
    verify(loanRepository, times(1)).deleteById(1L);
  }
}
