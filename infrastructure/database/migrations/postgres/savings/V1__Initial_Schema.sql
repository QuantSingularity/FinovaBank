-- V1__Initial_Schema.sql
-- Savings Goals Service Initial Schema

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS savings_goals (
    id              BIGSERIAL       PRIMARY KEY,
    goal_id         VARCHAR(36)     NOT NULL UNIQUE,
    customer_id     VARCHAR(36)     NOT NULL,
    goal_name       VARCHAR(100)    NOT NULL,
    target_amount   DECIMAL(19, 4)  NOT NULL CHECK (target_amount > 0),
    current_amount  DECIMAL(19, 4)  NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    target_date     DATE,
    status          VARCHAR(10)     NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED')),
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_savings_goals_customer_id ON savings_goals(customer_id);
CREATE INDEX idx_savings_goals_status      ON savings_goals(status);

CREATE TRIGGER trg_savings_goals_updated_at
    BEFORE UPDATE ON savings_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS savings_contributions (
    id              BIGSERIAL       PRIMARY KEY,
    goal_id         BIGINT          NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
    amount          DECIMAL(19, 4)  NOT NULL CHECK (amount > 0),
    contributed_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note            VARCHAR(255)
);

CREATE INDEX idx_savings_contributions_goal_id ON savings_contributions(goal_id);
