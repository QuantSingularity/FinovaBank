package com.finova.transaction.integration;

import static org.junit.jupiter.api.Assertions.*;

import com.finova.transaction.model.Transaction;
import com.finova.transaction.service.TransactionService;
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
public class TransactionServiceIntegrationTest {

  @LocalServerPort private int port;

  @Autowired private TransactionService transactionService;

  @Test
  public void testCreateAndGetTransaction() {
    Transaction transaction = new Transaction();
    transaction.setAccountId(1L);
    transaction.setAmount(new BigDecimal("250.00"));
    transaction.setType("CREDIT");
    transaction.setDescription("Test deposit");

    Transaction saved = transactionService.createTransaction(transaction);

    assertNotNull(saved.getId());
    assertNotNull(saved.getReferenceNumber());
    assertEquals(Transaction.TransactionStatus.COMPLETED, saved.getStatus());

    Transaction retrieved = transactionService.getTransactionById(saved.getId());

    assertNotNull(retrieved);
    assertEquals(saved.getId(), retrieved.getId());
    assertEquals(0, new BigDecimal("250.00").compareTo(retrieved.getAmount()));
  }

  @Test
  public void testGetAllTransactions() {
    Transaction tx = new Transaction();
    tx.setAccountId(2L);
    tx.setAmount(new BigDecimal("100.00"));
    tx.setType("DEBIT");
    transactionService.createTransaction(tx);

    assertNotNull(transactionService.getAllTransactions());
    assertFalse(transactionService.getAllTransactions().isEmpty());
  }
}
