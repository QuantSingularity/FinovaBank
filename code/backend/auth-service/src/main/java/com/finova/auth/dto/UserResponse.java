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
public class UserResponse {

  private Long id;
  private String username;
  private String email;
  private String firstName;
  private String lastName;
  private String phoneNumber;
  private Set<String> roles;
  private boolean enabled;
  private boolean accountNonExpired;
  private boolean accountNonLocked;
  private boolean credentialsNonExpired;
  private LocalDateTime createdAt;
  private LocalDateTime lastLoginAt;
}
