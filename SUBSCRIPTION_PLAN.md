# Subscription-Based Module System Implementation Plan

## Overview
Implement a feature flag system tied to subscription plans, with a dedicated admin panel for you to manage subscriptions and enable/disable modules per company.

## Architecture Approach

### 1. Database Schema Extensions
- **New Tables:**
  - `subscription_plans` - Define available plans (Starter, Professional, Enterprise)
  - `company_subscriptions` - Link companies to their current subscription
  - `plan_modules` - Define which modules are available per plan
  - `company_modules` - Override specific module access per company (for custom plans)

### 2. Enhanced Admin Role System
- **Leverage existing `admin` role** as your system administrator role
- **Create dedicated admin routes**: `/admin/*` (separate from company dashboards)
- **Admin capabilities:**
  - Manage all companies and their subscriptions
  - Enable/disable modules per company
  - View system-wide analytics
  - Manage subscription plans

### 3. Module System Implementation
- **Create module definitions:**
  - `employee_management` - Adding/editing employees
  - `employee_schedules` - Schedule management for employees  
  - `online_payments` - Payment processing features
  - `analytics` - Advanced reporting and analytics
  - `multi_location` - Multiple business locations
  - `api_access` - API integrations

### 4. Feature Flag Integration
- **Create PermissionProvider** context to check module access
- **Update existing components** to conditionally render based on permissions
- **Add permission checks** to server actions and API routes
- **Graceful degradation** - show upgrade prompts when accessing disabled features

## Implementation Steps

### Phase 1: Database & Core System
1. Create subscription-related database tables
2. Add module checking utilities and hooks
3. Update company data fetching to include subscription info
4. Create subscription management server actions

### Phase 2: Admin Panel
1. Create admin dashboard layout and routing
2. Build company management interface
3. Implement subscription assignment interface
4. Add module toggle controls per company

### Phase 3: Module Integration
1. Update existing components with permission checks
2. Add upgrade prompts for disabled features
3. Implement module-specific route protection
4. Update navigation to hide disabled features

### Phase 4: User Experience
1. Add subscription status indicators in company dashboards
2. Create upgrade/billing information pages
3. Implement usage limits and notifications
4. Add onboarding flows for different plan tiers

## Key Benefits
- **Scalable**: Easy to add new modules and plans
- **Flexible**: Per-company customization possible
- **Maintainable**: Clean separation between admin and business logic
- **User-friendly**: Seamless experience with clear upgrade paths

## Recommended Approach

I recommend **NOT** creating a completely separate admin panel. Instead:

1. **Use your existing admin role** - You already have an `admin` role defined in your user types
2. **Leverage your current dashboard structure** - Add admin-specific pages within the existing `/admin` route structure
3. **Build on your existing auth system** - Your middleware and route protection already support admin access
4. **Keep it integrated** - This makes maintenance easier and provides a consistent user experience

The system would work like this:
- You log in as an admin user
- You get access to admin-specific pages at `/admin/*`
- From there you can manage all companies, assign subscriptions, and toggle modules
- Regular company owners see their restrictions in their existing dashboards
- Module checks happen transparently throughout the application