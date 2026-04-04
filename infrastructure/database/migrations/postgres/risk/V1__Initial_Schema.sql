-- V1__Initial_Schema.sql
-- Risk Assessment Service Initial Schema

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS risk_profiles (
    id                   BIGSERIAL    PRIMARY KEY,
    customer_id          VARCHAR(36)  NOT NULL UNIQUE,
    risk_score           INTEGER      NOT NULL CHECK (risk_score BETWEEN 0 AND 1000),
    credit_score         INTEGER      CHECK (credit_score BETWEEN 300 AND 850),
    fraud_likelihood     VARCHAR(10)  NOT NULL DEFAULT 'LOW' CHECK (fraud_likelihood IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    last_assessment_date TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_risk_profiles_customer_id  ON risk_profiles(customer_id);
CREATE INDEX idx_risk_profiles_risk_score   ON risk_profiles(risk_score);
CREATE INDEX idx_risk_profiles_fraud_level  ON risk_profiles(fraud_likelihood);

CREATE TRIGGER trg_risk_profiles_updated_at
    BEFORE UPDATE ON risk_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS risk_assessments (
    id                BIGSERIAL    PRIMARY KEY,
    profile_id        BIGINT       NOT NULL REFERENCES risk_profiles(id) ON DELETE CASCADE,
    previous_score    INTEGER      CHECK (previous_score BETWEEN 0 AND 1000),
    new_score         INTEGER      NOT NULL CHECK (new_score BETWEEN 0 AND 1000),
    assessment_reason TEXT         NOT NULL,
    assessed_by       VARCHAR(50)  NOT NULL,
    assessed_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_risk_assessments_profile_id ON risk_assessments(profile_id);
CREATE INDEX idx_risk_assessments_assessed_at ON risk_assessments(assessed_at);
