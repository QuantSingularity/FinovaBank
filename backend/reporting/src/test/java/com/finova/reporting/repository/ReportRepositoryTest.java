package com.finova.reporting.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import com.finova.reporting.model.Report;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest
public class ReportRepositoryTest {

  @Autowired private TestEntityManager entityManager;

  @Autowired private ReportRepository reportRepository;

  @Test
  public void testSaveAndFindReport() {
    Report report = new Report();
    report.setReportType("ACCOUNT_SUMMARY");
    report.setCustomerId("customer123");
    report.setStatus(Report.ReportStatus.PENDING);

    Report saved = reportRepository.save(report);

    assertNotNull(saved.getId());
    assertEquals("ACCOUNT_SUMMARY", saved.getReportType());
    assertEquals(Report.ReportStatus.PENDING, saved.getStatus());
  }

  @Test
  public void testFindById() {
    Report report = new Report();
    report.setReportType("LOAN_SUMMARY");
    report.setCustomerId("customer456");
    report.setStatus(Report.ReportStatus.COMPLETED);

    entityManager.persist(report);
    entityManager.flush();

    Optional<Report> found = reportRepository.findById(report.getId());

    assertThat(found).isPresent();
    assertEquals("LOAN_SUMMARY", found.get().getReportType());
    assertEquals(Report.ReportStatus.COMPLETED, found.get().getStatus());
  }

  @Test
  public void testFindByCustomerId() {
    Report r1 = new Report();
    r1.setReportType("TYPE_A");
    r1.setCustomerId("cust-001");
    r1.setStatus(Report.ReportStatus.COMPLETED);

    Report r2 = new Report();
    r2.setReportType("TYPE_B");
    r2.setCustomerId("cust-001");
    r2.setStatus(Report.ReportStatus.PENDING);

    Report r3 = new Report();
    r3.setReportType("TYPE_C");
    r3.setCustomerId("cust-002");
    r3.setStatus(Report.ReportStatus.COMPLETED);

    reportRepository.save(r1);
    reportRepository.save(r2);
    reportRepository.save(r3);

    List<Report> results = reportRepository.findByCustomerId("cust-001");

    assertEquals(2, results.size());
    assertTrue(results.stream().allMatch(r -> "cust-001".equals(r.getCustomerId())));
  }

  @Test
  public void testFindByReportType() {
    Report r1 = new Report();
    r1.setReportType("MONTHLY_STATEMENT");
    r1.setCustomerId("c1");
    r1.setStatus(Report.ReportStatus.COMPLETED);

    Report r2 = new Report();
    r2.setReportType("MONTHLY_STATEMENT");
    r2.setCustomerId("c2");
    r2.setStatus(Report.ReportStatus.COMPLETED);

    reportRepository.save(r1);
    reportRepository.save(r2);

    List<Report> results = reportRepository.findByReportType("MONTHLY_STATEMENT");

    assertFalse(results.isEmpty());
    assertTrue(results.stream().allMatch(r -> "MONTHLY_STATEMENT".equals(r.getReportType())));
  }
}
