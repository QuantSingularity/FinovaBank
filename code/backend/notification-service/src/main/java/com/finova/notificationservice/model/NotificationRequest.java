package com.finova.notificationservice.model;

import java.util.Map;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {

  @NotBlank(message = "Recipient email is required")
  @Email(message = "Recipient email must be valid")
  private String recipientEmail;

  private String recipientName;

  @NotBlank(message = "Subject is required")
  private String subject;

  private String message;

  private String actionUrl;

  private String actionText;

  private String templateName;

  private Map<String, Object> properties;
}
