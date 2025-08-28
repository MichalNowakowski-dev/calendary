# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm start` - Start production server

### Code Quality

- `npm run lint` - Run ESLint with Next.js TypeScript config
- `npm run test` - Run Jest test suite
- `npm run test:watch` - Run tests in watch mode

## Architecture Overview

This is a multi-tenant appointment booking system built with Next.js 15, React 19, Supabase, and TypeScript. The application serves different user roles with dedicated dashboards and functionality.

### Core User Roles

- `company_owner` - Business owners managing their company
- `employee` - Staff members with access to schedules and appointments
- `customer` - End users booking appointments
- `admin` - System administrators

### Database Architecture (Supabase)

The system uses Supabase PostgreSQL with the following key tables:

- `companies` - Business entities with slug-based routing
- `company_users` - Links users to companies with role assignments
- `services` - Bookable services offered by companies
- `employees` - Staff members (can have auth accounts or be display-only)
- `employee_services` - Many-to-many relationship between employees and services
- `schedules` - Employee availability periods with date ranges and daily hours
- `appointments` - Bookings with payment status and methods
- `customers` - Client information (linked to auth users or standalone)
- `business_hours` - Operating hours per day of week
- `settings` - Company-specific configuration

### Directory Structure

- `src/app/(dashboards)/` - Role-based dashboard layouts and pages
- `src/components/` - Reusable UI components organized by feature
- `src/lib/actions/` - Server actions for database operations
- `src/lib/auth/` - Authentication utilities and route protection
- `src/lib/types/` - TypeScript definitions including database schema
- `src/middleware.ts` - Route protection and role-based access control

### Authentication & Authorization

- Supabase Auth handles user authentication
- Role-based routing with middleware protection
- User metadata stores role information
- Route configurations define allowed roles per path

### Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Key Technologies

- Next.js 15 with App Router and Server Components
- React 19 with React Hook Form and Zod validation
- Supabase for database, auth, and real-time features
- Tailwind CSS with Radix UI components
- TypeScript with strict configuration
- Jest for testing

### Public Business Pages

Companies can be accessed via `/business/[slug]` routes for public booking interfaces.

### Component Patterns

- Use shadcn/ui components from `src/components/ui/`
- Server Components for data fetching, Client Components for interactivity
- Form handling with React Hook Form and Zod schemas in `src/lib/validations/`
- Database operations through server actions in `src/lib/actions/`

# AI Rules for Calendary project

## CODING_PRACTICES

### Guidelines for SUPPORT_LEVEL

#### SUPPORT_BEGINNER

- When running in agent mode, execute up to 3 actions at a time and ask for approval or course correction afterwards.
- Write code with clear variable names and include explanatory comments for non-obvious logic. Avoid shorthand syntax and complex patterns.
- Provide full implementations rather than partial snippets. Include import statements, required dependencies, and initialization code.
- Add defensive coding patterns and clear error handling. Include validation for user inputs and explicit type checking.
- Suggest simpler solutions first, then offer more optimized versions with explanations of the trade-offs.
- Briefly explain why certain approaches are used and link to relevant documentation or learning resources.
- When suggesting fixes for errors, explain the root cause and how the solution addresses it to build understanding. Ask for confirmation before proceeding.
- Offer introducing basic test cases that demonstrate how the code works and common edge cases to consider.

### Guidelines for VERSION_CONTROL

#### GIT

- Use conventional commits to create meaningful commit messages
- Use feature branches with descriptive names following {{branch_naming_convention}}
- Write meaningful commit messages that explain why changes were made, not just what
- Keep commits focused on single logical changes to facilitate code review and bisection
- Use interactive rebase to clean up history before merging feature branches
- Leverage git hooks to enforce code quality checks before commits and pushes

#### CONVENTIONAL_COMMITS

- Follow the format: type(scope): description for all commit messages
- Use consistent types (feat, fix, docs, style, refactor, test, chore) across the project
- Define clear scopes based on {{project_modules}} to indicate affected areas
- Include issue references in commit messages to link changes to requirements
- Use breaking change footer (!: or BREAKING CHANGE:) to clearly mark incompatible changes
- Configure commitlint to automatically enforce conventional commit format
- Do not include text about generating commit by claude ai

## FRONTEND

### Guidelines for REACT

#### REACT_CODING_STANDARDS

- Use functional components with hooks instead of class components
- Implement React.memo() for expensive components that render often with the same props
- Utilize React.lazy() and Suspense for code-splitting and performance optimization
- Use the useCallback hook for event handlers passed to child components to prevent unnecessary re-renders
- Prefer useMemo for expensive calculations to avoid recomputation on every render
- Implement useId() for generating unique IDs for accessibility attributes
- Use the new use hook for data fetching in React 19+ projects
- Leverage Server Components for {{data_fetching_heavy_components}} when using React with Next.js or similar frameworks
- Consider using the new useOptimistic hook for optimistic UI updates in forms
- Use useTransition for non-urgent state updates to keep the UI responsive

#### NEXT_JS

- Use App Router and Server Components for improved performance and SEO
- Implement route handlers for API endpoints instead of the pages/api directory
- Use server actions for form handling and data mutations from Server Components
- Leverage Next.js Image component with proper sizing for core web vitals optimization
- Implement the Metadata API for dynamic SEO optimization
- Use React Server Components for {{data_fetching_operations}} to reduce client-side JavaScript
- Implement Streaming and Suspense for improved loading states
- Use the new Link component without requiring a child <a> tag
- Leverage parallel routes for complex layouts and parallel data fetching
- Implement intercepting routes for modal patterns and nested UIs

## TESTING

### Guidelines for UNIT

#### JEST

- Use Jest with TypeScript for type checking in tests
- Implement Testing Library for component testing instead of enzyme
- Use snapshot testing sparingly and only for stable UI components
- Leverage mock functions and spies for isolating units of code
- Implement test setup and teardown with beforeEach and afterEach
- Use describe blocks for organizing related tests
- Leverage expect assertions with specific matchers
- Implement code coverage reporting with meaningful targets
- Use mockResolvedValue and mockRejectedValue for async testing
- Leverage fake timers for testing time-dependent functionality
