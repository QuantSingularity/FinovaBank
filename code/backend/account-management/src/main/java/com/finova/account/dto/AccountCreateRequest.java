package com.finova.account.dto;

import com.finova.account.model.Account;
import java.math.BigDecimal;
import javax.validation.constraints.*;
import lombok.Data;

@Data
public class AccountCreateRequest {

  @NotBlank(message = "Customer ID is required")
  @Size(max = 50, message = "Customer ID must not exceed 50 characters")
  private String customerId;

  @NotBlank(message = "Account name is required")
  @Size(max = 100, message = "Account name must not exceed 100 characters")
  private String accountName;

  @NotNull(message = "Account type is required")
  private Account.AccountType accountType;

  @DecimalMin(value = "0.0", message = "Initial deposit cannot be negative")
  private BigDecimal initialDeposit = BigDecimal.ZERO;

  @DecimalMin(value = "0.0", message = "Overdraft limit cannot be negative")
  private BigDecimal overdraftLimit = BigDecimal.ZERO;

  @DecimalMin(value = "0.0", message = "Minimum balance cannot be negative")
  private BigDecimal minimumBalance = BigDecimal.ZERO;

  @DecimalMin(value = "0.0", message = "Interest rate cannot be negative")
  @DecimalMax(value = "100.0", message = "Interest rate cannot exceed 100%")
  private BigDecimal interestRate = BigDecimal.ZERO;

  @NotBlank(message = "Currency is required")
  @Size(min = 3, max = 3, message = "Currency must be 3 characters")
  private String currency = "USD";

  @Size(max = 10, message = "Branch code must not exceed 10 characters")
  private String branchCode;

  @Size(max = 20, message = "Routing number must not exceed 20 characters")
  private String routingNumber;

  @Size(max = 34, message = "IBAN must not exceed 34 characters")
  private String iban;

  @Size(max = 11, message = "SWIFT code must not exceed 11 characters")
  private String swiftCode;
}
