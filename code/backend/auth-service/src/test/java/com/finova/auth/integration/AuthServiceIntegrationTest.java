package com.finova.auth.integration;

import static org.junit.jupiter.api.Assertions.*;

import com.finova.auth.dto.LoginRequest;
import com.finova.auth.dto.LoginResponse;
import com.finova.auth.dto.RegisterRequest;
import com.finova.auth.dto.UserResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestPropertySource(
    properties = {
      "eureka.client.enabled=false",
      "eureka.client.register-with-eureka=false",
      "eureka.client.fetch-registry=false",
      "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,"
          + "org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration,"
          + "org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration"
    })
public class AuthServiceIntegrationTest {

  @LocalServerPort private int port;

  @Autowired private TestRestTemplate restTemplate;

  @MockBean private RedisTemplate<String, Object> redisTemplate;

  private String baseUrl() {
    return "http://localhost:" + port;
  }

  @Test
  public void testRegisterEndpoint() {
    RegisterRequest request = new RegisterRequest();
    request.setUsername("integrationuser");
    request.setEmail("integration@example.com");
    request.setPassword("Password123!");
    request.setFirstName("Integration");
    request.setLastName("Test");

    ResponseEntity<UserResponse> response =
        restTemplate.postForEntity(
            baseUrl() + "/api/auth/register", request, UserResponse.class);

    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals("integrationuser", response.getBody().getUsername());
  }

  @Test
  public void testLoginEndpoint() {
    RegisterRequest registerRequest = new RegisterRequest();
    registerRequest.setUsername("logintest");
    registerRequest.setEmail("logintest@example.com");
    registerRequest.setPassword("Password123!");
    registerRequest.setFirstName("Login");
    registerRequest.setLastName("Test");
    restTemplate.postForEntity(
        baseUrl() + "/api/auth/register", registerRequest, UserResponse.class);

    LoginRequest loginRequest = new LoginRequest();
    loginRequest.setUsername("logintest");
    loginRequest.setPassword("Password123!");

    ResponseEntity<LoginResponse> response =
        restTemplate.postForEntity(
            baseUrl() + "/api/auth/login", loginRequest, LoginResponse.class);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertNotNull(response.getBody());
    assertNotNull(response.getBody().getAccessToken());
    assertEquals("logintest", response.getBody().getUsername());
  }

  @Test
  public void testValidateTokenEndpoint() {
    RegisterRequest registerRequest = new RegisterRequest();
    registerRequest.setUsername("validatetest");
    registerRequest.setEmail("validatetest@example.com");
    registerRequest.setPassword("Password123!");
    registerRequest.setFirstName("Validate");
    registerRequest.setLastName("Test");
    restTemplate.postForEntity(
        baseUrl() + "/api/auth/register", registerRequest, UserResponse.class);

    LoginRequest loginRequest = new LoginRequest();
    loginRequest.setUsername("validatetest");
    loginRequest.setPassword("Password123!");

    ResponseEntity<LoginResponse> loginResponse =
        restTemplate.postForEntity(
            baseUrl() + "/api/auth/login", loginRequest, LoginResponse.class);

    assertNotNull(loginResponse.getBody());
    String token = loginResponse.getBody().getAccessToken();
    assertNotNull(token);
  }
}
