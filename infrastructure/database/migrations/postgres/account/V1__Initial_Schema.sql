-- V1__Initial_Schema.sql
-- Account Management Service Initial Schema

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS accounts (
    id            BIGSERIAL PRIMARY KEY,
    account_number VARCHAR(20)     NOT NULL UNIQUE,
    customer_id   VARCHAR(36)      NOT NULL,
    balance       DECIMAL(19, 4)   NOT NULL DEFAULT 0 CHECK (balance >= 0),
    account_type  VARCHAR(20)      NOT NULL CHECK (account_type IN ('CHECKING', 'SAVINGS', 'LOAN', 'INVESTMENT')),
    status        VARCHAR(10)      NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'FROZEN', 'CLOSED')),
    created_at    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_accounts_customer_id    ON accounts(customer_id);
CREATE INDEX idx_accounts_account_number ON accounts(account_number);
CREATE INDEX idx_accounts_status         ON accounts(status);

CREATE TRIGGER trg_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit trail for account changes
CREATE TABLE IF NOT EXISTS account_audit (
    id          BIGSERIAL PRIMARY KEY,
    account_id  BIGINT      NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    action      VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_value   JSONB,
    new_value   JSONB,
    changed_by  VARCHAR(50) NOT NULL,
    changed_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_account_audit_account_id ON account_audit(account_id);
CREATE INDEX idx_account_audit_changed_at ON account_audit(changed_at);
