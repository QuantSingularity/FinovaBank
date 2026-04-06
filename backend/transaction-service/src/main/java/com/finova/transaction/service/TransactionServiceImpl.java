package com.finova.transaction.service;

import com.finova.transaction.model.Transaction;
import com.finova.transaction.repository.TransactionRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TransactionServiceImpl implements TransactionService {

  private final TransactionRepository transactionRepository;

  @Override
  @Transactional(readOnly = true)
  public Transaction getTransactionById(Long id) {
    return transactionRepository.findById(id).orElse(null);
  }

  @Override
  @Transactional(readOnly = true)
  public List<Transaction> getAllTransactions() {
    return transactionRepository.findAll();
  }

  @Override
  public Transaction createTransaction(Transaction transaction) {
    if (transaction.getAccountId() == null) {
      throw new IllegalArgumentException("Account ID is required");
    }
    if (transaction.getAmount() == null || transaction.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
      throw new IllegalArgumentException("Transaction amount must be positive");
    }
    if (transaction.getType() == null || transaction.getType().isBlank()) {
      throw new IllegalArgumentException("Transaction type is required");
    }

    if (transaction.getReferenceNumber() == null || transaction.getReferenceNumber().isBlank()) {
      transaction.setReferenceNumber(
          "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase());
    }

    transaction.setStatus(Transaction.TransactionStatus.COMPLETED);
    transaction.setProcessedAt(LocalDateTime.now());

    log.info(
        "Creating transaction: ref={}, accountId={}, type={}, amount={}",
        transaction.getReferenceNumber(),
        transaction.getAccountId(),
        transaction.getType(),
        transaction.getAmount());

    return transactionRepository.save(transaction);
  }
}
