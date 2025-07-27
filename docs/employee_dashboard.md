# Employee Dashboard & Employee Creation Flow

## Employee Dashboard

### Overview

The employee dashboard provides a read-only interface for employees to view their daily appointments and manage their schedule.

### Features

- **Today's Appointments**: View all appointments scheduled for the current day
- **Welcome Section**: Personalized greeting with company information
- **Optional Availability Calendar**: Placeholder for future schedule management features
- **Employee-specific Navigation**: Simplified sidebar with employee-focused options

### Access

- URL: `/dashboard/employee`
- Role required: `employee`
- Automatic redirect for non-employee users

### Components

- `EmployeeDashboardClient.tsx`: Layout component with employee-specific navigation
- `EmployeeDashboardContent.tsx`: Main content component showing appointments
- `page.tsx`: Server component handling data fetching and authentication

## Employee Creation Flow

### New Employee Registration Process

1. **Admin fills form** with employee details:

   - First name
   - Last name
   - Email address
   - Phone number (optional)
   - Visibility settings
   - Assigned services

2. **Backend creates account**:

   - Creates Supabase Auth user with temporary password
   - Sets user metadata (first_name, last_name, role: "employee")
   - Creates employee record in database with new structure
   - Creates company_user relationship
   - Assigns services to employee

3. **Email invitation sent**:

   - Generates invitation email with login credentials
   - Sends email with temporary password
   - Includes login link and instructions

4. **Employee sets password**:
   - Employee receives email with temporary password
   - Employee logs in and changes password
   - Employee can access employee dashboard

### Database Structure

The `employees` table now includes the following fields:

- `id`: Primary key
- `company_id`: Reference to company
- `user_id`: Reference to user (legacy field)
- `name`: Employee full name
- `visible`: Whether employee is visible to customers
- `phone_number`: Employee phone number (nullable)
- `email`: Employee email address (nullable)
- `auth_user_id`: Reference to Supabase Auth user (nullable)
- `created_at`: Timestamp

### Email Service

- **File**: `src/lib/email.ts`
- **Features**:
  - Email template generation
  - Placeholder implementation (logs to console)
  - Ready for integration with real email service

### Backend Actions

- **File**: `src/lib/actions/employees.ts`
- **Functions**:
  - `createEmployee()`: Creates employee with auth account
  - `updateEmployee()`: Updates existing employee
  - `getEmployeesWithServices()`: Fetches employees with service assignments

### Form Updates

- **File**: `src/components/employees/EmployeeForm.tsx`
- **Changes**:
  - Added first name and last name fields
  - Added email field with invitation notice
  - Added phone number field (optional)
  - Updated form data structure
  - Enhanced validation and user experience

## Technical Implementation

### Authentication Flow

1. Employee account created with temporary password
2. Email sent with credentials
3. Employee logs in with temporary password
4. Employee changes password on first login
5. Employee can access `/dashboard/employee`

### Database Changes

- Updated `employees` table with new fields:
  - `phone_number`: string | null
  - `email`: string | null
  - `auth_user_id`: string | null
- Uses existing `company_users` table
- Uses existing `employee_services` table
- Backward compatible with existing data

### Security Considerations

- Temporary passwords are randomly generated
- Email contains sensitive information (temporary password)
- Employee must change password on first login
- Role-based access control enforced
- Phone number and email stored in employee record for easy access

## Future Enhancements

### Email Service Integration

- Replace placeholder with real email service
- Options: SendGrid, Mailgun, AWS SES, Resend
- Add email templates and branding

### Availability Calendar

- Implement employee schedule management
- Allow employees to set availability
- Integration with appointment booking

### Password Reset Flow

- Implement proper password reset functionality
- Add "forgot password" feature
- Secure password reset tokens

### Employee Profile Management

- Allow employees to update their profile
- Profile picture upload
- Contact information management

## Usage Examples

### Creating an Employee

```typescript
// Admin creates employee
const result = await createEmployee({
  first_name: "Jan",
  last_name: "Kowalski",
  email: "jan.kowalski@company.com",
  phone_number: "+48 123 456 789",
  visible: true,
  selectedServices: ["service-1", "service-2"],
  companyId: "company-uuid",
});
```

### Employee Login Flow

1. Employee receives email with credentials
2. Employee visits `/login`
3. Employee enters email and temporary password
4. Employee is redirected to `/dashboard/employee`
5. Employee can view today's appointments

### Database Schema

```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  visible BOOLEAN DEFAULT true,
  phone_number TEXT,
  email TEXT,
  auth_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```
