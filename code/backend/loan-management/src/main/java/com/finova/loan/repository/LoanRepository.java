package com.finova.loan.repository;

import com.finova.loan.model.Loan;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

  List<Loan> findByCustomerId(String customerId);

  Optional<Loan> findByLoanNumber(String loanNumber);

  List<Loan> findByStatus(Loan.LoanStatus status);

  List<Loan> findByAccountId(Long accountId);
}
