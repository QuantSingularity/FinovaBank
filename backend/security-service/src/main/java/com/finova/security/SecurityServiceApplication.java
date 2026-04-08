package com.finova.security;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication(
    exclude = {
      DataSourceAutoConfiguration.class,
      HibernateJpaAutoConfiguration.class,
      JpaRepositoriesAutoConfiguration.class,
      DataSourceTransactionManagerAutoConfiguration.class
    })
@EnableDiscoveryClient
public class SecurityServiceApplication {

  public static void main(String[] args) {
    SpringApplication.run(SecurityServiceApplication.class, args);
  }
}
