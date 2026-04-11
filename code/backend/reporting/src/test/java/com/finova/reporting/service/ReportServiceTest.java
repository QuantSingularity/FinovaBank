package com.finova.reporting.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.finova.reporting.model.Report;
import com.finova.reporting.repository.ReportRepository;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class ReportServiceTest {

  @Mock private ReportRepository reportRepository;

  @InjectMocks private ReportServiceImpl reportService;

  @Test
  public void testCreateReport() {
    Report report = new Report();
    report.setReportType("ACCOUNT_SUMMARY");
    report.setCustomerId("customer123");

    Report saved = new Report();
    saved.setId(1L);
    saved.setReportType("ACCOUNT_SUMMARY");
    saved.setCustomerId("customer123");
    saved.setStatus(Report.ReportStatus.COMPLETED);

    when(reportRepository.save(any(Report.class))).thenReturn(saved);

    Report result = reportService.createReport(report);

    assertNotNull(result);
    assertNotNull(result.getId());
    assertEquals(Report.ReportStatus.COMPLETED, result.getStatus());
    assertEquals("ACCOUNT_SUMMARY", result.getReportType());
    verify(reportRepository, times(1)).save(any(Report.class));
  }

  @Test
  public void testGetReportById() {
    Report report = new Report();
    report.setId(1L);
    report.setReportType("TRANSACTION_HISTORY");
    report.setCustomerId("customer456");
    report.setStatus(Report.ReportStatus.COMPLETED);

    when(reportRepository.findById(1L)).thenReturn(Optional.of(report));

    Report result = reportService.getReportById(1L);

    assertNotNull(result);
    assertEquals(1L, result.getId());
    assertEquals("TRANSACTION_HISTORY", result.getReportType());
    verify(reportRepository, times(1)).findById(1L);
  }

  @Test
  public void testGetReportById_NotFound() {
    when(reportRepository.findById(99L)).thenReturn(Optional.empty());

    Report result = reportService.getReportById(99L);

    assertNull(result);
    verify(reportRepository, times(1)).findById(99L);
  }

  @Test
  public void testGetAllReports() {
    Report r1 = new Report();
    r1.setId(1L);
    r1.setReportType("TYPE_A");
    r1.setCustomerId("c1");

    Report r2 = new Report();
    r2.setId(2L);
    r2.setReportType("TYPE_B");
    r2.setCustomerId("c2");

    when(reportRepository.findAll()).thenReturn(Arrays.asList(r1, r2));

    List<Report> results = reportService.getAllReports();

    assertNotNull(results);
    assertEquals(2, results.size());
    verify(reportRepository, times(1)).findAll();
  }
}
