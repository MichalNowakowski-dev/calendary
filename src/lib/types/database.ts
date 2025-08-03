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
        };
      };
      company_users: {
        Row: {
          id: string;
          company_id: string;
          user_id: string;
          role: "owner" | "employee" | "admin";
          status: "active" | "invited" | "suspended";
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          user_id: string;
          role: "owner" | "employee" | "admin";
          status?: "active" | "invited" | "suspended";
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          user_id?: string;
          role?: "owner" | "employee" | "admin";
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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: "admin" | "company_owner" | "employee" | "customer";
      company_user_role: "owner" | "employee" | "admin";
      company_user_status: "active" | "invited" | "suspended";
      appointment_status: "booked" | "cancelled" | "completed";
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

// Enum types
export type UserRole = Database["public"]["Enums"]["user_role"];
export type CompanyUserRole = Database["public"]["Enums"]["company_user_role"];
export type CompanyUserStatus =
  Database["public"]["Enums"]["company_user_status"];
export type AppointmentStatus =
  Database["public"]["Enums"]["appointment_status"];
export type IndustryType = Database["public"]["Enums"]["industry_type"];

// Combined types for common use cases
export interface CompanyWithOwner extends Company {
  owner?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface CompanyWithServices extends Company {
  services: (Service & { employees: Employee[] })[];
}

export interface ServiceWithCompany extends Service {
  company: Company;
}

export interface EmployeeWithDetails extends Employee {
  services: Service[];
  schedules: Schedule[];
  role?: "owner" | "employee" | "admin";
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
