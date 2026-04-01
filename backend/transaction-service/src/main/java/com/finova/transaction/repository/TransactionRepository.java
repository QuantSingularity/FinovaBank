package com.finova.transaction.repository;

import com.finova.transaction.model.Transaction;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

  List<Transaction> findByAccountId(Long accountId);

  Optional<Transaction> findByReferenceNumber(String referenceNumber);

  List<Transaction> findByAccountIdAndType(Long accountId, String type);

  List<Transaction> findByStatus(Transaction.TransactionStatus status);
}
