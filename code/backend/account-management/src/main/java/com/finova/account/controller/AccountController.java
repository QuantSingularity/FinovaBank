package com.finova.account.controller;

import com.finova.account.dto.AccountCreateRequest;
import com.finova.account.dto.AccountResponse;
import com.finova.account.dto.AccountUpdateRequest;
import com.finova.account.dto.BalanceUpdateRequest;
import com.finova.account.model.Account;
import com.finova.account.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.math.BigDecimal;
import java.util.List;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Validated
@Slf4j
@Tag(name = "Account Management", description = "Account management operations")
public class AccountController {

  private final AccountService accountService;

  // --- Common Role Definitions for Readability ---
  private static final String ROLE_EMPLOYEE_MANAGER_ADMIN =
      "hasRole('EMPLOYEE') or hasRole('MANAGER') or hasRole('ADMIN')";
  private static final String ROLE_ALL_USERS =
      "hasRole('CUSTOMER') or " + ROLE_EMPLOYEE_MANAGER_ADMIN;
  private static final String ROLE_MANAGER_ADMIN_COMPLIANCE =
      "hasRole('MANAGER') or hasRole('ADMIN') or hasRole('COMPLIANCE_OFFICER')";
  private static final String ROLE_MANAGER_ADMIN =
      "hasRole('MANAGER') or hasRole('ADMIN')";


  // ----------------------------------------------------------------------------------
  // 1. Account Creation
  // ----------------------------------------------------------------------------------

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED) // Use @ResponseStatus for cleaner 201 response
  @Operation(summary = "Create new account", description = "Create a new bank account")
  @PreAuthorize(ROLE_EMPLOYEE_MANAGER_ADMIN)
  public AccountResponse createAccount(@Valid @RequestBody AccountCreateRequest request) {
    log.info("Creating account for customer: {}", request.getCustomerId());
    AccountResponse response = accountService.createAccount(request);
    log.info("Account created successfully with ID: {}", response.getId());
    return response;
  }

  // ----------------------------------------------------------------------------------
  // 2. Account Retrieval
  // ----------------------------------------------------------------------------------

  @GetMapping("/{id}")
  @Operation(summary = "Get account by ID", description = "Retrieve account details by account ID")
  @PreAuthorize(ROLE_ALL_USERS)
  public ResponseEntity<AccountResponse> getAccountById(@PathVariable Long id) {
    log.debug("Retrieving account with ID: {}", id);
    AccountResponse response = accountService.getAccountById(id);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/number/{accountNumber}")
  @Operation(
      summary = "Get account by account number",
      description = "Retrieve account details by account number")
  @PreAuthorize(ROLE_EMPLOYEE_MANAGER_ADMIN)
  public ResponseEntity<AccountResponse> getAccountByNumber(
      @PathVariable @NotBlank String accountNumber) {
    log.debug("Retrieving account with number: {}", accountNumber);
    AccountResponse response = accountService.getAccountByNumber(accountNumber);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/customer/{customerId}")
  @Operation(
      summary = "Get accounts by customer ID",
      description = "Retrieve all accounts for a specific customer")
  @PreAuthorize(ROLE_ALL_USERS)
  public ResponseEntity<List<AccountResponse>> getAccountsByCustomerId(
      @PathVariable @NotBlank String customerId) {
    log.debug("Retrieving accounts for customer: {}", customerId);
    List<AccountResponse> responses = accountService.getAccountsByCustomerId(customerId);
    return ResponseEntity.ok(responses);
  }

  @GetMapping
  @Operation(summary = "Get all accounts", description = "Retrieve all accounts with pagination")
  @PreAuthorize(ROLE_EMPLOYEE_MANAGER_ADMIN)
  public ResponseEntity<Page<AccountResponse>> getAllAccounts(
      @Parameter(description = "Pagination information") Pageable pageable,
      @RequestParam(required = false) Account.AccountType accountType,
      @RequestParam(required = false) Account.AccountStatus status) {
    log.debug("Retrieving all accounts with pagination");
    Page<AccountResponse> responses = accountService.getAllAccounts(pageable, accountType, status);
    return ResponseEntity.ok(responses);
  }

  // ----------------------------------------------------------------------------------
  // 3. Balance Retrieval
  // ----------------------------------------------------------------------------------

  @GetMapping("/{id}/balance")
  @Operation(summary = "Get account balance", description = "Get current account balance")
  @PreAuthorize(ROLE_ALL_USERS)
  public ResponseEntity<BigDecimal> getAccountBalance(@PathVariable Long id) {
    log.debug("Retrieving balance for account ID: {}", id);
    BigDecimal balance = accountService.getAccountBalance(id);
    return ResponseEntity.ok(balance);
  }

  @GetMapping("/{id}/available-balance")
  @Operation(summary = "Get available balance", description = "Get available account balance")
  @PreAuthorize(ROLE_ALL_USERS)
  public ResponseEntity<BigDecimal> getAvailableBalance(@PathVariable Long id) {
    log.debug("Retrieving available balance for account ID: {}", id);
    BigDecimal availableBalance = accountService.getAvailableBalance(id);
    return ResponseEntity.ok(availableBalance);
  }

  // ----------------------------------------------------------------------------------
  // 4. Account Updates (General and Balance)
  // ----------------------------------------------------------------------------------

  @PutMapping("/{id}")
  @Operation(summary = "Update account", description = "Update account details")
  @PreAuthorize(ROLE_EMPLOYEE_MANAGER_ADMIN)
  public ResponseEntity<AccountResponse> updateAccount(
      @PathVariable Long id, @Valid @RequestBody AccountUpdateRequest request) {
    log.info("Updating account with ID: {}", id);
    AccountResponse response = accountService.updateAccount(id, request);
    log.info("Account updated successfully: {}", id);
    return ResponseEntity.ok(response);
  }

  @PatchMapping("/{id}/balance")
  @Operation(
      summary = "Update account balance",
      description = "Update account balance (credit/debit)")
  @PreAuthorize(ROLE_EMPLOYEE_MANAGER_ADMIN)
  public ResponseEntity<AccountResponse> updateBalance(
      @PathVariable Long id, @Valid @RequestBody BalanceUpdateRequest request) {
    log.info(
        "Updating balance for account ID: {}, amount: {}, type: {}",
        id,
        request.getAmount(),
        request.getTransactionType());
    AccountResponse response = accountService.updateBalance(id, request);
    log.info("Balance updated successfully for account: {}", id);
    return ResponseEntity.ok(response);
  }

  // ----------------------------------------------------------------------------------
  // 5. Account Status Management (Freeze/Unfreeze/Status)
  // ----------------------------------------------------------------------------------

  @PatchMapping("/{id}/freeze")
  @Operation(summary = "Freeze account", description = "Freeze an account")
  @PreAuthorize(ROLE_MANAGER_ADMIN_COMPLIANCE)
  public ResponseEntity<AccountResponse> freezeAccount(
      @PathVariable Long id, @RequestParam @NotBlank String reason) {
    log.warn("Freezing account ID: {} for reason: {}", id, reason);
    AccountResponse response = accountService.freezeAccount(id, reason);
    log.warn("Account frozen successfully: {}", id);
    return ResponseEntity.ok(response);
  }

  @PatchMapping("/{id}/unfreeze")
  @Operation(summary = "Unfreeze account", description = "Unfreeze an account")
  @PreAuthorize(ROLE_MANAGER_ADMIN_COMPLIANCE)
  public ResponseEntity<AccountResponse> unfreezeAccount(@PathVariable Long id) {
    log.info("Unfreezing account ID: {}", id);
    AccountResponse response = accountService.unfreezeAccount(id);
    log.info("Account unfrozen successfully: {}", id);
    return ResponseEntity.ok(response);
  }

  @PatchMapping("/{id}/status")
  @Operation(summary = "Update account status", description = "Update account status")
  @PreAuthorize(ROLE_MANAGER_ADMIN)
  public ResponseEntity<AccountResponse> updateAccountStatus(
      @PathVariable Long id,
      @RequestParam Account.AccountStatus status,
      @RequestParam(required = false) String reason) {
    log.info("Updating status for account ID: {} to: {}", id, status);
    AccountResponse response = accountService.updateAccountStatus(id, status, reason);
    log.info("Account status updated successfully: {}", id);
    return ResponseEntity.ok(response);
  }

  // ----------------------------------------------------------------------------------
  // 6. Account Closing
  // ----------------------------------------------------------------------------------

  @DeleteMapping("/{id}")
  @Operation(summary = "Close account", description = "Close an account")
  @PreAuthorize(ROLE_MANAGER_ADMIN)
  public ResponseEntity<Void> closeAccount(
      @PathVariable Long id, @RequestParam(required = false) String reason) {
    log.warn("Closing account ID: {} for reason: {}", id, reason);
    accountService.closeAccount(id, reason);
    log.warn("Account closed successfully: {}", id);
    return ResponseEntity.noContent().build();
  }

  // ----------------------------------------------------------------------------------
  // 7. Transaction Validation
  // ----------------------------------------------------------------------------------

  @PostMapping("/{id}/validate-transaction")
  @Operation(
      summary = "Validate transaction",
      description = "Validate if a transaction can be performed")
  @PreAuthorize(ROLE_EMPLOYEE_MANAGER_ADMIN)
  public ResponseEntity<Boolean> validateTransaction(
      @PathVariable Long id,
      @RequestParam BigDecimal amount,
      @RequestParam String transactionType) {
    log.debug("Validating {} transaction of {} for account ID: {}", transactionType, amount, id);
    boolean isValid = accountService.validateTransaction(id, amount, transactionType);
    return ResponseEntity.ok(isValid);
  }
}