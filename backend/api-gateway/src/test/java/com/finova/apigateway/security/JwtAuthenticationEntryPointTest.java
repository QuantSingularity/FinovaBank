package com.finova.apigateway.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.security.core.AuthenticationException;
import reactor.test.StepVerifier;

public class JwtAuthenticationEntryPointTest {

  @InjectMocks private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

  @BeforeEach
  public void setup() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  public void testCommence() {
    MockServerHttpRequest request = MockServerHttpRequest.get("/api/test").build();
    MockServerWebExchange exchange = MockServerWebExchange.from(request);
    AuthenticationException authException = mock(AuthenticationException.class);

    StepVerifier.create(jwtAuthenticationEntryPoint.commence(exchange, authException))
        .verifyComplete();

    assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    assertEquals(MediaType.APPLICATION_JSON, exchange.getResponse().getHeaders().getContentType());
  }

  @Test
  public void testCommenceReturns401() {
    MockServerHttpRequest request = MockServerHttpRequest.get("/api/secure").build();
    MockServerWebExchange exchange = MockServerWebExchange.from(request);
    AuthenticationException authException = mock(AuthenticationException.class);

    jwtAuthenticationEntryPoint.commence(exchange, authException).block();

    assertEquals(HttpStatus.UNAUTHORIZED.value(), exchange.getResponse().getStatusCode().value());
  }

  @Test
  public void testCommenceSetsJsonContentType() {
    MockServerHttpRequest request = MockServerHttpRequest.get("/api/data").build();
    MockServerWebExchange exchange = MockServerWebExchange.from(request);
    AuthenticationException authException = mock(AuthenticationException.class);

    jwtAuthenticationEntryPoint.commence(exchange, authException).block();

    assertEquals(MediaType.APPLICATION_JSON, exchange.getResponse().getHeaders().getContentType());
  }
}
