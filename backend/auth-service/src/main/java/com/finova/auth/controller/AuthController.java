package com.finova.auth.controller;

import com.finova.auth.dto.LoginRequest;
import com.finova.auth.dto.LoginResponse;
import com.finova.auth.dto.RegisterRequest;
import com.finova.auth.dto.UserResponse;
import com.finova.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
@Slf4j
@Tag(name = "Authentication", description = "Authentication and authorization endpoints")
public class AuthController {

  private final AuthService authService;

  @PostMapping("/login")
  @Operation(summary = "User login", description = "Authenticate user and return JWT token")
  public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
    log.info("Login attempt for user: {}", request.getUsername());
    LoginResponse response = authService.login(request);
    log.info("Login successful for user: {}", request.getUsername());
    return ResponseEntity.ok(response);
  }

  @PostMapping("/register")
  @Operation(summary = "User registration", description = "Register a new user account")
  public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
    log.info("Registration attempt for user: {}", request.getUsername());
    UserResponse response = authService.register(request);
    log.info("Registration successful for user: {}", request.getUsername());
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @PostMapping("/logout")
  @Operation(summary = "User logout", description = "Invalidate user session")
  public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token) {
    String jwtToken = token.replace("Bearer ", "");
    authService.logout(jwtToken);
    log.info("User logged out successfully");
    return ResponseEntity.ok().build();
  }

  @PostMapping("/refresh")
  @Operation(summary = "Refresh token", description = "Refresh JWT token")
  public ResponseEntity<LoginResponse> refreshToken(@RequestHeader("Authorization") String token) {
    String jwtToken = token.replace("Bearer ", "");
    LoginResponse response = authService.refreshToken(jwtToken);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/validate")
  @Operation(summary = "Validate token", description = "Validate JWT token")
  public ResponseEntity<Boolean> validateToken(@RequestHeader("Authorization") String token) {
    String jwtToken = token.replace("Bearer ", "");
    boolean isValid = authService.validateToken(jwtToken);
    return ResponseEntity.ok(isValid);
  }
}
