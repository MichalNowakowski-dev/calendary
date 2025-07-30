# Database Migration for Customer Management System

## Issue

The customer management system requires database schema updates that haven't been applied yet. The error `"Could not find the 'company_id' column of 'customers' in the schema cache"` indicates that the database schema needs to be updated.

## Solution

### Option 1: Run Migration in Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the Migration**
   - Copy the contents of `database_migration.sql`
   - Paste it into the SQL Editor
   - Execute the migration

3. **Verify the Changes**
   - Go to the Table Editor
   - Check that the `customers` table now has a `company_id` column
   - Check that the `appointments` table now has a `customer_id` column

### Option 2: Run Migration via Supabase CLI

If you have Supabase CLI installed:

```bash
# Apply the migration
supabase db push

# Or run the SQL directly
supabase db reset
```

### Option 3: Manual Migration Steps

If you prefer to run the migration step by step:

```sql
-- Step 1: Add company_id to customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- Step 2: Add customer_id to appointments table
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);

-- Step 4: Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
```

## What the Migration Does

1. **Adds `company_id` column** to the `customers` table
   - Links customers to specific companies
   - Enables proper data isolation

2. **Adds `customer_id` column** to the `appointments` table
   - Links appointments to customers
   - Enables customer history tracking

3. **Creates indexes** for better performance
   - Faster queries on company_id and email
   - Better appointment lookups

4. **Enables Row Level Security (RLS)**
   - Ensures users can only see customers from their company
   - Provides proper data access controls

## After Migration

Once the migration is complete:

1. **Test the Customer Management System**
   - Go to `/dashboard/customers`
   - Verify the page loads without errors
   - Test creating a new customer

2. **Test the Booking System**
   - Make a test booking
   - Verify customers are created automatically
   - Check that customer data is properly linked

3. **Verify Data Isolation**
   - Create test data for multiple companies
   - Ensure users only see customers from their company

## Troubleshooting

### If you get permission errors:

- Make sure you're using the correct database role
- Check that you have the necessary permissions

### If the migration fails:

- Check if the columns already exist
- Verify that the referenced tables exist
- Ensure you have the correct database connection

### If RLS policies fail:

- Make sure the `company_users` table exists
- Verify that the auth system is properly configured

## Next Steps

After successful migration:

1. **Test the complete customer management system**
2. **Proceed with Phase 1.2: Business Settings**
3. **Implement additional security measures**

The customer management system should work properly once the database schema is updated.
