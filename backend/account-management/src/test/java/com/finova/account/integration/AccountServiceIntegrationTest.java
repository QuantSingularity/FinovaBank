package com.finova.account.integration;

import static org.junit.jupiter.api.Assertions.*;

import com.finova.account.dto.AccountCreateRequest;
import com.finova.account.dto.AccountResponse;
import com.finova.account.model.Account;
import com.finova.account.service.AccountService;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
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
public class AccountServiceIntegrationTest {

  @LocalServerPort private int port;

  @Autowired private AccountService accountService;

  @Test
  public void testCreateAndGetAccount() {
    AccountCreateRequest request = new AccountCreateRequest();
    request.setCustomerId("customer123");
    request.setAccountName("Test Account");
    request.setAccountType(Account.AccountType.CHECKING);
    request.setCurrency("USD");
    request.setInitialDeposit(new BigDecimal("1000.00"));

    AccountResponse savedAccount = accountService.createAccount(request);

    assertNotNull(savedAccount.getId());
    assertNotNull(savedAccount.getAccountNumber());
    assertEquals("customer123", savedAccount.getCustomerId());

    AccountResponse retrievedAccount = accountService.getAccountById(savedAccount.getId());

    assertEquals(savedAccount.getId(), retrievedAccount.getId());
    assertEquals("customer123", retrievedAccount.getCustomerId());
    assertEquals(0, new BigDecimal("1000.00").compareTo(retrievedAccount.getBalance()));
  }
}
