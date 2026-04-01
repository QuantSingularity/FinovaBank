package com.finova.apigateway.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
public class SecurityConfig {

  @Bean
  public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
    http.csrf()
        .disable()
        .httpBasic()
        .disable()
        .formLogin()
        .disable()
        .authorizeExchange(
            exchanges ->
                exchanges
                    .pathMatchers(
                        "/",
                        "/actuator/**",
                        "/api/auth/login",
                        "/api/auth/register",
                        "/api/auth/validate",
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/webjars/**")
                    .permitAll()
                    .anyExchange()
                    .permitAll());
    return http.build();
  }
}
