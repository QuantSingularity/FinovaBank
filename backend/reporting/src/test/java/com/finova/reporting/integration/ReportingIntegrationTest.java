package com.finova.reporting.integration;

import static org.junit.jupiter.api.Assertions.*;

import com.finova.reporting.model.Report;
import com.finova.reporting.service.ReportService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestPropertySource(
    properties = {
      "eureka.client.enabled=false",
      "eureka.client.register-with-eureka=false",
      "eureka.client.fetch-registry=false",
      "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,"
          + "org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration,"
          + "org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration"
    })
public class ReportingIntegrationTest {

  @LocalServerPort private int port;

  @Autowired private ReportService reportService;

  @Test
  public void testCreateAndGetReport() {
    Report report = new Report();
    report.setReportType("ACCOUNT_SUMMARY");
    report.setCustomerId("customer123");
    report.setDetails("Test report details");

    Report saved = reportService.createReport(report);

    assertNotNull(saved.getId());
    assertEquals(Report.ReportStatus.COMPLETED, saved.getStatus());

    Report retrieved = reportService.getReportById(saved.getId());

    assertNotNull(retrieved);
    assertEquals(saved.getId(), retrieved.getId());
    assertEquals("ACCOUNT_SUMMARY", retrieved.getReportType());
    assertEquals("customer123", retrieved.getCustomerId());
  }

  @Test
  public void testGetAllReports() {
    Report r1 = new Report();
    r1.setReportType("TYPE_X");
    r1.setCustomerId("cx1");
    reportService.createReport(r1);

    assertNotNull(reportService.getAllReports());
    assertFalse(reportService.getAllReports().isEmpty());
  }
}
