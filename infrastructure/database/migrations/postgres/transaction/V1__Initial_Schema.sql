-- V1__Initial_Schema.sql
-- Transaction Service Initial Schema

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS transactions (
    id                     BIGSERIAL PRIMARY KEY,
    transaction_id         VARCHAR(36)    NOT NULL UNIQUE,
    source_account_id      VARCHAR(20)    NOT NULL,
    destination_account_id VARCHAR(20)    NOT NULL,
    amount                 DECIMAL(19, 4) NOT NULL CHECK (amount > 0),
    transaction_type       VARCHAR(20)    NOT NULL CHECK (transaction_type IN ('TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'REFUND')),
    status                 VARCHAR(10)    NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED')),
    description            TEXT,
    created_at             TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_source_account      ON transactions(source_account_id);
CREATE INDEX idx_transactions_destination_account ON transactions(destination_account_id);
CREATE INDEX idx_transactions_status              ON transactions(status);
CREATE INDEX idx_transactions_created_at          ON transactions(created_at);

CREATE TRIGGER trg_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Transaction audit trail
CREATE TABLE IF NOT EXISTS transaction_audit (
    id             BIGSERIAL   PRIMARY KEY,
    transaction_id BIGINT      NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    action         VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_status     VARCHAR(10),
    new_status     VARCHAR(10),
    changed_by     VARCHAR(50) NOT NULL,
    changed_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transaction_audit_transaction_id ON transaction_audit(transaction_id);
