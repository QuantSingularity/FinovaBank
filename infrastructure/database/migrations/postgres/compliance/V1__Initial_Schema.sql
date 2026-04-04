-- V1__Initial_Schema.sql
-- Compliance Service Initial Schema

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS compliance_checks (
    id               BIGSERIAL    PRIMARY KEY,
    check_id         VARCHAR(36)  NOT NULL UNIQUE,
    customer_id      VARCHAR(36)  NOT NULL,
    check_type       VARCHAR(30)  NOT NULL CHECK (check_type IN ('KYC', 'AML', 'SANCTIONS', 'PEP', 'FRAUD')),
    status           VARCHAR(15)  NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PASSED', 'FAILED', 'REVIEW_REQUIRED', 'EXPIRED')),
    result_details   JSONB,
    checked_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at       TIMESTAMP,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_compliance_checks_customer_id ON compliance_checks(customer_id);
CREATE INDEX idx_compliance_checks_type        ON compliance_checks(check_type);
CREATE INDEX idx_compliance_checks_status      ON compliance_checks(status);
CREATE INDEX idx_compliance_checks_checked_at  ON compliance_checks(checked_at);

CREATE TRIGGER trg_compliance_checks_updated_at
    BEFORE UPDATE ON compliance_checks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS suspicious_activity_reports (
    id           BIGSERIAL    PRIMARY KEY,
    sar_id       VARCHAR(36)  NOT NULL UNIQUE,
    customer_id  VARCHAR(36)  NOT NULL,
    reported_by  VARCHAR(50)  NOT NULL,
    description  TEXT         NOT NULL,
    amount       DECIMAL(19, 4),
    filed_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status       VARCHAR(15)  NOT NULL DEFAULT 'FILED' CHECK (status IN ('FILED', 'UNDER_REVIEW', 'RESOLVED', 'ESCALATED'))
);

CREATE INDEX idx_sar_customer_id ON suspicious_activity_reports(customer_id);
CREATE INDEX idx_sar_filed_at    ON suspicious_activity_reports(filed_at);
