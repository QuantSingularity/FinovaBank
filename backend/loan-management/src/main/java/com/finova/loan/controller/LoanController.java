package com.finova.loan.controller;

import com.finova.loan.model.Loan;
import com.finova.loan.service.LoanService;
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
@RequestMapping("/api/loans")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Loan Management", description = "Loan management endpoints")
public class LoanController {

  private final LoanService loanService;

  @GetMapping("/{id}")
  @Operation(summary = "Get loan by ID")
  public ResponseEntity<Loan> getLoanById(@PathVariable Long id) {
    log.debug("Fetching loan with ID: {}", id);
    Loan loan = loanService.getLoanById(id);
    if (loan == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(loan);
  }

  @GetMapping
  @Operation(summary = "Get all loans")
  public ResponseEntity<List<Loan>> getAllLoans() {
    log.debug("Fetching all loans");
    return ResponseEntity.ok(loanService.getAllLoans());
  }

  @PostMapping
  @Operation(summary = "Create a new loan")
  public ResponseEntity<Loan> createLoan(@Valid @RequestBody Loan loan) {
    log.info("Creating loan for customer: {}", loan.getCustomerId());
    Loan created = loanService.createLoan(loan);
    log.info("Loan created with ID: {}", created.getId());
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  @PutMapping("/{id}")
  @Operation(summary = "Update a loan")
  public ResponseEntity<Loan> updateLoan(@PathVariable Long id, @Valid @RequestBody Loan loan) {
    log.info("Updating loan with ID: {}", id);
    Loan updated = loanService.updateLoan(id, loan);
    if (updated == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(updated);
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete a loan")
  public ResponseEntity<Void> deleteLoan(@PathVariable Long id) {
    log.info("Deleting loan with ID: {}", id);
    loanService.deleteLoan(id);
    return ResponseEntity.noContent().build();
  }
}
