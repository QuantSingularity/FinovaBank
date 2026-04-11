package com.finova.account.dto;

import com.finova.account.model.Account;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {

  private Long id;
  private String accountNumber;
  private String customerId;
  private String accountName;
  private Account.AccountType accountType;
  private Account.AccountStatus status;
  private BigDecimal balance;
  private BigDecimal availableBalance;
  private BigDecimal overdraftLimit;
  private BigDecimal minimumBalance;
  private BigDecimal interestRate;
  private String currency;
  private String branchCode;
  private String routingNumber;
  private String iban;
  private String swiftCode;
  private Boolean isFrozen;
  private String freezeReason;
  private LocalDateTime frozenAt;
  private String frozenBy;
  private LocalDateTime lastTransactionDate;
  private LocalDateTime lastStatementDate;
  private LocalDateTime nextStatementDate;
  private LocalDateTime maturityDate;
  private String openedBy;
  private LocalDateTime closedAt;
  private String closedBy;
  private String closureReason;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private String createdBy;
  private String updatedBy;
  private Long version;
}
