package com.finova.transaction.controller;

import com.finova.transaction.model.Transaction;
import com.finova.transaction.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Transaction Service", description = "Transaction management endpoints")
public class TransactionController {

  private final TransactionService transactionService;

  @GetMapping("/{id}")
  @Operation(summary = "Get transaction by ID")
  public ResponseEntity<Transaction> getTransactionById(@PathVariable Long id) {
    log.debug("Fetching transaction with ID: {}", id);
    Transaction transaction = transactionService.getTransactionById(id);
    if (transaction == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(transaction);
  }

  @GetMapping
  @Operation(summary = "Get all transactions")
  public ResponseEntity<List<Transaction>> getAllTransactions() {
    log.debug("Fetching all transactions");
    return ResponseEntity.ok(transactionService.getAllTransactions());
  }

  @PostMapping
  @Operation(summary = "Create a new transaction")
  public ResponseEntity<Transaction> createTransaction(@Valid @RequestBody Transaction transaction) {
    log.info("Creating transaction for account: {}", transaction.getAccountId());
    Transaction created = transactionService.createTransaction(transaction);
    log.info("Transaction created with ID: {}", created.getId());
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }
}
