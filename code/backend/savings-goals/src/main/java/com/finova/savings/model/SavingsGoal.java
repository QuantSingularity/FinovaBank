package com.finova.savings.model;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    name = "savings_goal",
    indexes = {
      @Index(name = "idx_sg_customer_id", columnList = "customer_id"),
      @Index(name = "idx_sg_account_id", columnList = "account_id"),
      @Index(name = "idx_sg_status", columnList = "status")
    })
public class SavingsGoal {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "account_id")
  private Long accountId;

  @Column(name = "goal_name", nullable = false, length = 100)
  @NotBlank(message = "Goal name is required")
  private String goalName;

  @Column(name = "target_amount", precision = 19, scale = 2, nullable = false)
  @NotNull(message = "Target amount is required")
  @DecimalMin(value = "0.01", message = "Target amount must be positive")
  private BigDecimal targetAmount;

  @Column(name = "current_amount", precision = 19, scale = 2, nullable = false)
  @Builder.Default
  private BigDecimal currentAmount = BigDecimal.ZERO;

  @Column(name = "target_date")
  private LocalDate targetDate;

  @Column(name = "customer_id", nullable = false, length = 50)
  @NotBlank(message = "Customer ID is required")
  private String customerId;

  @Enumerated(EnumType.STRING)
  @Column(length = 20, nullable = false)
  @Builder.Default
  private GoalStatus status = GoalStatus.IN_PROGRESS;

  @Column(length = 255)
  private String description;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Version
  private Long version;

  public enum GoalStatus {
    IN_PROGRESS,
    COMPLETED,
    CANCELLED,
    PAUSED
  }
}
