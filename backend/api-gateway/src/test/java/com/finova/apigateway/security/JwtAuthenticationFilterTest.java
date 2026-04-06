package com.finova.apigateway.security;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

public class JwtAuthenticationFilterTest {

  private JwtAuthenticationFilter jwtAuthenticationFilter;

  @Mock private JwtUtil jwtUtil;

  @BeforeEach
  public void setup() {
    MockitoAnnotations.openMocks(this);
    jwtAuthenticationFilter = new JwtAuthenticationFilter();
    org.springframework.test.util.ReflectionTestUtils.setField(
        jwtAuthenticationFilter, "jwtUtil", jwtUtil);
  }

  @Test
  public void testFilter_NoAuthHeader() {
    MockServerHttpRequest request = MockServerHttpRequest.get("/api/test").build();
    MockServerWebExchange exchange = MockServerWebExchange.from(request);
    WebFilterChain chain = ex -> Mono.empty();

    Mono<Void> result = jwtAuthenticationFilter.filter(exchange, chain);

    StepVerifier.create(result).verifyComplete();
    verify(jwtUtil, never()).validateToken(anyString());
  }

  @Test
  public void testFilter_ValidBearerToken() {
    when(jwtUtil.validateToken("valid_token")).thenReturn(true);
    when(jwtUtil.extractUsername("valid_token")).thenReturn("user@example.com");

    MockServerHttpRequest request = MockServerHttpRequest.get("/api/test")
        .header(HttpHeaders.AUTHORIZATION, "Bearer valid_token")
        .build();
    MockServerWebExchange exchange = MockServerWebExchange.from(request);
    WebFilterChain chain = ex -> Mono.empty();

    Mono<Void> result = jwtAuthenticationFilter.filter(exchange, chain);

    StepVerifier.create(result).verifyComplete();
    verify(jwtUtil, times(1)).validateToken("valid_token");
  }

  @Test
  public void testFilter_InvalidToken() {
    when(jwtUtil.validateToken("bad_token")).thenReturn(false);

    MockServerHttpRequest request = MockServerHttpRequest.get("/api/test")
        .header(HttpHeaders.AUTHORIZATION, "Bearer bad_token")
        .build();
    MockServerWebExchange exchange = MockServerWebExchange.from(request);
    WebFilterChain chain = ex -> Mono.empty();

    Mono<Void> result = jwtAuthenticationFilter.filter(exchange, chain);

    StepVerifier.create(result).verifyComplete();
  }

  @Test
  public void testFilter_PublicEndpoint_SkipsValidation() {
    MockServerHttpRequest request = MockServerHttpRequest.get("/api/auth/login").build();
    MockServerWebExchange exchange = MockServerWebExchange.from(request);
    WebFilterChain chain = ex -> Mono.empty();

    Mono<Void> result = jwtAuthenticationFilter.filter(exchange, chain);

    StepVerifier.create(result).verifyComplete();
    verify(jwtUtil, never()).validateToken(anyString());
  }

  @Test
  public void testFilterNotNull() {
    assertNotNull(jwtAuthenticationFilter);
  }
}
