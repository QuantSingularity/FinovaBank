package com.finova.security.secretmanagement;

import org.springframework.context.annotation.Configuration;
import org.springframework.vault.annotation.VaultPropertySource;

@Configuration
@VaultPropertySource(
    value = "secret/finova",
    renewal = VaultPropertySource.Renewal.RENEW
)
public class VaultConfig {}
