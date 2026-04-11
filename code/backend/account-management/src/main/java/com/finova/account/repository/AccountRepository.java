package com.finova.account.repository;

import com.finova.account.model.Account;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
  Optional<Account> findByAccountNumber(String accountNumber);

  List<Account> findByCustomerId(String customerId);

  Page<Account> findByAccountTypeAndStatus(
      Account.AccountType accountType, Account.AccountStatus status, Pageable pageable);

  Page<Account> findByAccountType(Account.AccountType accountType, Pageable pageable);

  Page<Account> findByStatus(Account.AccountStatus status, Pageable pageable);
}
