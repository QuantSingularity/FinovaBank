package com.finova.auth.repository;

import com.finova.auth.model.Role;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

  Optional<Role> findByName(Role.RoleName name);

  boolean existsByName(Role.RoleName name);
}
