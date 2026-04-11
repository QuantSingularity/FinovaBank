package com.finova.account.service;

import com.finova.account.dto.AccountCreateRequest;
import com.finova.account.dto.AccountResponse;
import com.finova.account.dto.AccountUpdateRequest;
import com.finova.account.dto.BalanceUpdateRequest;
import com.finova.account.model.Account;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AccountService {
  // Basic CRUD operations
  AccountResponse getAccountById(Long id);

  AccountResponse getAccountByNumber(String accountNumber);

  List<AccountResponse> getAccountsByCustomerId(String customerId);

  Page<AccountResponse> getAllAccounts(
      Pageable pageable, Account.AccountType accountType, Account.AccountStatus status);

  AccountResponse createAccount(AccountCreateRequest request);

  AccountResponse updateAccount(Long id, AccountUpdateRequest request);

  void closeAccount(Long id, String reason);

  // Balance operations
  BigDecimal getAccountBalance(Long id);

  BigDecimal getAvailableBalance(Long id);

  AccountResponse updateBalance(Long id, BalanceUpdateRequest request);

  // Account status operations
  AccountResponse freezeAccount(Long id, String reason);

  AccountResponse unfreezeAccount(Long id);

  AccountResponse updateAccountStatus(Long id, Account.AccountStatus status, String reason);

  // Transaction validation
  boolean validateTransaction(Long id, BigDecimal amount, String transactionType);
}
