// This file is now deprecated. All database operations have been moved to src/lib/db.ts
// Please use the centralized database operations from that file instead.

import { db } from "@/lib/db";
import type { Service, Schedule } from "@/lib/types/database";

// Re-export the interface for backward compatibility
export interface EmployeeWithDetails {
  id: string;
  company_id: string;
  user_id: string | null;
  name: string;
  visible: boolean;
  created_at: string;
  services: Service[];
  schedules: Schedule[];
}

// Re-export the functions for backward compatibility (client-side versions)
export const getEmployeesWithDetails = db.getEmployeesWithDetails;
export const getServices = db.getServices;
