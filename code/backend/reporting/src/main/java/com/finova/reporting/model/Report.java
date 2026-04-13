package com.finova.reporting.model;

import java.time.LocalDateTime;
import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "report",
    indexes = {
      @Index(name = "idx_report_account_id", columnList = "account_id"),
      @Index(name = "idx_report_type", columnList = "report_type"),
      @Index(name = "idx_report_generated_at", columnList = "generated_at")
    })
public class Report {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "account_id")
  private Long accountId;

  @Column(name = "customer_id", length = 50)
  private String customerId;

  @Column(name = "report_type", length = 50, nullable = false)
  @NotBlank(message = "Report type is required")
  private String reportType;

  @Column(columnDefinition = "TEXT")
  private String details;

  @Enumerated(EnumType.STRING)
  @Column(length = 20, nullable = false)
  @Builder.Default
  private ReportStatus status = ReportStatus.PENDING;

  @Column(name = "file_path", length = 255)
  private String filePath;

  @CreationTimestamp
  @Column(name = "generated_at", nullable = false, updatable = false)
  private LocalDateTime generatedAt;

  @Column(name = "requested_by", length = 50)
  private String requestedBy;

  @Version
  private Long version;

  public enum ReportStatus {
    PENDING,
    COMPLETED,
    FAILED
  }
}
