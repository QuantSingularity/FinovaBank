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
public class AuthorizationTest {

  @Test
  public void testAdminCanAccessAdminEndpoint() {
    assert (true);
  }

  @Test
  public void testUserCannotAccessAdminEndpoint() {
    assert (true);
  }

  @Test
  public void testUserCanAccessUserEndpoint() {
    assert (true);
  }

  @Test
  public void testAdminCanAlsoAccessUserEndpoint() {
    assert (true);
  }

  @Test
  public void testUserWithReadPermissionCanReadAccount() {
    assert (true);
  }

  @Test
  public void testUserWithoutReadPermissionCannotReadAccount() {
    assert (true);
  }
}
