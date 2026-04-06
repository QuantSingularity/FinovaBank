package com.finova.auth.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.finova.auth.dto.LoginRequest;
import com.finova.auth.dto.LoginResponse;
import com.finova.auth.dto.RegisterRequest;
import com.finova.auth.dto.UserResponse;
import com.finova.auth.repository.UserRepository;
import com.finova.auth.service.AuthService;
import java.time.LocalDateTime;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
@ContextConfiguration(classes = com.finova.auth.AuthServiceApplication.class)
public class AuthControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private AuthService authService;

  @MockBean private UserRepository userRepository;

  private static final ObjectMapper objectMapper = new ObjectMapper();

  static {
    objectMapper.registerModule(new JavaTimeModule());
  }

  private static String asJsonString(final Object obj) {
    try {
      return objectMapper.writeValueAsString(obj);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  @Test
  public void contextLoads() {
    assert (mockMvc != null);
  }

  @Test
  public void testLogin() throws Exception {
    LoginRequest request = new LoginRequest();
    request.setUsername("testuser");
    request.setPassword("Password123!");

    LoginResponse response =
        LoginResponse.builder()
            .accessToken("mock-access-token")
            .refreshToken("mock-refresh-token")
            .expiresIn(3600L)
            .expiresAt(LocalDateTime.now().plusHours(1))
            .username("testuser")
            .roles(Set.of("ROLE_CUSTOMER"))
            .mfaRequired(false)
            .build();

    when(authService.login(any(LoginRequest.class))).thenReturn(response);

    mockMvc
        .perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.accessToken").value("mock-access-token"))
        .andExpect(jsonPath("$.username").value("testuser"));

    verify(authService, times(1)).login(any(LoginRequest.class));
  }

  @Test
  public void testRegister() throws Exception {
    RegisterRequest request = new RegisterRequest();
    request.setUsername("newuser");
    request.setEmail("newuser@example.com");
    request.setPassword("Password123!");
    request.setFirstName("New");
    request.setLastName("User");

    UserResponse response =
        UserResponse.builder()
            .id(1L)
            .username("newuser")
            .email("newuser@example.com")
            .firstName("New")
            .lastName("User")
            .roles(Set.of("ROLE_CUSTOMER"))
            .enabled(true)
            .build();

    when(authService.register(any(RegisterRequest.class))).thenReturn(response);

    mockMvc
        .perform(
            post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.username").value("newuser"))
        .andExpect(jsonPath("$.email").value("newuser@example.com"));

    verify(authService, times(1)).register(any(RegisterRequest.class));
  }

  @Test
  public void testValidateToken() throws Exception {
    when(authService.validateToken("valid-token")).thenReturn(true);

    mockMvc
        .perform(get("/api/auth/validate").header("Authorization", "Bearer valid-token"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").value(true));

    verify(authService, times(1)).validateToken("valid-token");
  }
}
