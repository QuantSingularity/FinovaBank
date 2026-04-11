package com.finova.transaction.service;

import com.finova.transaction.model.Transaction;
import java.util.List;

public interface TransactionService {
  Transaction getTransactionById(Long id);

  List<Transaction> getAllTransactions();

  Transaction createTransaction(Transaction transaction);
}
