package com.finova.auth.model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(
    name = "users",
    indexes = {
      @Index(name = "idx_username", columnList = "username"),
      @Index(name = "idx_email", columnList = "email")
    })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false, length = 50)
  private String username;

  @Column(unique = true, nullable = false, length = 100)
  private String email;

  @Column(nullable = false)
  private String password;

  @Column(name = "first_name", nullable = false, length = 50)
  private String firstName;

  @Column(name = "last_name", nullable = false, length = 50)
  private String lastName;

  @Column(name = "phone_number", length = 20)
  private String phoneNumber;

  @Builder.Default private Boolean enabled = true;

  @Builder.Default
  @Column(name = "account_non_expired")
  private Boolean accountNonExpired = true;

  @Builder.Default
  @Column(name = "account_non_locked")
  private Boolean accountNonLocked = true;

  @Builder.Default
  @Column(name = "credentials_non_expired")
  private Boolean credentialsNonExpired = true;

  @Column(name = "failed_login_attempts")
  @Builder.Default
  private Integer failedLoginAttempts = 0;

  @Column(name = "last_login_at")
  private LocalDateTime lastLoginAt;

  @Column(name = "password_changed_at")
  private LocalDateTime passwordChangedAt;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(
      name = "user_roles",
      joinColumns = @JoinColumn(name = "user_id"),
      inverseJoinColumns = @JoinColumn(name = "role_id"))
  @Builder.Default
  private Set<Role> roles = new HashSet<>();

  // MFA related fields
  @Column(name = "mfa_enabled")
  @Builder.Default
  private Boolean mfaEnabled = false;

  @Column(name = "mfa_secret")
  private String mfaSecret;
}
