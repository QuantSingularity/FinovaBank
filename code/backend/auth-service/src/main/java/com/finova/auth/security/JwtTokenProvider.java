package com.finova.auth.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.stream.Collectors;
import javax.annotation.PostConstruct;
import javax.crypto.SecretKey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class JwtTokenProvider {

  @Value("${app.jwt.secret:mySecretKey}")
  private String jwtSecret;

  @Value("${app.jwt.access-token-expiration:3600}")
  private long accessTokenValidityInSeconds;

  @Value("${app.jwt.refresh-token-expiration:86400}")
  private long refreshTokenValidityInSeconds;

  private SecretKey key;

  @PostConstruct
  public void init() {
    // Ensure the secret is long enough for HS512 (minimum 512 bits = 64 bytes)
    // Pad the secret if necessary to meet the minimum length requirement
    String paddedSecret = jwtSecret;
    while (paddedSecret.getBytes(StandardCharsets.UTF_8).length < 64) {
      paddedSecret = paddedSecret + paddedSecret;
    }
    this.key = Keys.hmacShaKeyFor(paddedSecret.getBytes(StandardCharsets.UTF_8));
  }

  public String generateAccessToken(Authentication authentication) {
    return generateToken(authentication, accessTokenValidityInSeconds, "access");
  }

  public String generateRefreshToken(Authentication authentication) {
    return generateToken(authentication, refreshTokenValidityInSeconds, "refresh");
  }

  private String generateToken(
      Authentication authentication, long validityInSeconds, String tokenType) {
    String username = authentication.getName();
    String authorities =
        authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.joining(","));

    Date expiryDate = new Date(System.currentTimeMillis() + validityInSeconds * 1000);

    return Jwts.builder()
        .setSubject(username)
        .claim("authorities", authorities)
        .claim("type", tokenType)
        .setIssuedAt(new Date())
        .setExpiration(expiryDate)
        .signWith(key, SignatureAlgorithm.HS512)
        .compact();
  }

  public String getUsernameFromToken(String token) {
    Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();

    return claims.getSubject();
  }

  public Date getExpirationFromToken(String token) {
    Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();

    return claims.getExpiration();
  }

  public boolean validateToken(String token) {
    try {
      Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
      return true;
    } catch (SecurityException ex) {
      log.error("Invalid JWT signature");
    } catch (MalformedJwtException ex) {
      log.error("Invalid JWT token");
    } catch (ExpiredJwtException ex) {
      log.error("Expired JWT token");
    } catch (UnsupportedJwtException ex) {
      log.error("Unsupported JWT token");
    } catch (IllegalArgumentException ex) {
      log.error("JWT claims string is empty");
    }
    return false;
  }

  public long getAccessTokenValidityInSeconds() {
    return accessTokenValidityInSeconds;
  }

  public long getRefreshTokenValidityInSeconds() {
    return refreshTokenValidityInSeconds;
  }
}
