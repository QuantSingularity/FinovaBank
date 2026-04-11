package com.finova.auth.config;

import com.finova.auth.model.Role;
import com.finova.auth.model.User;
import com.finova.auth.repository.RoleRepository;
import com.finova.auth.repository.UserRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

  private final RoleRepository roleRepository;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  @Override
  public void run(String... args) {
    initializeRoles();
    initializeAdminUser();
  }

  private void initializeRoles() {
    for (Role.RoleName roleName : Role.RoleName.values()) {
      if (!roleRepository.existsByName(roleName)) {
        Role role =
            Role.builder().name(roleName).description(getDescriptionForRole(roleName)).build();
        roleRepository.save(role);
        log.info("Created role: {}", roleName);
      }
    }
  }

  private void initializeAdminUser() {
    if (!userRepository.existsByUsername("admin")) {
      Role adminRole =
          roleRepository
              .findByName(Role.RoleName.ROLE_ADMIN)
              .orElseThrow(() -> new RuntimeException("Admin role not found"));

      User admin =
          User.builder()
              .username("admin")
              .email("admin@finovabank.com")
              .password(passwordEncoder.encode("Admin@123"))
              .firstName("System")
              .lastName("Administrator")
              .phoneNumber("+1234567890")
              .passwordChangedAt(LocalDateTime.now())
              .build();

      admin.getRoles().add(adminRole);
      userRepository.save(admin);
      log.info("Created admin user");
    }
  }

  private String getDescriptionForRole(Role.RoleName roleName) {
    switch (roleName) {
      case ROLE_CUSTOMER:
        return "Regular bank customer with basic access";
      case ROLE_EMPLOYEE:
        return "Bank employee with operational access";
      case ROLE_MANAGER:
        return "Bank manager with supervisory access";
      case ROLE_ADMIN:
        return "System administrator with full access";
      case ROLE_COMPLIANCE_OFFICER:
        return "Compliance officer with regulatory access";
      case ROLE_RISK_ANALYST:
        return "Risk analyst with risk assessment access";
      case ROLE_AUDITOR:
        return "Auditor with audit and review access";
      default:
        return "Role description not available";
    }
  }
}
