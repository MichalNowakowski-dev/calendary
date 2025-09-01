export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          address_street: string | null;
          address_city: string | null;
          phone: string | null;
          industry: string;
          created_at: string;
          plan_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          address_street?: string | null;
          address_city?: string | null;
          phone?: string | null;
          industry: string;
          created_at?: string;
          plan_id?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          address_street?: string | null;
          address_city?: string | null;
          phone?: string | null;
          industry?: string;
          created_at?: string;
          plan_id?: string;
        };
      };
      company_users: {
        Row: {
          id: string;
          company_id: string;
          user_id: string;
          status: "active" | "invited" | "suspended";
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          user_id: string;
          status?: "active" | "invited" | "suspended";
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          user_id?: string;
          status?: "active" | "invited" | "suspended";
          created_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          description: string | null;
          duration_minutes: number;
          price: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          description?: string | null;
          duration_minutes: number;
          price: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          description?: string | null;
          duration_minutes?: number;
          price?: number;
          active?: boolean;
          created_at?: string;
        };
      };
      employees: {
        Row: {
          id: string;
          company_id: string;
          user_id: string | null;
          name: string;
          visible: boolean;
          phone_number: string | null;
          email: string | null;
          auth_user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          user_id?: string | null;
          name: string;
          visible?: boolean;
          phone_number?: string | null;
          email?: string | null;
          auth_user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          user_id?: string | null;
          name?: string;
          visible?: boolean;
          phone_number?: string | null;
          email?: string | null;
          auth_user_id?: string | null;
          created_at?: string;
        };
      };
      employee_services: {
        Row: {
          employee_id: string;
          service_id: string;
        };
        Insert: {
          employee_id: string;
          service_id: string;
        };
        Update: {
          employee_id?: string;
          service_id?: string;
        };
      };
      schedules: {
        Row: {
          id: string;
          employee_id: string;
          start_date: string;
          end_date: string;
          start_time: string; // "08:00"
          end_time: string; // "16:00"
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          start_date: string;
          end_date: string;
          start_time: string;
          end_time: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          start_date?: string;
          end_date?: string;
          start_time?: string;
          end_time?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          company_id: string;
          employee_id: string | null;
          service_id: string;
          customer_id: string | null;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          date: string;
          start_time: string;
          end_time: string;
          status: "booked" | "cancelled" | "completed";
          payment_status: "pending" | "paid" | "refunded" | "cancelled";
          payment_method: "on_site" | "online" | "deposit";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          employee_id?: string | null;
          service_id: string;
          customer_id?: string | null;
          customer_name: string;
          customer_email: string;
          customer_phone?: string | null;
          date: string;
          start_time: string;
          end_time: string;
          status?: "booked" | "cancelled" | "completed";
          payment_status?: "pending" | "paid" | "refunded" | "cancelled";
          payment_method?: "on_site" | "online" | "deposit";
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          employee_id?: string | null;
          service_id?: string;
          customer_id?: string | null;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string | null;
          date?: string;
          start_time?: string;
          end_time?: string;
          status?: "booked" | "cancelled" | "completed";
          payment_status?: "pending" | "paid" | "refunded" | "cancelled";
          payment_method?: "on_site" | "online" | "deposit";
          notes?: string | null;
          created_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          email: string;
          phone: string | null;
          created_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          email: string;
          phone?: string | null;
          created_at?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          created_at?: string;
          notes?: string | null;
        };
      };
      settings: {
        Row: {
          id: string;
          company_id: string;
          booking_buffer: number | null; // minutes
          max_bookings_per_day: number | null;
          enable_notifications: boolean;
          auto_assign_employee: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          booking_buffer?: number | null;
          max_bookings_per_day?: number | null;
          enable_notifications?: boolean;
          auto_assign_employee?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          booking_buffer?: number | null;
          max_bookings_per_day?: number | null;
          enable_notifications?: boolean;
          auto_assign_employee?: boolean;
          created_at?: string;
        };
      };
      business_hours: {
        Row: {
          id: string;
          company_id: string;
          day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
          open_time: string | null; // "08:00"
          close_time: string | null; // "17:00"
          is_open: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          day_of_week: number;
          open_time?: string | null;
          close_time?: string | null;
          is_open?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          day_of_week?: number;
          open_time?: string | null;
          close_time?: string | null;
          is_open?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          description: string | null;
          price_monthly: number;
          price_yearly: number;
          is_active: boolean;
          features: Record<string, string>;
          max_employees: number | null;
          max_locations: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          description?: string | null;
          price_monthly?: number;
          price_yearly?: number;
          is_active?: boolean;
          features?: Record<string, string>;
          max_employees?: number | null;
          max_locations?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string;
          description?: string | null;
          price_monthly?: number;
          price_yearly?: number;
          is_active?: boolean;
          features?: Record<string, string>;
          max_employees?: number | null;
          max_locations?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      company_subscriptions: {
        Row: {
          id: string;
          company_id: string;
          subscription_plan_id: string;
          status: "active" | "inactive" | "cancelled" | "past_due";
          billing_cycle: "monthly" | "yearly";
          current_period_start: string;
          current_period_end: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          subscription_plan_id: string;
          status?: "active" | "inactive" | "cancelled" | "past_due";
          billing_cycle?: "monthly" | "yearly";
          current_period_start?: string;
          current_period_end?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          subscription_plan_id?: string;
          status?: "active" | "inactive" | "cancelled" | "past_due";
          billing_cycle?: "monthly" | "yearly";
          current_period_start?: string;
          current_period_end?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      plan_modules: {
        Row: {
          id: string;
          subscription_plan_id: string;
          module_name: string;
          is_enabled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          subscription_plan_id: string;
          module_name: string;
          is_enabled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          subscription_plan_id?: string;
          module_name?: string;
          is_enabled?: boolean;
          created_at?: string;
        };
      };
      company_modules: {
        Row: {
          id: string;
          company_id: string;
          module_name: string;
          is_enabled: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          module_name: string;
          is_enabled: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          module_name?: string;
          is_enabled?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      module_changes: {
        Row: {
          id: string;
          company_id: string;
          module_name: string;
          action: "granted" | "revoked" | "overridden";
          reason: "subscription_change" | "admin_override" | "expiration" | "downgrade" | "manual";
          previous_status: boolean;
          new_status: boolean;
          changed_by_user_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          module_name: string;
          action: "granted" | "revoked" | "overridden";
          reason: "subscription_change" | "admin_override" | "expiration" | "downgrade" | "manual";
          previous_status: boolean;
          new_status: boolean;
          changed_by_user_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          module_name?: string;
          action?: "granted" | "revoked" | "overridden";
          reason?: "subscription_change" | "admin_override" | "expiration" | "downgrade" | "manual";
          previous_status?: boolean;
          new_status?: boolean;
          changed_by_user_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      module_dependencies: {
        Row: {
          id: string;
          module_name: string;
          depends_on: string;
          is_required: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_name: string;
          depends_on: string;
          is_required?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          module_name?: string;
          depends_on?: string;
          is_required?: boolean;
          created_at?: string;
        };
      };
      module_usage_tracking: {
        Row: {
          id: string;
          company_id: string;
          module_name: string;
          usage_count: number;
          last_used_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          module_name: string;
          usage_count?: number;
          last_used_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          module_name?: string;
          usage_count?: number;
          last_used_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      module_warnings: {
        Row: {
          id: string;
          company_id: string;
          module_name: string;
          warning_type: "expiration_warning" | "downgrade_warning" | "usage_limit_warning";
          warning_message: string;
          expires_at: string;
          is_acknowledged: boolean;
          acknowledged_at: string | null;
          acknowledged_by_user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          module_name: string;
          warning_type: "expiration_warning" | "downgrade_warning" | "usage_limit_warning";
          warning_message: string;
          expires_at: string;
          is_acknowledged?: boolean;
          acknowledged_at?: string | null;
          acknowledged_by_user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          module_name?: string;
          warning_type?: "expiration_warning" | "downgrade_warning" | "usage_limit_warning";
          warning_message?: string;
          expires_at?: string;
          is_acknowledged?: boolean;
          acknowledged_at?: string | null;
          acknowledged_by_user_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: "admin" | "company_owner" | "employee" | "customer";
      company_user_role: "company_owner" | "employee" | "admin";
      company_user_status: "active" | "invited" | "suspended";
      appointment_status: "booked" | "cancelled" | "completed";
      subscription_status: "active" | "inactive" | "cancelled" | "past_due";
      billing_cycle: "monthly" | "yearly";
      module_name:
        | "employee_management"
        | "employee_schedules"
        | "online_payments"
        | "analytics"
        | "multi_location"
        | "api_access";
      industry_type:
        | "automotive"
        | "beauty"
        | "barbershop"
        | "massage"
        | "spa"
        | "medical"
        | "fitness"
        | "education"
        | "veterinary"
        | "other";
      module_change_action: "granted" | "revoked" | "overridden";
      module_change_reason:
        | "subscription_change"
        | "admin_override"
        | "expiration"
        | "downgrade"
        | "manual";
      module_warning_type:
        | "expiration_warning"
        | "downgrade_warning"
        | "usage_limit_warning";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Utility types
export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type CompanyInsert = Database["public"]["Tables"]["companies"]["Insert"];
export type CompanyUpdate = Database["public"]["Tables"]["companies"]["Update"];

export type CompanyUser = Database["public"]["Tables"]["company_users"]["Row"];
export type CompanyUserInsert =
  Database["public"]["Tables"]["company_users"]["Insert"];
export type CompanyUserUpdate =
  Database["public"]["Tables"]["company_users"]["Update"];

export type Service = Database["public"]["Tables"]["services"]["Row"];
export type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"];
export type ServiceUpdate = Database["public"]["Tables"]["services"]["Update"];

export type Employee = Database["public"]["Tables"]["employees"]["Row"];
export type EmployeeInsert =
  Database["public"]["Tables"]["employees"]["Insert"];
export type EmployeeUpdate =
  Database["public"]["Tables"]["employees"]["Update"];

export type EmployeeService =
  Database["public"]["Tables"]["employee_services"]["Row"];
export type EmployeeServiceInsert =
  Database["public"]["Tables"]["employee_services"]["Insert"];
export type EmployeeServiceUpdate =
  Database["public"]["Tables"]["employee_services"]["Update"];

export type Schedule = Database["public"]["Tables"]["schedules"]["Row"];
export type ScheduleInsert =
  Database["public"]["Tables"]["schedules"]["Insert"];
export type ScheduleUpdate =
  Database["public"]["Tables"]["schedules"]["Update"];

export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type AppointmentInsert =
  Database["public"]["Tables"]["appointments"]["Insert"];
export type AppointmentUpdate =
  Database["public"]["Tables"]["appointments"]["Update"];

export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type CustomerInsert =
  Database["public"]["Tables"]["customers"]["Insert"];
export type CustomerUpdate =
  Database["public"]["Tables"]["customers"]["Update"];

export type Settings = Database["public"]["Tables"]["settings"]["Row"];
export type SettingsInsert = Database["public"]["Tables"]["settings"]["Insert"];
export type SettingsUpdate = Database["public"]["Tables"]["settings"]["Update"];

export type BusinessHours =
  Database["public"]["Tables"]["business_hours"]["Row"];
export type BusinessHoursInsert =
  Database["public"]["Tables"]["business_hours"]["Insert"];
export type BusinessHoursUpdate =
  Database["public"]["Tables"]["business_hours"]["Update"];

export type SubscriptionPlan =
  Database["public"]["Tables"]["subscription_plans"]["Row"];
export type SubscriptionPlanInsert =
  Database["public"]["Tables"]["subscription_plans"]["Insert"];
export type SubscriptionPlanUpdate =
  Database["public"]["Tables"]["subscription_plans"]["Update"];

export type CompanySubscription =
  Database["public"]["Tables"]["company_subscriptions"]["Row"];
export type CompanySubscriptionInsert =
  Database["public"]["Tables"]["company_subscriptions"]["Insert"];
export type CompanySubscriptionUpdate =
  Database["public"]["Tables"]["company_subscriptions"]["Update"];

export type PlanModule = Database["public"]["Tables"]["plan_modules"]["Row"];
export type PlanModuleInsert =
  Database["public"]["Tables"]["plan_modules"]["Insert"];
export type PlanModuleUpdate =
  Database["public"]["Tables"]["plan_modules"]["Update"];

export type CompanyModule =
  Database["public"]["Tables"]["company_modules"]["Row"];
export type CompanyModuleInsert =
  Database["public"]["Tables"]["company_modules"]["Insert"];
export type CompanyModuleUpdate =
  Database["public"]["Tables"]["company_modules"]["Update"];

export type ModuleChange = Database["public"]["Tables"]["module_changes"]["Row"];
export type ModuleChangeInsert =
  Database["public"]["Tables"]["module_changes"]["Insert"];
export type ModuleChangeUpdate =
  Database["public"]["Tables"]["module_changes"]["Update"];

export type ModuleDependency =
  Database["public"]["Tables"]["module_dependencies"]["Row"];
export type ModuleDependencyInsert =
  Database["public"]["Tables"]["module_dependencies"]["Insert"];
export type ModuleDependencyUpdate =
  Database["public"]["Tables"]["module_dependencies"]["Update"];

export type ModuleUsageTracking =
  Database["public"]["Tables"]["module_usage_tracking"]["Row"];
export type ModuleUsageTrackingInsert =
  Database["public"]["Tables"]["module_usage_tracking"]["Insert"];
export type ModuleUsageTrackingUpdate =
  Database["public"]["Tables"]["module_usage_tracking"]["Update"];

export type ModuleWarning =
  Database["public"]["Tables"]["module_warnings"]["Row"];
export type ModuleWarningInsert =
  Database["public"]["Tables"]["module_warnings"]["Insert"];
export type ModuleWarningUpdate =
  Database["public"]["Tables"]["module_warnings"]["Update"];

// Enum types
export type UserRole = Database["public"]["Enums"]["user_role"];
export type CompanyUserRole = Database["public"]["Enums"]["company_user_role"];
export type CompanyUserStatus =
  Database["public"]["Enums"]["company_user_status"];
export type AppointmentStatus =
  Database["public"]["Enums"]["appointment_status"];
export type SubscriptionStatus =
  Database["public"]["Enums"]["subscription_status"];
export type BillingCycle = Database["public"]["Enums"]["billing_cycle"];
export type ModuleName = Database["public"]["Enums"]["module_name"];
export type IndustryType = Database["public"]["Enums"]["industry_type"];
export type ModuleChangeAction = Database["public"]["Enums"]["module_change_action"];
export type ModuleChangeReason = Database["public"]["Enums"]["module_change_reason"];
export type ModuleWarningType = Database["public"]["Enums"]["module_warning_type"];

// Combined types for common use cases
export interface CompanyWithOwner extends Company {
  owner?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface CompanyWithPlan extends Company {
  subscription_plan: SubscriptionPlan;
}

export interface CompanyWithServices extends Company {
  services: ServiceWithEmployeesArray[];
}

export interface ServiceWithCompany extends Service {
  company: Company;
}

export interface EmployeeWithDetails extends Employee {
  services: Service[];
  schedules: Schedule[];
}

export interface AppointmentWithDetails extends Appointment {
  service: Service;
  company: Company;
  employee?: Employee;
}

// Types for getEmployeesWithDetails function
export interface EmployeeWithDetailsRaw extends Employee {
  employee_services: Array<{
    service: Service;
  }>;
  schedules: Schedule[];
}

// Types for employee services queries
export interface EmployeeServiceWithEmployee {
  employee: Pick<Employee, "id" | "name" | "visible">;
}

// Service with employee assignments
export interface ServiceWithEmployees extends Service {
  employee_services: {
    employee: {
      id: string;
      name: string;
      visible: boolean;
    };
  }[];
}

// Service with employees array (for search results)
export interface ServiceWithEmployeesArray extends Service {
  company: Company;
  employees: Employee[];
}

// Subscription-related combined types
export interface CompanyWithSubscription extends Company {
  subscription?: {
    id: string;
    status: SubscriptionStatus;
    billing_cycle: BillingCycle;
    current_period_end: string;
    plan: SubscriptionPlan;
  };
}

export interface SubscriptionPlanWithModules extends SubscriptionPlan {
  plan_modules: PlanModule[];
}

export interface CompanySubscriptionWithPlan extends CompanySubscription {
  subscription_plan: SubscriptionPlan;
  plan_modules: PlanModule[];
}

export interface CompanyPermissions {
  companyId: string;
  modules: Record<ModuleName, boolean>;
  limits: {
    maxEmployees: number | null;
    maxLocations: number | null;
  };
  subscription: {
    status: SubscriptionStatus;
    planName: string;
    expiresAt: string;
  };
}

export interface CompanyWithFullSubscription extends Company {
  company_subscriptions: Array<
    CompanySubscription & {
      subscription_plan: SubscriptionPlan & {
        plan_modules: PlanModule[];
      };
    }
  >;
}

export interface CompanyWithOptionalSubscription extends Company {
  company_subscriptions: Array<
    CompanySubscription & {
      subscription_plan: SubscriptionPlan & {
        plan_modules: PlanModule[];
      };
    }
  > | null;
}

// Enhanced module system types
export interface ModuleChangeWithDetails extends ModuleChange {
  changed_by_user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface ModuleDependencyGraph {
  module: ModuleName;
  dependencies: {
    module: ModuleName;
    required: boolean;
  }[];
  dependents: {
    module: ModuleName;
    required: boolean;
  }[];
}

export interface CompanyModuleUsage {
  company_id: string;
  modules: Record<ModuleName, {
    enabled: boolean;
    usage_count: number;
    last_used_at: string | null;
    warnings: ModuleWarning[];
  }>;
}

export interface ModuleTransition {
  module: ModuleName;
  from_status: boolean;
  to_status: boolean;
  reason: ModuleChangeReason;
  dependencies_affected: ModuleName[];
  warnings_generated: ModuleWarning[];
}

export interface EnhancedCompanyPermissions extends CompanyPermissions {
  module_warnings: ModuleWarning[];
  module_usage: Record<ModuleName, ModuleUsageTracking>;
  pending_transitions: ModuleTransition[];
}
