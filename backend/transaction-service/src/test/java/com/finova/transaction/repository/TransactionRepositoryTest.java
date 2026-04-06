package com.finova.transaction.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import com.finova.transaction.model.Transaction;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest
public class TransactionRepositoryTest {

  @Autowired private TestEntityManager entityManager;

  @Autowired private TransactionRepository transactionRepository;

  @Test
  public void whenFindById_thenReturnTransaction() {
    Transaction transaction = new Transaction();
    transaction.setAccountId(1L);
    transaction.setAmount(new BigDecimal("100.00"));
    transaction.setType("CREDIT");
    transaction.setReferenceNumber("TXN-TEST-001");

    entityManager.persist(transaction);
    entityManager.flush();

    Optional<Transaction> found = transactionRepository.findById(transaction.getId());

    assertThat(found).isPresent();
    assertEquals(transaction.getReferenceNumber(), found.get().getReferenceNumber());
    assertEquals(0, new BigDecimal("100.00").compareTo(found.get().getAmount()));
  }

  @Test
  public void testSaveTransaction() {
    Transaction transaction = new Transaction();
    transaction.setAccountId(2L);
    transaction.setAmount(new BigDecimal("250.00"));
    transaction.setType("DEBIT");
    transaction.setReferenceNumber("TXN-TEST-002");

    Transaction saved = transactionRepository.save(transaction);

    assertNotNull(saved.getId());
    assertEquals("TXN-TEST-002", saved.getReferenceNumber());
  }
}
