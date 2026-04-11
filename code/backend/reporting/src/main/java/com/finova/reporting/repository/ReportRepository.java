package com.finova.reporting.repository;

import com.finova.reporting.model.Report;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

  List<Report> findByAccountId(Long accountId);

  List<Report> findByReportType(String reportType);

  List<Report> findByCustomerId(String customerId);
}
