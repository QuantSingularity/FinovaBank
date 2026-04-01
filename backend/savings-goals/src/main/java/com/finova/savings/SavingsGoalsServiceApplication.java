package com.finova.savings;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class SavingsGoalsServiceApplication {

  public static void main(String[] args) {
    SpringApplication.run(SavingsGoalsServiceApplication.class, args);
  }
}
