-- Subscription Plan System Database Schema
-- Run these SQL commands in your Supabase SQL editor

-- 1. Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    features JSONB DEFAULT '{}',
    max_employees INTEGER,
    max_locations INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create company_subscriptions table
CREATE TABLE IF NOT EXISTS company_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    subscription_plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due')),
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() + INTERVAL '1 month',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id)
);

-- 3. Create plan_modules table (defines which modules are available per plan)
CREATE TABLE IF NOT EXISTS plan_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
    module_name VARCHAR(50) NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(subscription_plan_id, module_name)
);

-- 4. Create company_modules table (for per-company overrides)
CREATE TABLE IF NOT EXISTS company_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    module_name VARCHAR(50) NOT NULL,
    is_enabled BOOLEAN NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, module_name)
);

-- 5. Insert default subscription plans
INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, max_employees, max_locations, features) VALUES
('starter', 'Starter', 'Perfect for small businesses getting started', 29.00, 290.00, 3, 1, '{"support": "email", "storage": "5GB"}'),
('professional', 'Professional', 'Advanced features for growing businesses', 79.00, 790.00, 15, 3, '{"support": "priority", "storage": "25GB", "api_access": true}'),
('enterprise', 'Enterprise', 'Full-featured solution for large organizations', 199.00, 1990.00, null, null, '{"support": "dedicated", "storage": "unlimited", "custom_integrations": true}')
ON CONFLICT (name) DO NOTHING;

-- 6. Insert default modules for each plan
INSERT INTO plan_modules (subscription_plan_id, module_name, is_enabled) VALUES
-- Starter plan modules
((SELECT id FROM subscription_plans WHERE name = 'starter'), 'employee_management', false),
((SELECT id FROM subscription_plans WHERE name = 'starter'), 'employee_schedules', true),
((SELECT id FROM subscription_plans WHERE name = 'starter'), 'online_payments', false),
((SELECT id FROM subscription_plans WHERE name = 'starter'), 'analytics', false),
((SELECT id FROM subscription_plans WHERE name = 'starter'), 'multi_location', false),
((SELECT id FROM subscription_plans WHERE name = 'starter'), 'api_access', false),

-- Professional plan modules
((SELECT id FROM subscription_plans WHERE name = 'professional'), 'employee_management', true),
((SELECT id FROM subscription_plans WHERE name = 'professional'), 'employee_schedules', true),
((SELECT id FROM subscription_plans WHERE name = 'professional'), 'online_payments', true),
((SELECT id FROM subscription_plans WHERE name = 'professional'), 'analytics', true),
((SELECT id FROM subscription_plans WHERE name = 'professional'), 'multi_location', true),
((SELECT id FROM subscription_plans WHERE name = 'professional'), 'api_access', true),

-- Enterprise plan modules
((SELECT id FROM subscription_plans WHERE name = 'enterprise'), 'employee_management', true),
((SELECT id FROM subscription_plans WHERE name = 'enterprise'), 'employee_schedules', true),
((SELECT id FROM subscription_plans WHERE name = 'enterprise'), 'online_payments', true),
((SELECT id FROM subscription_plans WHERE name = 'enterprise'), 'analytics', true),
((SELECT id FROM subscription_plans WHERE name = 'enterprise'), 'multi_location', true),
((SELECT id FROM subscription_plans WHERE name = 'enterprise'), 'api_access', true)
ON CONFLICT (subscription_plan_id, module_name) DO NOTHING;

-- 7. Assign all existing companies to starter plan by default
INSERT INTO company_subscriptions (company_id, subscription_plan_id, status, current_period_end)
SELECT 
    c.id, 
    sp.id,
    'active',
    NOW() + INTERVAL '1 month'
FROM companies c
CROSS JOIN subscription_plans sp
WHERE sp.name = 'starter'
AND NOT EXISTS (
    SELECT 1 FROM company_subscriptions cs WHERE cs.company_id = c.id
);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_company_id ON company_subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_status ON company_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_plan_modules_subscription_plan_id ON plan_modules(subscription_plan_id);
CREATE INDEX IF NOT EXISTS idx_company_modules_company_id ON company_modules(company_id);

-- 9. Create updated_at trigger for company_subscriptions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_subscriptions_updated_at
    BEFORE UPDATE ON company_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_modules_updated_at
    BEFORE UPDATE ON company_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Enable RLS (Row Level Security) if needed
-- ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE company_subscriptions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE plan_modules ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE company_modules ENABLE ROW LEVEL SECURITY;

-- Add RLS policies as needed based on your security requirements