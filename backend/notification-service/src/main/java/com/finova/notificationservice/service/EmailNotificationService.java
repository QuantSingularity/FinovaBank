package com.finova.notificationservice.service;

import com.finova.notificationservice.model.NotificationRequest;
import javax.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@ConditionalOnBean(JavaMailSender.class)
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService implements NotificationService {

  private final JavaMailSender mailSender;
  private final TemplateEngine templateEngine;

  @Value("${spring.mail.from:noreply@finovabank.com}")
  private String fromAddress;

  @Override
  public void sendNotification(NotificationRequest notificationRequest) {
    if (notificationRequest == null || notificationRequest.getRecipientEmail() == null) {
      log.warn("Cannot send notification: request or recipient email is null");
      return;
    }

    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setFrom(fromAddress);
      helper.setTo(notificationRequest.getRecipientEmail());
      helper.setSubject(notificationRequest.getSubject());

      Context context = new Context();
      if (notificationRequest.getProperties() != null) {
        context.setVariables(notificationRequest.getProperties());
      }

      String htmlContent;
      try {
        htmlContent = templateEngine.process("email-template", context);
      } catch (Exception e) {
        log.warn("Could not process email template, falling back to plain message: {}", e.getMessage());
        htmlContent = notificationRequest.getMessage() != null
            ? "<html><body>" + notificationRequest.getMessage() + "</body></html>"
            : "<html><body>Notification from FinovaBank</body></html>";
      }

      helper.setText(htmlContent, true);

      mailSender.send(message);
      log.info("Email notification sent to: {}", notificationRequest.getRecipientEmail());

    } catch (MailException e) {
      log.error("Failed to send email to {}: {}", notificationRequest.getRecipientEmail(), e.getMessage(), e);
      throw new RuntimeException("Failed to send email notification", e);
    } catch (javax.mail.MessagingException e) {
      log.error("Messaging error sending email to {}: {}", notificationRequest.getRecipientEmail(), e.getMessage(), e);
      throw new RuntimeException("Failed to construct email message", e);
    }
  }
}
