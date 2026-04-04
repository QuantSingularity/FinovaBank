-- V1__Initial_Schema.sql
-- Reporting Service Initial Schema

CREATE TABLE IF NOT EXISTS reports (
    id           BIGSERIAL    PRIMARY KEY,
    report_id    VARCHAR(36)  NOT NULL UNIQUE,
    report_type  VARCHAR(30)  NOT NULL CHECK (report_type IN ('MONTHLY_STATEMENT', 'ANNUAL_SUMMARY', 'TRANSACTION_HISTORY', 'RISK_REPORT', 'COMPLIANCE_REPORT')),
    generated_by VARCHAR(50)  NOT NULL,
    parameters   JSONB,
    status       VARCHAR(10)  NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED')),
    storage_path VARCHAR(500),
    generated_at TIMESTAMP,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_type       ON reports(report_type);
CREATE INDEX idx_reports_status     ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at);

CREATE TABLE IF NOT EXISTS scheduled_reports (
    id           BIGSERIAL    PRIMARY KEY,
    report_type  VARCHAR(30)  NOT NULL,
    cron_expr    VARCHAR(50)  NOT NULL,
    recipients   JSONB        NOT NULL,
    enabled      BOOLEAN      NOT NULL DEFAULT TRUE,
    last_run_at  TIMESTAMP,
    next_run_at  TIMESTAMP    NOT NULL
);
