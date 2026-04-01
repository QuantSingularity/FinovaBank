package com.finova.reporting.service;

import com.finova.reporting.model.Report;
import java.util.List;

public interface ReportService {

  Report getReportById(Long id);

  List<Report> getAllReports();

  Report createReport(Report report);
}
