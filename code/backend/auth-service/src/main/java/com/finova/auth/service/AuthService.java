package com.finova.auth.service;

import com.finova.auth.dto.LoginRequest;
import com.finova.auth.dto.LoginResponse;
import com.finova.auth.dto.RegisterRequest;
import com.finova.auth.dto.UserResponse;

public interface AuthService {

  LoginResponse login(LoginRequest request);

  UserResponse register(RegisterRequest request);

  void logout(String token);

  LoginResponse refreshToken(String token);

  boolean validateToken(String token);

  void lockAccount(String username);

  void unlockAccount(String username);
}
