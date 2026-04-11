package com.finova.auth.dto;

import java.time.LocalDateTime;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

  private String accessToken;
  private String refreshToken;
  private String tokenType = "Bearer";
  private Long expiresIn; // in seconds
  private LocalDateTime expiresAt;
  private String username;
  private Set<String> roles;
  private boolean mfaRequired;
}
