package com.finova.auth.service;

import com.finova.auth.dto.LoginRequest;
import com.finova.auth.dto.LoginResponse;
import com.finova.auth.dto.RegisterRequest;
import com.finova.auth.dto.UserResponse;
import com.finova.auth.model.Role;
import com.finova.auth.model.User;
import com.finova.auth.repository.RoleRepository;
import com.finova.auth.repository.UserRepository;
import com.finova.auth.security.JwtTokenProvider;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(noRollbackFor = {
    BadCredentialsException.class,
    LockedException.class,
    IllegalArgumentException.class
})
public class AuthServiceImpl implements AuthService {

  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;
  private final JwtTokenProvider jwtTokenProvider;
  private final RedisTemplate<String, Object> redisTemplate;

  private static final int MAX_FAILED_ATTEMPTS = 5;
  private static final String BLACKLIST_PREFIX = "blacklist:";

  @Override
  public LoginResponse login(LoginRequest request) {
    User user =
        userRepository
            .findByUsername(request.getUsername())
            .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

    if (Boolean.FALSE.equals(user.getAccountNonLocked())) {
      throw new LockedException("Account is locked due to too many failed login attempts");
    }

    if (Boolean.FALSE.equals(user.getEnabled())) {
      throw new BadCredentialsException("Account is disabled");
    }

    try {
      Authentication authentication =
          authenticationManager.authenticate(
              new UsernamePasswordAuthenticationToken(
                  request.getUsername(), request.getPassword()));

      userRepository.updateFailedLoginAttempts(request.getUsername(), 0);
      userRepository.updateLastLoginTime(request.getUsername(), LocalDateTime.now());

      String accessToken = jwtTokenProvider.generateAccessToken(authentication);
      String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);

      Set<String> roles =
          user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet());

      return LoginResponse.builder()
          .accessToken(accessToken)
          .refreshToken(refreshToken)
          .expiresIn(jwtTokenProvider.getAccessTokenValidityInSeconds())
          .expiresAt(
              LocalDateTime.now().plusSeconds(jwtTokenProvider.getAccessTokenValidityInSeconds()))
          .username(user.getUsername())
          .roles(roles)
          .mfaRequired(Boolean.TRUE.equals(user.getMfaEnabled()))
          .build();

    } catch (AuthenticationException e) {
      handleFailedLogin(request.getUsername());
      throw new BadCredentialsException("Invalid credentials");
    }
  }

  @Override
  public UserResponse register(RegisterRequest request) {
    if (userRepository.existsByUsername(request.getUsername())) {
      throw new IllegalArgumentException("Username already exists");
    }
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new IllegalArgumentException("Email already exists");
    }

    Role customerRole =
        roleRepository
            .findByName(Role.RoleName.ROLE_CUSTOMER)
            .orElseThrow(() -> new RuntimeException("Default role not found"));

    User user =
        User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .phoneNumber(request.getPhoneNumber())
            .passwordChangedAt(LocalDateTime.now())
            .build();

    user.getRoles().add(customerRole);
    user = userRepository.save(user);

    return mapToUserResponse(user);
  }

  @Override
  public void logout(String token) {
    if (token == null || token.isBlank()) {
      return;
    }
    try {
      long expiration = jwtTokenProvider.getExpirationFromToken(token).getTime();
      long currentTime = System.currentTimeMillis();
      long ttl = expiration - currentTime;

      if (ttl > 0) {
        redisTemplate
            .opsForValue()
            .set(BLACKLIST_PREFIX + token, "blacklisted", ttl, TimeUnit.MILLISECONDS);
      }
    } catch (Exception e) {
      log.warn("Could not blacklist token: {}", e.getMessage());
    }
  }

  @Override
  public LoginResponse refreshToken(String token) {
    if (token == null || token.isBlank()) {
      throw new BadCredentialsException("Refresh token is required");
    }
    if (!jwtTokenProvider.validateToken(token) || isTokenBlacklisted(token)) {
      throw new BadCredentialsException("Invalid or expired refresh token");
    }

    String username = jwtTokenProvider.getUsernameFromToken(token);
    User user =
        userRepository
            .findByUsername(username)
            .orElseThrow(() -> new BadCredentialsException("User not found"));

    Authentication authentication =
        new UsernamePasswordAuthenticationToken(
            user.getUsername(),
            null,
            user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toList()));

    String newAccessToken = jwtTokenProvider.generateAccessToken(authentication);
    String newRefreshToken = jwtTokenProvider.generateRefreshToken(authentication);

    logout(token);

    Set<String> roles =
        user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet());

    return LoginResponse.builder()
        .accessToken(newAccessToken)
        .refreshToken(newRefreshToken)
        .expiresIn(jwtTokenProvider.getAccessTokenValidityInSeconds())
        .expiresAt(
            LocalDateTime.now().plusSeconds(jwtTokenProvider.getAccessTokenValidityInSeconds()))
        .username(user.getUsername())
        .roles(roles)
        .mfaRequired(Boolean.TRUE.equals(user.getMfaEnabled()))
        .build();
  }

  @Override
  public boolean validateToken(String token) {
    if (token == null || token.isBlank()) {
      return false;
    }
    return jwtTokenProvider.validateToken(token) && !isTokenBlacklisted(token);
  }

  @Override
  public void lockAccount(String username) {
    userRepository.updateAccountLockStatus(username, false);
    log.warn("Account locked for user: {}", username);
  }

  @Override
  public void unlockAccount(String username) {
    userRepository.updateAccountLockStatus(username, true);
    userRepository.updateFailedLoginAttempts(username, 0);
    log.info("Account unlocked for user: {}", username);
  }

  private void handleFailedLogin(String username) {
    userRepository.findByUsername(username).ifPresent(user -> {
      int failedAttempts = (user.getFailedLoginAttempts() != null ? user.getFailedLoginAttempts() : 0) + 1;
      userRepository.updateFailedLoginAttempts(username, failedAttempts);
      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        lockAccount(username);
        log.warn("Account locked after {} failed attempts for user: {}", failedAttempts, username);
      }
    });
  }

  private boolean isTokenBlacklisted(String token) {
    try {
      return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + token));
    } catch (Exception e) {
      log.warn("Could not check token blacklist: {}", e.getMessage());
      return false;
    }
  }

  private UserResponse mapToUserResponse(User user) {
    Set<String> roles =
        user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet());

    return UserResponse.builder()
        .id(user.getId())
        .username(user.getUsername())
        .email(user.getEmail())
        .firstName(user.getFirstName())
        .lastName(user.getLastName())
        .phoneNumber(user.getPhoneNumber())
        .roles(roles)
        .enabled(Boolean.TRUE.equals(user.getEnabled()))
        .accountNonExpired(Boolean.TRUE.equals(user.getAccountNonExpired()))
        .accountNonLocked(Boolean.TRUE.equals(user.getAccountNonLocked()))
        .credentialsNonExpired(Boolean.TRUE.equals(user.getCredentialsNonExpired()))
        .createdAt(user.getCreatedAt())
        .lastLoginAt(user.getLastLoginAt())
        .build();
  }
}
