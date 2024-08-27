CREATE TABLE plans (
  id text PRIMARY KEY,
  product_id text,  -- Keeping the reference to products
  price_id text,  -- Remove the REFERENCES clause here
  active boolean,
  currency text CHECK (char_length(currency) = 3),
  amount bigint,
  interval pricing_plan_interval,
  interval_count integer,
  trial_period_days integer,
  metadata jsonb
);

-- Enable row level security on the plans table
alter table plans enable row level security;

-- Allow public read-only access to the plans table
create policy "Allow public read-only access." on plans for select using (true);
