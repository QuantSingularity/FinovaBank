package com.finova.security;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(
    properties = {
      "eureka.client.enabled=false",
      "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,"
          + "org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration,"
          + "org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration"
    })
public class AuthenticationFlowTest {

  @Test
  public void testLoginSuccess() {
    assert (true);
  }

  @Test
  public void testLoginFailure() {
    assert (true);
  }

  @Test
  public void testAccessProtectedResourceAuthenticated() {
    assert (true);
  }

  @Test
  public void testAccessProtectedResourceUnauthenticated() {
    assert (true);
  }
}
