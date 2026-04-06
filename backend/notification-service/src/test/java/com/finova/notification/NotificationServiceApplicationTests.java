package com.finova.notification;

import com.finova.notificationservice.NotificationServiceApplication;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(classes = NotificationServiceApplication.class)
@ActiveProfiles("test")
@TestPropertySource(
    properties = {
      "eureka.client.enabled=false",
      "eureka.client.register-with-eureka=false",
      "eureka.client.fetch-registry=false",
      "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,"
          + "org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration,"
          + "org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration,"
          + "org.springframework.boot.autoconfigure.mail.MailSenderAutoConfiguration,"
          + "org.springframework.boot.autoconfigure.mail.MailSenderValidatorAutoConfiguration"
    })
public class NotificationServiceApplicationTests {

  @Test
  public void contextLoads() {
  }
}
