package com.finova.auth.repository;

import com.finova.auth.model.User;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

  Optional<User> findByUsername(String username);

  Optional<User> findByEmail(String email);

  boolean existsByUsername(String username);

  boolean existsByEmail(String email);

  @Modifying
  @Transactional
  @Query("UPDATE User u SET u.failedLoginAttempts = :attempts WHERE u.username = :username")
  void updateFailedLoginAttempts(
      @Param("username") String username, @Param("attempts") Integer attempts);

  @Modifying
  @Transactional
  @Query("UPDATE User u SET u.lastLoginAt = :loginTime WHERE u.username = :username")
  void updateLastLoginTime(
      @Param("username") String username, @Param("loginTime") LocalDateTime loginTime);

  @Modifying
  @Transactional
  @Query("UPDATE User u SET u.accountNonLocked = :locked WHERE u.username = :username")
  void updateAccountLockStatus(@Param("username") String username, @Param("locked") Boolean locked);
}
