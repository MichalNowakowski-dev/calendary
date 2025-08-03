-- Migration: Add payment_status and payment_method to appointments table
-- Date: 2024-01-XX

-- Add payment_status column with default value 'pending'
ALTER TABLE appointments 
ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending' 
CHECK (payment_status IN ('pending', 'paid', 'refunded', 'cancelled'));

-- Add payment_method column with default value 'on_site'
ALTER TABLE appointments 
ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'on_site' 
CHECK (payment_method IN ('on_site', 'online', 'deposit'));

-- Update existing appointments to have default payment values
UPDATE appointments 
SET 
  payment_status = 'pending',
  payment_method = 'on_site'
WHERE payment_status IS NULL OR payment_method IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_payment_status ON appointments(payment_status);
CREATE INDEX IF NOT EXISTS idx_appointments_payment_method ON appointments(payment_method);

-- Add comments for documentation
COMMENT ON COLUMN appointments.payment_status IS 'Status płatności: pending, paid, refunded, cancelled';
COMMENT ON COLUMN appointments.payment_method IS 'Metoda płatności: on_site, online, deposit'; 