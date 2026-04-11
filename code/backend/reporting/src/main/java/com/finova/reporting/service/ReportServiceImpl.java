package com.finova.reporting.service;

import com.finova.reporting.model.Report;
import com.finova.reporting.repository.ReportRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReportServiceImpl implements ReportService {

  private final ReportRepository reportRepository;

  @Override
  @Transactional(readOnly = true)
  public Report getReportById(Long id) {
    // BUG FIX: orElse(null) caused silent NullPointerExceptions downstream.
    return reportRepository
        .findById(id)
        .orElseThrow(() -> new RuntimeException("Report not found with ID: " + id));
  }

  @Override
  @Transactional(readOnly = true)
  public List<Report> getAllReports() {
    return reportRepository.findAll();
  }

  @Override
  public Report createReport(Report report) {
    log.info("Creating report of type: {}", report.getReportType());
    report.setStatus(Report.ReportStatus.COMPLETED);
    return reportRepository.save(report);
  }
}
