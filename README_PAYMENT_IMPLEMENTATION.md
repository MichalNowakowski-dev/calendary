# Payment Status and Payment Method Implementation

## Overview

This implementation adds payment tracking functionality to the Calendary appointment system. When creating reservations, appointments now include payment status and payment method fields.

## Database Changes

### New Fields in `appointments` Table

- `payment_status`: TEXT with values `'pending'`, `'paid'`, `'refunded'`, `'cancelled'`
- `payment_method`: TEXT with values `'on_site'`, `'online'`, `'deposit'`

### Default Values

- New appointments are created with:
  - `payment_status = 'pending'`
  - `payment_method = 'on_site'`

## Implementation Details

### 1. Database Migration

Run the migration script `database_migration_payment_fields.sql` to add the new columns to your database.

### 2. Type Updates

Updated `src/lib/types/database.ts` to include payment fields in the appointments table interface.

### 3. Appointment Creation

Modified appointment creation logic in:

- `src/lib/services/bookings.ts` - `createAppointment` function
- `src/lib/actions/appointments.ts` - `createAppointmentAction`

### 4. UI Components

#### Payment Status Badge (`src/components/services/PaymentStatusBadge.tsx`)

- Displays payment status with appropriate colors and icons
- Status colors: Gray (pending), Green (paid), Blue (refunded), Red (cancelled)

#### Payment Status Button (`src/components/services/PaymentStatusButton.tsx`)

- Allows owners/employees to mark appointments as paid
- Shows loading state during update
- Disabled when already paid

### 5. Dashboard Integration

#### Owner/Employee Dashboard (`src/app/dashboard/appointments/page.tsx`)

- Shows payment status badge for each appointment
- Includes "Mark as Paid" button for pending payments
- Payment status is displayed in the appointment details

#### Customer Dashboard

- Customers can see their payment status in appointment cards
- Payment information is shown in appointment details modal

### 6. Booking Flow Updates

#### Booking Confirmation (`src/components/booking/steps/BookingStepConfirm.tsx`)

- Shows payment information to customers
- Informs customers that payment is "on site"

#### Booking Success Modal (`src/components/booking/BookingSuccessModal.tsx`)

- Displays payment method information
- Confirms "payment on site" to customers

## Usage

### For Business Owners/Employees

1. **View Payment Status**: Payment status is displayed with color-coded badges
2. **Mark as Paid**: Click "Oznacz jako opłacone" button to update payment status
3. **Track Payments**: Monitor which appointments have been paid

### For Customers

1. **Payment Information**: Customers see payment method during booking
2. **Payment Status**: Customers can view their payment status in their dashboard
3. **Payment Confirmation**: Success modal confirms payment will be collected on site

## Payment Status Values

- `pending`: Payment is awaiting collection
- `paid`: Payment has been received
- `refunded`: Payment has been refunded
- `cancelled`: Payment was cancelled

## Payment Method Values

- `on_site`: Payment collected at the business location
- `online`: Payment made online
- `deposit`: Partial payment or deposit made

## Future Enhancements

1. **Online Payment Integration**: Add support for online payment processing
2. **Payment History**: Track payment changes over time
3. **Payment Reports**: Generate payment reports for business owners
4. **Multiple Payment Methods**: Allow customers to choose payment method during booking
5. **Payment Reminders**: Send payment reminders to customers

## Files Modified

- `src/lib/types/database.ts` - Updated appointment types
- `src/lib/services/bookings.ts` - Updated appointment creation
- `src/lib/actions/appointments.ts` - Added payment status update action
- `src/components/services/PaymentStatusBadge.tsx` - New component
- `src/components/services/PaymentStatusButton.tsx` - New component
- `src/app/dashboard/appointments/page.tsx` - Updated dashboard
- `src/components/customer/CustomerAppointmentCard.tsx` - Updated customer view
- `src/components/booking/steps/BookingStepConfirm.tsx` - Updated booking flow
- `src/components/booking/BookingSuccessModal.tsx` - Updated success modal
- `src/lib/types/customer.ts` - Updated customer types
- `database_migration_payment_fields.sql` - Database migration script
