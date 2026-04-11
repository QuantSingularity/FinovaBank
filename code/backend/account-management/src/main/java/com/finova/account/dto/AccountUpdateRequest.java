package com.finova.account.dto;

import java.math.BigDecimal;
import javax.validation.constraints.DecimalMax;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.Size;
import lombok.Data;

@Data
public class AccountUpdateRequest {

  @Size(max = 100, message = "Account name must not exceed 100 characters")
  private String accountName;

  @DecimalMin(value = "0.0", message = "Overdraft limit cannot be negative")
  private BigDecimal overdraftLimit;

  @DecimalMin(value = "0.0", message = "Minimum balance cannot be negative")
  private BigDecimal minimumBalance;

  @DecimalMin(value = "0.0", message = "Interest rate cannot be negative")
  @DecimalMax(value = "100.0", message = "Interest rate cannot exceed 100%")
  private BigDecimal interestRate;

  @Size(max = 10, message = "Branch code must not exceed 10 characters")
  private String branchCode;

  @Size(max = 20, message = "Routing number must not exceed 20 characters")
  private String routingNumber;

  @Size(max = 34, message = "IBAN must not exceed 34 characters")
  private String iban;

  @Size(max = 11, message = "SWIFT code must not exceed 11 characters")
  private String swiftCode;
}
