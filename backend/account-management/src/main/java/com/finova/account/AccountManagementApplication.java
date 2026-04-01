package com.finova.account;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class AccountManagementApplication {

  public static void main(String[] args) {
    SpringApplication.run(AccountManagementApplication.class, args);
  }
}
