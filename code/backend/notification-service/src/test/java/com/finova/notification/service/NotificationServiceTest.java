package com.finova.notification.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.finova.notificationservice.model.NotificationRequest;
import com.finova.notificationservice.service.NoOpNotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {

  private final NoOpNotificationService notificationService = new NoOpNotificationService();

  @Test
  public void testSendNotification() {
    NotificationRequest request = NotificationRequest.builder()
        .recipientEmail("test@example.com")
        .recipientName("Test User")
        .subject("Test Subject")
        .message("Test message body")
        .build();

    assertDoesNotThrow(() -> notificationService.sendNotification(request));
  }

  @Test
  public void testSendNotificationWithNullRequest() {
    assertDoesNotThrow(() -> notificationService.sendNotification(null));
  }

  @Test
  public void testSendNotificationWithMinimalFields() {
    NotificationRequest request = NotificationRequest.builder()
        .recipientEmail("user@bank.com")
        .subject("Account Update")
        .build();

    assertDoesNotThrow(() -> notificationService.sendNotification(request));
  }

  @Test
  public void testNotificationRequestBuilder() {
    NotificationRequest request = NotificationRequest.builder()
        .recipientEmail("customer@finova.com")
        .recipientName("Customer Name")
        .subject("Welcome to FinovaBank")
        .message("Your account has been created")
        .actionUrl("https://finova.com/dashboard")
        .actionText("Go to Dashboard")
        .build();

    assertNotNull(request);
    assertEquals("customer@finova.com", request.getRecipientEmail());
    assertEquals("Welcome to FinovaBank", request.getSubject());
    assertEquals("Go to Dashboard", request.getActionText());
  }
}
