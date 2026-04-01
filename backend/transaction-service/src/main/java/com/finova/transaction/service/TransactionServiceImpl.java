package com.finova.transaction.service;

import com.finova.transaction.model.Transaction;
import com.finova.transaction.repository.TransactionRepository;
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
    if (transaction.getReferenceNumber() == null || transaction.getReferenceNumber().isBlank()) {
      transaction.setReferenceNumber("TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase());
    }
    transaction.setStatus(Transaction.TransactionStatus.COMPLETED);
    transaction.setProcessedAt(LocalDateTime.now());
    log.info("Creating transaction with reference: {}", transaction.getReferenceNumber());
    return transactionRepository.save(transaction);
  }
}
