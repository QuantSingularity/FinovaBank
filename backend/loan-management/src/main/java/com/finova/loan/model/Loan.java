package com.finova.loan.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import javax.persistence.*;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "loan",
    indexes = {
      @Index(name = "idx_loan_customer_id", columnList = "customerId"),
      @Index(name = "idx_loan_account_id", columnList = "accountId"),
      @Index(name = "idx_loan_number", columnList = "loanNumber", unique = true),
      @Index(name = "idx_loan_status", columnList = "status")
    })
public class Loan {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "loan_number", unique = true, length = 30)
  private String loanNumber;

  @Column(name = "account_id")
  private Long accountId;

  @Column(name = "customer_id", nullable = false, length = 50)
  @NotBlank(message = "Customer ID is required")
  private String customerId;

  @Column(precision = 19, scale = 2, nullable = false)
  @NotNull(message = "Amount is required")
  @DecimalMin(value = "0.01", message = "Loan amount must be positive")
  private BigDecimal amount;

  @Column(name = "interest_rate", precision = 5, scale = 4)
  private BigDecimal interestRate;

  @Column(name = "term_months")
  private Integer termMonths;

  @Column(name = "monthly_payment", precision = 19, scale = 2)
  private BigDecimal monthlyPayment;

  @Column(name = "remaining_balance", precision = 19, scale = 2)
  private BigDecimal remainingBalance;

  @Column(name = "start_date")
  private LocalDateTime startDate;

  @Column(name = "end_date")
  private LocalDateTime endDate;

  @Enumerated(EnumType.STRING)
  @Column(length = 30, nullable = false)
  @Builder.Default
  private LoanStatus status = LoanStatus.PENDING;

  @Column(length = 255)
  private String purpose;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Version
  private Long version;

  public enum LoanStatus {
    PENDING,
    APPROVED,
    ACTIVE,
    PAID_OFF,
    DEFAULTED,
    REJECTED,
    CANCELLED
  }
}
