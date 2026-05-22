-- M07.2b/M07.3/M07.10 QR material tracking support.
-- Intended for PostgreSQL. Adapt naming to the concrete migration runner once the app scaffold exists.

BEGIN;

-- Batch identity on usage enables traceability by physical QR batch, not only material item.
ALTER TABLE material_usage
  ADD COLUMN IF NOT EXISTS batch_id uuid;

CREATE INDEX IF NOT EXISTS idx_material_usage_tenant_batch
  ON material_usage (tenant_id, batch_id);

-- Per-batch scan history for warehouse/owner visibility.
CREATE TABLE IF NOT EXISTS material_batch_scan_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  batch_id uuid NOT NULL,
  user_id uuid NOT NULL,
  spk_id uuid NULL,
  action text NOT NULL CHECK (action IN ('usage_input', 'stock_check')),
  user_agent text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_material_batch_scan_log_tenant_batch
  ON material_batch_scan_log (tenant_id, batch_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_material_batch_scan_log_tenant_user
  ON material_batch_scan_log (tenant_id, user_id, created_at DESC);

COMMIT;
