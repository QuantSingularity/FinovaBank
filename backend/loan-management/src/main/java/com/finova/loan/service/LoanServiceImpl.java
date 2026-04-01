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
    if (loan.getLoanNumber() == null || loan.getLoanNumber().isBlank()) {
      loan.setLoanNumber("LN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase());
    }
    if (loan.getRemainingBalance() == null) {
      loan.setRemainingBalance(loan.getAmount());
    }
    log.info("Creating loan for customer: {}", loan.getCustomerId());
    return loanRepository.save(loan);
  }

  @Override
  public Loan updateLoan(Long id, Loan loan) {
    Loan existingLoan = loanRepository.findById(id).orElse(null);
    if (existingLoan != null) {
      existingLoan.setAmount(loan.getAmount());
      existingLoan.setInterestRate(loan.getInterestRate());
      existingLoan.setStartDate(loan.getStartDate());
      existingLoan.setEndDate(loan.getEndDate());
      existingLoan.setStatus(loan.getStatus());
      if (loan.getPurpose() != null) {
        existingLoan.setPurpose(loan.getPurpose());
      }
      if (loan.getTermMonths() != null) {
        existingLoan.setTermMonths(loan.getTermMonths());
      }
      log.info("Updated loan with ID: {}", id);
      return loanRepository.save(existingLoan);
    }
    return null;
  }

  @Override
  public void deleteLoan(Long id) {
    loanRepository.deleteById(id);
    log.info("Deleted loan with ID: {}", id);
  }
}
