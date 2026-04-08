package com.finova.account.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import javax.persistence.*;
import javax.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(
    name = "accounts",
    indexes = {
      @Index(name = "idx_account_number", columnList = "accountNumber", unique = true),
      @Index(name = "idx_customer_id", columnList = "customerId"),
      @Index(name = "idx_account_type", columnList = "accountType"),
      @Index(name = "idx_status", columnList = "status")
    })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Account {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "account_number", unique = true, nullable = false, length = 20)
  @NotBlank(message = "Account number is required")
  private String accountNumber;

  @Column(name = "customer_id", nullable = false, length = 50)
  @NotBlank(message = "Customer ID is required")
  private String customerId;

  @Column(name = "account_name", nullable = false, length = 100)
  @NotBlank(message = "Account name is required")
  @Size(max = 100, message = "Account name must not exceed 100 characters")
  private String accountName;

  @Enumerated(EnumType.STRING)
  @Column(name = "account_type", nullable = false)
  @NotNull(message = "Account type is required")
  private AccountType accountType;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  @NotNull(message = "Account status is required")
  @Builder.Default
  private AccountStatus status = AccountStatus.ACTIVE;

  @Column(precision = 19, scale = 2, nullable = false)
  @NotNull(message = "Balance is required")
  @DecimalMin(value = "0.0", message = "Balance cannot be negative")
  @Builder.Default
  private BigDecimal balance = BigDecimal.ZERO;

  @Column(name = "available_balance", precision = 19, scale = 2, nullable = false)
  @NotNull(message = "Available balance is required")
  @DecimalMin(value = "0.0", message = "Available balance cannot be negative")
  @Builder.Default
  private BigDecimal availableBalance = BigDecimal.ZERO;

  @Column(name = "overdraft_limit", precision = 19, scale = 2)
  @DecimalMin(value = "0.0", message = "Overdraft limit cannot be negative")
  @Builder.Default
  private BigDecimal overdraftLimit = BigDecimal.ZERO;

  @Column(name = "minimum_balance", precision = 19, scale = 2)
  @DecimalMin(value = "0.0", message = "Minimum balance cannot be negative")
  @Builder.Default
  private BigDecimal minimumBalance = BigDecimal.ZERO;

  @Column(name = "interest_rate", precision = 5, scale = 4)
  @DecimalMin(value = "0.0", message = "Interest rate cannot be negative")
  @DecimalMax(value = "100.0", message = "Interest rate cannot exceed 100%")
  @Builder.Default
  private BigDecimal interestRate = BigDecimal.ZERO;

  @Column(length = 3, nullable = false)
  @NotBlank(message = "Currency is required")
  @Size(min = 3, max = 3, message = "Currency must be 3 characters")
  @Builder.Default
  private String currency = "USD";

  @Column(name = "branch_code", length = 10)
  private String branchCode;

  @Column(name = "routing_number", length = 20)
  private String routingNumber;

  @Column(name = "iban", length = 34)
  private String iban;

  @Column(name = "swift_code", length = 11)
  private String swiftCode;

  @Column(name = "is_frozen")
  @Builder.Default
  private Boolean isFrozen = false;

  @Column(name = "freeze_reason", length = 255)
  private String freezeReason;

  @Column(name = "frozen_at")
  private LocalDateTime frozenAt;

  @Column(name = "frozen_by", length = 50)
  private String frozenBy;

  @Column(name = "last_transaction_date")
  private LocalDateTime lastTransactionDate;

  @Column(name = "last_statement_date")
  private LocalDateTime lastStatementDate;

  @Column(name = "next_statement_date")
  private LocalDateTime nextStatementDate;

  @Column(name = "maturity_date")
  private LocalDateTime maturityDate;

  @Column(name = "opened_by", length = 50)
  private String openedBy;

  @Column(name = "closed_at")
  private LocalDateTime closedAt;

  @Column(name = "closed_by", length = 50)
  private String closedBy;

  @Column(name = "closure_reason", length = 255)
  private String closureReason;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  // Audit fields
  @Column(name = "created_by", length = 50)
  private String createdBy;

  @Column(name = "updated_by", length = 50)
  private String updatedBy;

  @Version private Long version;

  public enum AccountType {
    CHECKING("Checking Account"),
    SAVINGS("Savings Account"),
    MONEY_MARKET("Money Market Account"),
    CERTIFICATE_OF_DEPOSIT("Certificate of Deposit"),
    BUSINESS_CHECKING("Business Checking Account"),
    BUSINESS_SAVINGS("Business Savings Account"),
    LOAN("Loan Account"),
    CREDIT_CARD("Credit Card Account"),
    INVESTMENT("Investment Account");

    private final String displayName;

    AccountType(String displayName) {
      this.displayName = displayName;
    }

    public String getDisplayName() {
      return displayName;
    }
  }

  public enum AccountStatus {
    ACTIVE("Active"),
    INACTIVE("Inactive"),
    SUSPENDED("Suspended"),
    CLOSED("Closed"),
    PENDING_APPROVAL("Pending Approval"),
    PENDING_CLOSURE("Pending Closure"),
    FROZEN("Frozen"),
    DORMANT("Dormant");

    private final String displayName;

    AccountStatus(String displayName) {
      this.displayName = displayName;
    }

    public String getDisplayName() {
      return displayName;
    }
  }

  // Business methods
  public boolean canDebit(BigDecimal amount) {
    if (Boolean.TRUE.equals(isFrozen) || status != AccountStatus.ACTIVE) {
      return false;
    }
    BigDecimal totalAvailable = availableBalance.add(overdraftLimit);
    return amount.compareTo(totalAvailable) <= 0;
  }

  public boolean canCredit() {
    return !Boolean.TRUE.equals(isFrozen)
        && (status == AccountStatus.ACTIVE || status == AccountStatus.DORMANT);
  }

  public void freeze(String reason, String frozenBy) {
    this.isFrozen = true;
    this.freezeReason = reason;
    this.frozenAt = LocalDateTime.now();
    this.frozenBy = frozenBy;
  }

  public void unfreeze() {
    this.isFrozen = false;
    this.freezeReason = null;
    this.frozenAt = null;
    this.frozenBy = null;
  }
}
