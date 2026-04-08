package com.finova.account.service;

import static org.junit.jupiter.api.Assertions.*;

import com.finova.account.dto.AccountCreateRequest;
import com.finova.account.dto.AccountResponse;
import com.finova.account.dto.BalanceUpdateRequest;
import com.finova.account.model.Account;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestPropertySource(
    properties = {
      "eureka.client.enabled=false",
      "eureka.client.register-with-eureka=false",
      "eureka.client.fetch-registry=false",
      "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,"
          + "org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration,"
          + "org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration"
    })
public class AccountServiceFullTest {

  @Autowired private AccountService accountService;

  @Test
  public void testCreateAccountWithBalance() {
    AccountCreateRequest request = new AccountCreateRequest();
    request.setCustomerId("customer-full-001");
    request.setAccountName("Full Test Account");
    request.setAccountType(Account.AccountType.SAVINGS);
    request.setCurrency("USD");
    request.setInitialDeposit(new BigDecimal("2500.00"));

    AccountResponse created = accountService.createAccount(request);

    assertNotNull(created);
    assertNotNull(created.getId());
    assertNotNull(created.getAccountNumber());
    assertEquals("customer-full-001", created.getCustomerId());
    assertEquals(0, new BigDecimal("2500.00").compareTo(created.getBalance()));
    assertEquals(Account.AccountStatus.ACTIVE, created.getStatus());
    assertFalse(Boolean.TRUE.equals(created.getIsFrozen()));
  }

  @Test
  public void testCreditDebitBalance() {
    AccountCreateRequest request = new AccountCreateRequest();
    request.setCustomerId("customer-bd-001");
    request.setAccountName("Balance Test");
    request.setAccountType(Account.AccountType.CHECKING);
    request.setCurrency("USD");
    request.setInitialDeposit(new BigDecimal("1000.00"));

    AccountResponse account = accountService.createAccount(request);
    Long id = account.getId();

    BalanceUpdateRequest credit = new BalanceUpdateRequest();
    credit.setAmount(new BigDecimal("500.00"));
    credit.setTransactionType("CREDIT");
    AccountResponse afterCredit = accountService.updateBalance(id, credit);
    assertEquals(0, new BigDecimal("1500.00").compareTo(afterCredit.getBalance()));

    BalanceUpdateRequest debit = new BalanceUpdateRequest();
    debit.setAmount(new BigDecimal("300.00"));
    debit.setTransactionType("DEBIT");
    AccountResponse afterDebit = accountService.updateBalance(id, debit);
    assertEquals(0, new BigDecimal("1200.00").compareTo(afterDebit.getBalance()));
  }

  @Test
  public void testGetAccountsByCustomerId() {
    String customerId = "customer-list-001";

    AccountCreateRequest r1 = new AccountCreateRequest();
    r1.setCustomerId(customerId);
    r1.setAccountName("Checking");
    r1.setAccountType(Account.AccountType.CHECKING);
    r1.setCurrency("USD");
    r1.setInitialDeposit(BigDecimal.ZERO);
    accountService.createAccount(r1);

    AccountCreateRequest r2 = new AccountCreateRequest();
    r2.setCustomerId(customerId);
    r2.setAccountName("Savings");
    r2.setAccountType(Account.AccountType.SAVINGS);
    r2.setCurrency("USD");
    r2.setInitialDeposit(BigDecimal.ZERO);
    accountService.createAccount(r2);

    List<AccountResponse> accounts = accountService.getAccountsByCustomerId(customerId);
    assertNotNull(accounts);
    assertTrue(accounts.size() >= 2);
  }

  @Test
  public void testFreezeAndUnfreezeAccount() {
    AccountCreateRequest request = new AccountCreateRequest();
    request.setCustomerId("customer-freeze-001");
    request.setAccountName("Freeze Test");
    request.setAccountType(Account.AccountType.CHECKING);
    request.setCurrency("USD");
    request.setInitialDeposit(new BigDecimal("100.00"));

    AccountResponse created = accountService.createAccount(request);
    Long id = created.getId();

    AccountResponse frozen = accountService.freezeAccount(id, "Suspicious activity");
    assertTrue(Boolean.TRUE.equals(frozen.getIsFrozen()));
    assertEquals(Account.AccountStatus.FROZEN, frozen.getStatus());

    AccountResponse unfrozen = accountService.unfreezeAccount(id);
    assertFalse(Boolean.TRUE.equals(unfrozen.getIsFrozen()));
    assertEquals(Account.AccountStatus.ACTIVE, unfrozen.getStatus());
  }
}
