package com.finova.apigateway.security;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

public class JwtUtilTest {

  @InjectMocks private JwtUtil jwtUtil;

  private UserDetails userDetails;
  private static final String SECRET_KEY =
      "test_secret_key_for_jwt_token_generation_and_validation";

  @BeforeEach
  public void setup() throws Exception {
    MockitoAnnotations.openMocks(this);
    ReflectionTestUtils.setField(jwtUtil, "SECRET_KEY", SECRET_KEY);
    jwtUtil.init();

    userDetails = mock(UserDetails.class);
    when(userDetails.getUsername()).thenReturn("test@example.com");
  }

  @Test
  public void testGenerateToken() {
    String token = jwtUtil.generateToken(userDetails);
    assertNotNull(token);
    assertTrue(token.length() > 0);
  }

  @Test
  public void testGenerateTokenFromString() {
    String token = jwtUtil.generateToken("user@example.com");
    assertNotNull(token);
    assertTrue(token.length() > 0);
  }

  @Test
  public void testExtractUsername() {
    String token = jwtUtil.generateToken(userDetails);
    String username = jwtUtil.extractUsername(token);
    assertEquals("test@example.com", username);
  }

  @Test
  public void testValidateToken_ValidToken() {
    String token = jwtUtil.generateToken(userDetails);
    boolean isValid = jwtUtil.validateToken(token);
    assertTrue(isValid);
  }

  @Test
  public void testValidateToken_ExpiredToken() throws Exception {
    ReflectionTestUtils.setField(jwtUtil, "JWT_TOKEN_VALIDITY", 1L);
    String token = jwtUtil.generateToken(userDetails);
    Thread.sleep(10);
    boolean isValid = jwtUtil.validateToken(token);
    assertFalse(isValid);
  }

  @Test
  public void testValidateToken_InvalidToken() {
    boolean isValid = jwtUtil.validateToken("this.is.not.a.valid.token");
    assertFalse(isValid);
  }

  @Test
  public void testIsTokenExpired_ValidToken() {
    String token = jwtUtil.generateToken(userDetails);
    assertFalse(jwtUtil.isTokenExpired(token));
  }
}
