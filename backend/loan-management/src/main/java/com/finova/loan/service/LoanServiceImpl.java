package com.finova.loan.service;

import com.finova.loan.model.Loan;
import com.finova.loan.repository.LoanRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LoanServiceImpl implements LoanService {

  private final LoanRepository loanRepository;

  @Override
  @Transactional(readOnly = true)
  public Loan getLoanById(Long id) {
    return loanRepository.findById(id).orElse(null);
  }

  @Override
  @Transactional(readOnly = true)
  public List<Loan> getAllLoans() {
    return loanRepository.findAll();
  }

  @Override
  public Loan createLoan(Loan loan) {
    if (loan.getCustomerId() == null || loan.getCustomerId().isBlank()) {
      throw new IllegalArgumentException("Customer ID is required");
    }
    if (loan.getAmount() == null || loan.getAmount().signum() <= 0) {
      throw new IllegalArgumentException("Loan amount must be positive");
    }

    if (loan.getLoanNumber() == null || loan.getLoanNumber().isBlank()) {
      loan.setLoanNumber("LN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase());
    }
    if (loan.getRemainingBalance() == null) {
      loan.setRemainingBalance(loan.getAmount());
    }
    if (loan.getStatus() == null) {
      loan.setStatus(Loan.LoanStatus.PENDING);
    }

    log.info("Creating loan for customer: {}, amount: {}", loan.getCustomerId(), loan.getAmount());
    return loanRepository.save(loan);
  }

  @Override
  public Loan updateLoan(Long id, Loan loan) {
    Loan existingLoan =
        loanRepository
            .findById(id)
            .orElseThrow(() -> new RuntimeException("Loan not found with ID: " + id));

    if (loan.getAmount() != null) {
      existingLoan.setAmount(loan.getAmount());
    }
    if (loan.getInterestRate() != null) {
      existingLoan.setInterestRate(loan.getInterestRate());
    }
    if (loan.getStartDate() != null) {
      existingLoan.setStartDate(loan.getStartDate());
    }
    if (loan.getEndDate() != null) {
      existingLoan.setEndDate(loan.getEndDate());
    }
    if (loan.getStatus() != null) {
      existingLoan.setStatus(loan.getStatus());
    }
    if (loan.getPurpose() != null) {
      existingLoan.setPurpose(loan.getPurpose());
    }
    if (loan.getTermMonths() != null) {
      existingLoan.setTermMonths(loan.getTermMonths());
    }
    if (loan.getMonthlyPayment() != null) {
      existingLoan.setMonthlyPayment(loan.getMonthlyPayment());
    }
    if (loan.getRemainingBalance() != null) {
      existingLoan.setRemainingBalance(loan.getRemainingBalance());
    }

    log.info("Updated loan with ID: {}", id);
    return loanRepository.save(existingLoan);
  }

  @Override
  public void deleteLoan(Long id) {
    if (!loanRepository.existsById(id)) {
      throw new RuntimeException("Loan not found with ID: " + id);
    }
    loanRepository.deleteById(id);
    log.info("Deleted loan with ID: {}", id);
  }
}
