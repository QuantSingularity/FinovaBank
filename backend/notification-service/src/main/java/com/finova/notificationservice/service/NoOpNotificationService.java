package com.finova.notificationservice.service;

import com.finova.notificationservice.model.NotificationRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnMissingBean(JavaMailSender.class)
@Slf4j
public class NoOpNotificationService implements NotificationService {

  @Override
  public void sendNotification(NotificationRequest notificationRequest) {
    if (notificationRequest != null) {
      log.info("NoOp notification service: would send email to {} with subject '{}'",
          notificationRequest.getRecipientEmail(), notificationRequest.getSubject());
    }
  }
}
