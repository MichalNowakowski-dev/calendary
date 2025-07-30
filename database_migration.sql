-- Database Migration for Customer Management System
-- Add missing columns to customers and appointments tables

-- 1. Add company_id column to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- 2. Add customer_id column to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

-- 3. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);

-- 4. Update existing customers to have company_id (if any exist)
-- This will need to be done manually based on your data

-- 5. Enable Row Level Security (RLS) for customers table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for customers table
-- Policy: Users can only see customers from their company
CREATE POLICY "Users can view customers from their company" ON customers
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can insert customers for their company
CREATE POLICY "Users can insert customers for their company" ON customers
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can update customers from their company
CREATE POLICY "Users can update customers from their company" ON customers
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can delete customers from their company
CREATE POLICY "Users can delete customers from their company" ON customers
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid()
        )
    );

-- 7. Update appointments table RLS policies to include customer_id
-- (This assumes RLS is already enabled on appointments table)

-- Policy: Users can view appointments from their company
CREATE POLICY "Users can view appointments from their company" ON appointments
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can insert appointments for their company
CREATE POLICY "Users can insert appointments for their company" ON appointments
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can update appointments from their company
CREATE POLICY "Users can update appointments from their company" ON appointments
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can delete appointments from their company
CREATE POLICY "Users can delete appointments from their company" ON appointments
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid()
        )
    ); 