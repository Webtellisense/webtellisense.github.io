-- Apply manually to a dedicated test PostgreSQL database; never from a Function invocation.
CREATE TABLE payment_orders (
  reference text PRIMARY KEY,
  request_hash text NOT NULL UNIQUE,
  payload_hash text NOT NULL,
  quote jsonb NOT NULL,
  customer jsonb NOT NULL,
  amount_kobo bigint NOT NULL CHECK (amount_kobo > 0),
  currency text NOT NULL CHECK (currency = 'NGN'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid')),
  authorization_url text,
  transaction_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  CHECK ((status = 'paid') = (transaction_id IS NOT NULL AND paid_at IS NOT NULL))
);
-- Atomic outbox: one durable notification of settlement, including concurrent webhook/callbacks.
-- No automatic fulfillment/email worker is enabled by this change.
CREATE TABLE payment_outbox (
  reference text PRIMARY KEY REFERENCES payment_orders(reference),
  event_type text NOT NULL DEFAULT 'payment.verified',
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);
