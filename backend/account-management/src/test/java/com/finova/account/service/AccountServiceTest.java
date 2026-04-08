package com.finova.account.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import com.finova.account.dto.AccountCreateRequest;
import com.finova.account.dto.AccountResponse;
import com.finova.account.model.Account;
import com.finova.account.repository.AccountRepository;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class AccountServiceTest {

  @Mock
  private AccountRepository accountRepository;

  @InjectMocks
  private AccountServiceImpl accountService;

  @Test
  public void testGetAccountById() {
    Account mockAccount = Account.builder()
        .id(1L)
        .accountNumber("ACC001")
        .customerId("customer1")
        .accountName("Test Account")
        .accountType(Account.AccountType.CHECKING)
        .status(Account.AccountStatus.ACTIVE)
        .balance(new BigDecimal("1000.00"))
        .availableBalance(new BigDecimal("1000.00"))
        .currency("USD")
        .build();

    when(accountRepository.findById(1L)).thenReturn(Optional.of(mockAccount));

    AccountResponse result = accountService.getAccountById(1L);

    assertNotNull(result);
    assertEquals(1L, result.getId());
    assertEquals("ACC001", result.getAccountNumber());
    verify(accountRepository, times(1)).findById(1L);
  }

  @Test
  public void testGetAccountById_NotFound() {
    when(accountRepository.findById(99L)).thenReturn(Optional.empty());

    assertThrows(RuntimeException.class, () -> accountService.getAccountById(99L));
    verify(accountRepository, times(1)).findById(99L);
  }

  @Test
  public void testCreateAccount() {
    AccountCreateRequest request = new AccountCreateRequest();
    request.setCustomerId("customer123");
    request.setAccountName("My Savings");
    request.setAccountType(Account.AccountType.SAVINGS);
    request.setCurrency("USD");
    request.setInitialDeposit(new BigDecimal("500.00"));

    Account savedAccount = Account.builder()
        .id(1L)
        .accountNumber("100012345678")
        .customerId("customer123")
        .accountName("My Savings")
        .accountType(Account.AccountType.SAVINGS)
        .status(Account.AccountStatus.ACTIVE)
        .balance(new BigDecimal("500.00"))
        .availableBalance(new BigDecimal("500.00"))
        .currency("USD")
        .build();

    when(accountRepository.findByAccountNumber(any(String.class))).thenReturn(Optional.empty());
    when(accountRepository.save(any(Account.class))).thenReturn(savedAccount);

    AccountResponse result = accountService.createAccount(request);

    assertNotNull(result);
    assertNotNull(result.getId());
    assertEquals("customer123", result.getCustomerId());
    assertEquals(Account.AccountStatus.ACTIVE, result.getStatus());
    verify(accountRepository, times(1)).save(any(Account.class));
  }
}
