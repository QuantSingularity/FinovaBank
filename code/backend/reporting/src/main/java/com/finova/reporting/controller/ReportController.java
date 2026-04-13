package com.finova.reporting.controller;

import com.finova.reporting.model.Report;
import com.finova.reporting.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Reporting", description = "Reporting management endpoints")
public class ReportController {

  private final ReportService reportService;

  @GetMapping("/{id}")
  @Operation(summary = "Get report by ID")
  public ResponseEntity<Report> getReportById(@PathVariable Long id) {
    log.debug("Fetching report with ID: {}", id);
    Report report = reportService.getReportById(id);
    if (report == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(report);
  }

  @GetMapping
  @Operation(summary = "Get all reports")
  public ResponseEntity<List<Report>> getAllReports() {
    log.debug("Fetching all reports");
    return ResponseEntity.ok(reportService.getAllReports());
  }

  @PostMapping
  @Operation(summary = "Create a new report")
  public ResponseEntity<Report> createReport(@Valid @RequestBody Report report) {
    log.info("Creating report of type: {}", report.getReportType());
    Report created = reportService.createReport(report);
    log.info("Report created with ID: {}", created.getId());
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }
}
