package com.finova.auth.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import com.finova.auth.dto.LoginRequest;
import com.finova.auth.dto.LoginResponse;
import com.finova.auth.dto.RegisterRequest;
import com.finova.auth.dto.UserResponse;
import com.finova.auth.model.Role;
import com.finova.auth.model.User;
import com.finova.auth.repository.RoleRepository;
import com.finova.auth.repository.UserRepository;
import com.finova.auth.security.JwtTokenProvider;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private RoleRepository roleRepository;
  @Mock private PasswordEncoder passwordEncoder;
  @Mock private AuthenticationManager authenticationManager;
  @Mock private JwtTokenProvider jwtTokenProvider;
  @Mock private RedisTemplate<String, Object> redisTemplate;
  @Mock private ValueOperations<String, Object> valueOperations;

  @InjectMocks private AuthServiceImpl authService;

  @Test
  public void testRegisterSuccess() {
    RegisterRequest request = new RegisterRequest();
    request.setUsername("newuser");
    request.setEmail("newuser@example.com");
    request.setPassword("Password123!");
    request.setFirstName("New");
    request.setLastName("User");

    Role customerRole = new Role();
    customerRole.setId(1L);
    customerRole.setName(Role.RoleName.ROLE_CUSTOMER);

    User savedUser = User.builder()
        .id(1L)
        .username("newuser")
        .email("newuser@example.com")
        .firstName("New")
        .lastName("User")
        .password("encoded_password")
        .roles(new HashSet<>(Set.of(customerRole)))
        .build();

    when(userRepository.existsByUsername("newuser")).thenReturn(false);
    when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
    when(roleRepository.findByName(Role.RoleName.ROLE_CUSTOMER)).thenReturn(Optional.of(customerRole));
    when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
    when(userRepository.save(any(User.class))).thenReturn(savedUser);

    UserResponse result = authService.register(request);

    assertNotNull(result);
    assertEquals("newuser", result.getUsername());
    assertEquals("newuser@example.com", result.getEmail());
    verify(userRepository, times(1)).save(any(User.class));
  }

  @Test
  public void testRegisterUsernameAlreadyExists() {
    RegisterRequest request = new RegisterRequest();
    request.setUsername("existinguser");
    request.setEmail("test@example.com");
    request.setPassword("Password123!");
    request.setFirstName("Test");
    request.setLastName("User");

    when(userRepository.existsByUsername("existinguser")).thenReturn(true);

    assertThrows(IllegalArgumentException.class, () -> authService.register(request));
    verify(userRepository, never()).save(any());
  }

  @Test
  public void testRegisterEmailAlreadyExists() {
    RegisterRequest request = new RegisterRequest();
    request.setUsername("newuser");
    request.setEmail("existing@example.com");
    request.setPassword("Password123!");
    request.setFirstName("Test");
    request.setLastName("User");

    when(userRepository.existsByUsername("newuser")).thenReturn(false);
    when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

    assertThrows(IllegalArgumentException.class, () -> authService.register(request));
    verify(userRepository, never()).save(any());
  }

  @Test
  public void testValidateTokenValid() {
    when(jwtTokenProvider.validateToken("valid_token")).thenReturn(true);
    when(redisTemplate.hasKey(anyString())).thenReturn(false);

    boolean result = authService.validateToken("valid_token");

    assertTrue(result);
  }

  @Test
  public void testValidateTokenNull() {
    boolean result = authService.validateToken(null);
    assertFalse(result);
  }

  @Test
  public void testValidateTokenBlank() {
    boolean result = authService.validateToken("   ");
    assertFalse(result);
  }

  @Test
  public void testValidateTokenBlacklisted() {
    when(jwtTokenProvider.validateToken("blacklisted_token")).thenReturn(true);
    when(redisTemplate.hasKey("blacklist:blacklisted_token")).thenReturn(true);

    boolean result = authService.validateToken("blacklisted_token");

    assertFalse(result);
  }

  @Test
  public void testLogoutNullToken() {
    authService.logout(null);
    verify(redisTemplate, never()).opsForValue();
  }

  @Test
  public void testLogoutBlankToken() {
    authService.logout("   ");
    verify(redisTemplate, never()).opsForValue();
  }
}
