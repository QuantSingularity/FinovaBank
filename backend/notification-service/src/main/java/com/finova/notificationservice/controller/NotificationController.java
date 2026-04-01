package com.finova.notificationservice.controller;

import com.finova.notificationservice.model.NotificationRequest;
import com.finova.notificationservice.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notifications", description = "Notification management endpoints")
public class NotificationController {

  private final NotificationService notificationService;

  @PostMapping("/send")
  @Operation(summary = "Send a notification", description = "Send an email notification")
  public ResponseEntity<Void> sendNotification(@Valid @RequestBody NotificationRequest request) {
    log.info("Sending notification to: {}", request.getRecipientEmail());
    notificationService.sendNotification(request);
    log.info("Notification sent successfully to: {}", request.getRecipientEmail());
    return ResponseEntity.ok().build();
  }
}
