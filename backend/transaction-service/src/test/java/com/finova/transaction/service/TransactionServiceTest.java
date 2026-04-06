package com.finova.transaction.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.finova.transaction.model.Transaction;
import com.finova.transaction.repository.TransactionRepository;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class TransactionServiceTest {

  @Mock
  private TransactionRepository transactionRepository;

  @InjectMocks
  private TransactionServiceImpl transactionService;

  @Test
  public void testGetTransactionsByAccountId() {
    Transaction tx = new Transaction();
    tx.setId(1L);
    tx.setAccountId(10L);
    tx.setAmount(new BigDecimal("100.00"));
    tx.setType("CREDIT");

    when(transactionRepository.findById(1L)).thenReturn(Optional.of(tx));

    Transaction result = transactionService.getTransactionById(1L);

    assertNotNull(result);
    assertEquals(1L, result.getId());
    assertEquals(10L, result.getAccountId());
    verify(transactionRepository, times(1)).findById(1L);
  }

  @Test
  public void testCreateTransaction() {
    Transaction tx = new Transaction();
    tx.setAccountId(10L);
    tx.setAmount(new BigDecimal("200.00"));
    tx.setType("DEBIT");

    Transaction saved = new Transaction();
    saved.setId(1L);
    saved.setAccountId(10L);
    saved.setAmount(new BigDecimal("200.00"));
    saved.setType("DEBIT");
    saved.setStatus(Transaction.TransactionStatus.COMPLETED);

    when(transactionRepository.save(any(Transaction.class))).thenReturn(saved);

    Transaction result = transactionService.createTransaction(tx);

    assertNotNull(result);
    assertNotNull(result.getId());
    assertEquals(Transaction.TransactionStatus.COMPLETED, result.getStatus());
    verify(transactionRepository, times(1)).save(any(Transaction.class));
  }

  @Test
  public void testGetAllTransactions() {
    Transaction tx1 = new Transaction();
    tx1.setId(1L);
    tx1.setAccountId(1L);
    tx1.setAmount(new BigDecimal("100.00"));
    tx1.setType("CREDIT");

    Transaction tx2 = new Transaction();
    tx2.setId(2L);
    tx2.setAccountId(2L);
    tx2.setAmount(new BigDecimal("200.00"));
    tx2.setType("DEBIT");

    when(transactionRepository.findAll()).thenReturn(Arrays.asList(tx1, tx2));

    List<Transaction> results = transactionService.getAllTransactions();

    assertNotNull(results);
    assertEquals(2, results.size());
    verify(transactionRepository, times(1)).findAll();
  }
}
