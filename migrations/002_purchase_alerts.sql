-- Extends the existing payment outbox; no onboarding/profile database.
ALTER TABLE payment_outbox ADD COLUMN alert_lease_until timestamptz;
ALTER TABLE payment_outbox ADD COLUMN alert_lease_id text;
ALTER TABLE payment_outbox ADD COLUMN alert_attempts integer NOT NULL DEFAULT 0;
ALTER TABLE payment_outbox ADD COLUMN alert_next_attempt timestamptz;
ALTER TABLE payment_outbox ADD COLUMN alert_delivered_via text;
