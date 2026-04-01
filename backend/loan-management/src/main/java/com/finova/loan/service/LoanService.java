package com.finova.loan.service;

import com.finova.loan.model.Loan;
import java.util.List;

public interface LoanService {

  Loan getLoanById(Long id);

  List<Loan> getAllLoans();

  Loan createLoan(Loan loan);

  Loan updateLoan(Long id, Loan loan);

  void deleteLoan(Long id);
}
