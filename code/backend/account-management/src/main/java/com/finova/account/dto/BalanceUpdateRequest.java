package com.finova.account.dto;

import java.math.BigDecimal;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import lombok.Data;

@Data
public class BalanceUpdateRequest {

  @NotNull(message = "Amount is required")
  @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
  private BigDecimal amount;

  @NotBlank(message = "Transaction type is required")
  private String transactionType; // CREDIT or DEBIT

  @Size(max = 255, message = "Description must not exceed 255 characters")
  private String description;

  @Size(max = 50, message = "Reference must not exceed 50 characters")
  private String reference;

  @Size(max = 50, message = "Processed by must not exceed 50 characters")
  private String processedBy;
}
