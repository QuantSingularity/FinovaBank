-- V1__Initial_Schema.sql
-- Notification Service Initial Schema

CREATE TABLE IF NOT EXISTS notifications (
    id              BIGSERIAL    PRIMARY KEY,
    notification_id VARCHAR(36)  NOT NULL UNIQUE,
    recipient_id    VARCHAR(36)  NOT NULL,
    channel         VARCHAR(10)  NOT NULL CHECK (channel IN ('EMAIL', 'SMS', 'PUSH', 'IN_APP')),
    template_id     VARCHAR(50)  NOT NULL,
    subject         VARCHAR(255),
    body            TEXT         NOT NULL,
    status          VARCHAR(10)  NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'DELIVERED')),
    retry_count     INTEGER      NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
    sent_at         TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_status       ON notifications(status);
CREATE INDEX idx_notifications_channel      ON notifications(channel);
CREATE INDEX idx_notifications_created_at   ON notifications(created_at);

CREATE TABLE IF NOT EXISTS notification_preferences (
    id              BIGSERIAL    PRIMARY KEY,
    customer_id     VARCHAR(36)  NOT NULL UNIQUE,
    email_enabled   BOOLEAN      NOT NULL DEFAULT TRUE,
    sms_enabled     BOOLEAN      NOT NULL DEFAULT TRUE,
    push_enabled    BOOLEAN      NOT NULL DEFAULT TRUE,
    in_app_enabled  BOOLEAN      NOT NULL DEFAULT TRUE,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_prefs_customer ON notification_preferences(customer_id);
