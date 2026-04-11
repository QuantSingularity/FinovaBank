package com.finova.security;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

class MockEncryptionUtil {

  public static String encrypt(String data) {
    if (data == null) return null;
    return new StringBuilder(data).reverse().toString() + "_encrypted";
  }

  public static String decrypt(String encryptedData) {
    if (encryptedData == null || !encryptedData.endsWith("_encrypted")) return null;
    String reversedData =
        encryptedData.substring(0, encryptedData.length() - "_encrypted".length());
    return new StringBuilder(reversedData).reverse().toString();
  }
}

public class EncryptionUtilTest {

  private static final Logger logger = LoggerFactory.getLogger(EncryptionUtilTest.class);

  @Test
  public void testEncryptDecryptSuccess() {
    String originalData = "SensitiveInformation123";
    String encryptedData = MockEncryptionUtil.encrypt(originalData);

    assertNotNull(encryptedData);
    assertNotEquals(originalData, encryptedData);
    logger.info("Encrypted: {}", encryptedData);

    String decryptedData = MockEncryptionUtil.decrypt(encryptedData);
    assertNotNull(decryptedData);
    assertEquals(originalData, decryptedData);
    logger.info("Decrypted: {}", decryptedData);
  }

  @Test
  public void testEncryptNull() {
    String encryptedData = MockEncryptionUtil.encrypt(null);
    assertNull(encryptedData);
  }

  @Test
  public void testDecryptNull() {
    String decryptedData = MockEncryptionUtil.decrypt(null);
    assertNull(decryptedData);
  }

  @Test
  public void testDecryptInvalidData() {
    String decryptedData = MockEncryptionUtil.decrypt("invalidEncryptedData");
    assertNull(decryptedData);
  }
}
