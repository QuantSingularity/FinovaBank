package com.finova.transaction.model;

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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "transaction",
    indexes = {
      @Index(name = "idx_tx_account_id", columnList = "accountId"),
      @Index(name = "idx_tx_timestamp", columnList = "timestamp"),
      @Index(name = "idx_tx_reference", columnList = "referenceNumber", unique = true)
    })
public class Transaction {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "account_id", nullable = false)
  @NotNull(message = "Account ID is required")
  private Long accountId;

  @Column(precision = 19, scale = 2, nullable = false)
  @NotNull(message = "Amount is required")
  @DecimalMin(value = "0.01", message = "Amount must be positive")
  private BigDecimal amount;

  @Column(length = 20, nullable = false)
  @NotBlank(message = "Transaction type is required")
  private String type;

  @Enumerated(EnumType.STRING)
  @Column(length = 20, nullable = false)
  @Builder.Default
  private TransactionStatus status = TransactionStatus.PENDING;

  @Column(name = "reference_number", unique = true, length = 50)
  private String referenceNumber;

  @Column(length = 255)
  private String description;

  @Column(name = "source_account_id")
  private Long sourceAccountId;

  @Column(name = "destination_account_id")
  private Long destinationAccountId;

  @Column(length = 3)
  @Builder.Default
  private String currency = "USD";

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime timestamp;

  @Column(name = "processed_at")
  private LocalDateTime processedAt;

  @Column(name = "created_by", length = 50)
  private String createdBy;

  @Version
  private Long version;

  public enum TransactionStatus {
    PENDING,
    COMPLETED,
    FAILED,
    REVERSED,
    CANCELLED
  }
}
