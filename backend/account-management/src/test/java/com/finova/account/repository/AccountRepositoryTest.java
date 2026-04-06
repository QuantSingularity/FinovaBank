package com.finova.account.repository;

import static org.junit.jupiter.api.Assertions.*;

import com.finova.account.AccountManagementApplication;
import com.finova.account.model.Account;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ContextConfiguration;

@DataJpaTest
@ContextConfiguration(classes = AccountManagementApplication.class)
public class AccountRepositoryTest {

  @Autowired private AccountRepository accountRepository;

  @Test
  public void testSaveAndFindAccount() {
    Account account = Account.builder()
        .accountNumber("TEST123456")
        .balance(new BigDecimal("1000.00"))
        .availableBalance(new BigDecimal("1000.00"))
        .customerId("customer123")
        .accountName("Test Account")
        .accountType(Account.AccountType.CHECKING)
        .status(Account.AccountStatus.ACTIVE)
        .currency("USD")
        .build();

    Account savedAccount = accountRepository.save(account);

    assertNotNull(savedAccount.getId());

    Optional<Account> foundAccount = accountRepository.findById(savedAccount.getId());

    assertTrue(foundAccount.isPresent());
    assertEquals("TEST123456", foundAccount.get().getAccountNumber());
    assertEquals(0, new BigDecimal("1000.00").compareTo(foundAccount.get().getBalance()));
    assertEquals("customer123", foundAccount.get().getCustomerId());
  }

  @Test
  public void testFindByCustomerId() {
    Account account1 = Account.builder()
        .accountNumber("ACC1")
        .balance(new BigDecimal("1000.00"))
        .availableBalance(new BigDecimal("1000.00"))
        .customerId("customer123")
        .accountName("Account 1")
        .accountType(Account.AccountType.CHECKING)
        .status(Account.AccountStatus.ACTIVE)
        .currency("USD")
        .build();

    Account account2 = Account.builder()
        .accountNumber("ACC2")
        .balance(new BigDecimal("2000.00"))
        .availableBalance(new BigDecimal("2000.00"))
        .customerId("customer123")
        .accountName("Account 2")
        .accountType(Account.AccountType.SAVINGS)
        .status(Account.AccountStatus.ACTIVE)
        .currency("USD")
        .build();

    Account account3 = Account.builder()
        .accountNumber("ACC3")
        .balance(new BigDecimal("3000.00"))
        .availableBalance(new BigDecimal("3000.00"))
        .customerId("customer456")
        .accountName("Account 3")
        .accountType(Account.AccountType.SAVINGS)
        .status(Account.AccountStatus.ACTIVE)
        .currency("USD")
        .build();

    accountRepository.save(account1);
    accountRepository.save(account2);
    accountRepository.save(account3);

    List<Account> customerAccounts = accountRepository.findByCustomerId("customer123");

    assertEquals(2, customerAccounts.size());
    assertTrue(customerAccounts.stream().anyMatch(a -> a.getAccountNumber().equals("ACC1")));
    assertTrue(customerAccounts.stream().anyMatch(a -> a.getAccountNumber().equals("ACC2")));
  }
}
