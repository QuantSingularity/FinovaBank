-- V1__Initial_Schema.sql
-- Loan Management Service Initial Schema

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS loans (
    id            BIGSERIAL       PRIMARY KEY,
    loan_number   VARCHAR(20)     NOT NULL UNIQUE,
    customer_id   VARCHAR(36)     NOT NULL,
    amount        DECIMAL(19, 4)  NOT NULL CHECK (amount > 0),
    interest_rate DECIMAL(5, 2)   NOT NULL CHECK (interest_rate >= 0 AND interest_rate <= 100),
    term_months   INTEGER         NOT NULL CHECK (term_months > 0),
    status        VARCHAR(15)     NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'ACTIVE', 'PAID_OFF', 'DEFAULTED', 'REJECTED')),
    purpose       VARCHAR(100),
    created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_loans_customer_id ON loans(customer_id);
CREATE INDEX idx_loans_status      ON loans(status);
CREATE INDEX idx_loans_created_at  ON loans(created_at);

CREATE TRIGGER trg_loans_updated_at
    BEFORE UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS loan_payments (
    id                    BIGSERIAL       PRIMARY KEY,
    loan_id               BIGINT          NOT NULL REFERENCES loans(id) ON DELETE RESTRICT,
    payment_amount        DECIMAL(19, 4)  NOT NULL CHECK (payment_amount > 0),
    payment_date          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_method        VARCHAR(20)     NOT NULL CHECK (payment_method IN ('BANK_TRANSFER', 'DIRECT_DEBIT', 'CARD', 'CHECK')),
    status                VARCHAR(10)     NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED')),
    transaction_reference VARCHAR(36)
);

CREATE INDEX idx_loan_payments_loan_id     ON loan_payments(loan_id);
CREATE INDEX idx_loan_payments_status      ON loan_payments(status);
CREATE INDEX idx_loan_payments_payment_date ON loan_payments(payment_date);
