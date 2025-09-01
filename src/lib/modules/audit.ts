import { createClient } from '@/lib/supabase/server';
import type {
  ModuleName,
  ModuleChange,
  ModuleChangeWithDetails,
  ModuleChangeReason,
  ModuleChangeAction,
  CompanyModuleUsage,
  ModuleUsageTracking,
} from '@/lib/types/database';

export class ModuleAuditTracker {
  private supabase = createClient();

  /**
   * Get comprehensive audit trail for a company's module changes
   */
  async getCompanyModuleAuditTrail(
    companyId: string,
    options?: {
      module?: ModuleName;
      startDate?: string;
      endDate?: string;
      limit?: number;
      includeUserDetails?: boolean;
    }
  ): Promise<ModuleChangeWithDetails[]> {
    let query = this.supabase
      .from('module_changes')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (options?.module) {
      query = query.eq('module_name', options.module);
    }

    if (options?.startDate) {
      query = query.gte('created_at', options.startDate);
    }

    if (options?.endDate) {
      query = query.lte('created_at', options.endDate);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data: changes, error } = await query;

    if (error) throw error;

    if (!options?.includeUserDetails) {
      return changes as ModuleChangeWithDetails[];
    }

    // Enrich with user details if requested
    const enrichedChanges = await Promise.all(
      (changes || []).map(async (change) => {
        if (!change.changed_by_user_id) {
          return change as ModuleChangeWithDetails;
        }

        const { data: userData } = await this.supabase
          .from('auth.users')
          .select('id, email, user_metadata')
          .eq('id', change.changed_by_user_id)
          .single();

        return {
          ...change,
          changed_by_user: userData ? {
            id: userData.id,
            email: userData.email,
            first_name: userData.user_metadata?.first_name || '',
            last_name: userData.user_metadata?.last_name || '',
          } : undefined,
        } as ModuleChangeWithDetails;
      })
    );

    return enrichedChanges;
  }

  /**
   * Get module usage analytics for a company
   */
  async getCompanyModuleUsage(companyId: string): Promise<CompanyModuleUsage> {
    // Get usage tracking data
    const { data: usageData, error: usageError } = await this.supabase
      .from('module_usage_tracking')
      .select('*')
      .eq('company_id', companyId);

    if (usageError) throw usageError;

    // Get active warnings
    const { data: warnings, error: warningsError } = await this.supabase
      .from('module_warnings')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_acknowledged', false)
      .gte('expires_at', new Date().toISOString());

    if (warningsError) throw warningsError;

    // Get current module status
    const { data: companyModules, error: modulesError } = await this.supabase
      .from('company_modules')
      .select('*')
      .eq('company_id', companyId);

    if (modulesError) throw modulesError;

    // Get subscription plan modules
    const { data: subscription, error: subscriptionError } = await this.supabase
      .from('company_subscriptions')
      .select(`
        *,
        subscription_plan:subscription_plans (
          *,
          plan_modules (*)
        )
      `)
      .eq('company_id', companyId)
      .eq('status', 'active')
      .single();

    if (subscriptionError) throw subscriptionError;

    // Build module usage map
    const modules: CompanyModuleUsage['modules'] = {};
    const allModules: ModuleName[] = [
      'employee_management',
      'employee_schedules',
      'online_payments',
      'analytics',
      'multi_location',
      'api_access'
    ];

    for (const moduleName of allModules) {
      // Determine if module is enabled
      const companyOverride = companyModules?.find(m => m.module_name === moduleName);
      const planModule = subscription?.subscription_plan?.plan_modules?.find(
        (pm: { module_name: string; is_enabled: boolean }) => pm.module_name === moduleName
      );

      const isEnabled = companyOverride 
        ? companyOverride.is_enabled 
        : planModule?.is_enabled || false;

      // Get usage data
      const usage = usageData?.find(u => u.module_name === moduleName);
      
      // Get warnings for this module
      const moduleWarnings = warnings?.filter(w => w.module_name === moduleName) || [];

      modules[moduleName] = {
        enabled: isEnabled,
        usage_count: usage?.usage_count || 0,
        last_used_at: usage?.last_used_at || null,
        warnings: moduleWarnings,
      };
    }

    return {
      company_id: companyId,
      modules,
    };
  }

  /**
   * Record module usage event
   */
  async recordModuleUsage(
    companyId: string,
    moduleName: ModuleName,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      // Update usage tracking
      const { data: existing, error: selectError } = await this.supabase
        .from('module_usage_tracking')
        .select('*')
        .eq('company_id', companyId)
        .eq('module_name', moduleName)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }

      if (existing) {
        await this.supabase
          .from('module_usage_tracking')
          .update({
            usage_count: existing.usage_count + 1,
            last_used_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await this.supabase
          .from('module_usage_tracking')
          .insert({
            company_id: companyId,
            module_name: moduleName,
            usage_count: 1,
            last_used_at: new Date().toISOString(),
          });
      }
    } catch (error) {
      console.error('Error recording module usage:', error);
      // Don't throw - usage tracking shouldn't break functionality
    }
  }

  /**
   * Get module statistics across all companies (admin only)
   */
  async getModuleStatistics(options?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalChanges: number;
    changesByModule: Record<ModuleName, number>;
    changesByReason: Record<ModuleChangeReason, number>;
    changesByAction: Record<ModuleChangeAction, number>;
    mostActiveCompanies: { company_id: string; change_count: number }[];
    usageStats: Record<ModuleName, {
      companies_using: number;
      total_usage: number;
      avg_usage_per_company: number;
    }>;
  }> {
    let query = this.supabase
      .from('module_changes')
      .select('*');

    if (options?.startDate) {
      query = query.gte('created_at', options.startDate);
    }

    if (options?.endDate) {
      query = query.lte('created_at', options.endDate);
    }

    const { data: changes, error } = await query;

    if (error) throw error;

    // Get usage statistics
    const { data: usageData, error: usageError } = await this.supabase
      .from('module_usage_tracking')
      .select('*');

    if (usageError) throw usageError;

    // Process statistics
    const changesByModule: Record<ModuleName, number> = {
      employee_management: 0,
      employee_schedules: 0,
      online_payments: 0,
      analytics: 0,
      multi_location: 0,
      api_access: 0,
    };

    const changesByReason: Record<ModuleChangeReason, number> = {
      subscription_change: 0,
      admin_override: 0,
      expiration: 0,
      downgrade: 0,
      manual: 0,
    };

    const changesByAction: Record<ModuleChangeAction, number> = {
      granted: 0,
      revoked: 0,
      overridden: 0,
    };

    const companyChangeCounts: Record<string, number> = {};

    // Process changes
    (changes || []).forEach(change => {
      changesByModule[change.module_name as ModuleName]++;
      changesByReason[change.reason as ModuleChangeReason]++;
      changesByAction[change.action as ModuleChangeAction]++;
      companyChangeCounts[change.company_id] = (companyChangeCounts[change.company_id] || 0) + 1;
    });

    // Process usage statistics
    const usageStats: Record<ModuleName, {
      companies_using: number;
      total_usage: number;
      avg_usage_per_company: number;
    }> = {
      employee_management: { companies_using: 0, total_usage: 0, avg_usage_per_company: 0 },
      employee_schedules: { companies_using: 0, total_usage: 0, avg_usage_per_company: 0 },
      online_payments: { companies_using: 0, total_usage: 0, avg_usage_per_company: 0 },
      analytics: { companies_using: 0, total_usage: 0, avg_usage_per_company: 0 },
      multi_location: { companies_using: 0, total_usage: 0, avg_usage_per_company: 0 },
      api_access: { companies_using: 0, total_usage: 0, avg_usage_per_company: 0 },
    };

    (usageData || []).forEach(usage => {
      const moduleName = usage.module_name as ModuleName;
      usageStats[moduleName].companies_using++;
      usageStats[moduleName].total_usage += usage.usage_count;
    });

    // Calculate averages
    Object.keys(usageStats).forEach(moduleKey => {
      const stats = usageStats[moduleKey as ModuleName];
      stats.avg_usage_per_company = stats.companies_using > 0 
        ? stats.total_usage / stats.companies_using 
        : 0;
    });

    // Get most active companies
    const mostActiveCompanies = Object.entries(companyChangeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([company_id, change_count]) => ({ company_id, change_count }));

    return {
      totalChanges: changes?.length || 0,
      changesByModule,
      changesByReason,
      changesByAction,
      mostActiveCompanies,
      usageStats,
    };
  }

  /**
   * Clean up old audit records (admin maintenance function)
   */
  async cleanupOldAuditRecords(
    olderThanDays: number = 365,
    dryRun: boolean = true
  ): Promise<{
    recordsToDelete: number;
    recordsDeleted?: number;
    success: boolean;
  }> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000).toISOString();

    // First, count records that would be deleted
    const { count, error: countError } = await this.supabase
      .from('module_changes')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', cutoffDate);

    if (countError) throw countError;

    if (dryRun) {
      return {
        recordsToDelete: count || 0,
        success: true,
      };
    }

    // Actually delete records
    const { error: deleteError } = await this.supabase
      .from('module_changes')
      .delete()
      .lt('created_at', cutoffDate);

    if (deleteError) throw deleteError;

    return {
      recordsToDelete: count || 0,
      recordsDeleted: count || 0,
      success: true,
    };
  }

  /**
   * Export audit trail to JSON format
   */
  async exportAuditTrail(
    companyId: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<{ success: boolean; data?: unknown; error?: string }> {
    try {
      const auditTrail = await this.getCompanyModuleAuditTrail(companyId, {
        includeUserDetails: true,
      });

      if (format === 'json') {
        return {
          success: true,
          data: {
            company_id: companyId,
            export_date: new Date().toISOString(),
            audit_trail: auditTrail,
          },
        };
      }

      // CSV format
      const csvHeaders = [
        'Date',
        'Module',
        'Action',
        'Reason',
        'Previous Status',
        'New Status',
        'Changed By',
        'Notes'
      ];

      const csvRows = auditTrail.map(change => [
        change.created_at,
        change.module_name,
        change.action,
        change.reason,
        change.previous_status,
        change.new_status,
        change.changed_by_user?.email || 'System',
        change.notes || ''
      ]);

      return {
        success: true,
        data: {
          headers: csvHeaders,
          rows: csvRows,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }
}

// Export singleton instance
export const moduleAuditTracker = new ModuleAuditTracker();