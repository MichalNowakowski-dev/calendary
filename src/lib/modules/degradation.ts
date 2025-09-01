import { createClient } from '@/lib/supabase/server';
import type {
  ModuleName,
  ModuleWarning,
  ModuleWarningType,
  CompanyPermissions,
  ModuleChangeReason,
} from '@/lib/types/database';
import { moduleAuditTracker } from './audit';

export interface GracefulDegradationConfig {
  warningPeriodDays: number;
  dataExportAvailableDays: number;
  featureDisableStages: {
    daysBeforeRevocation: number;
    restrictions: string[];
  }[];
}

export interface DegradationStatus {
  module: ModuleName;
  status: 'active' | 'warning' | 'restricted' | 'revoked';
  daysRemaining: number;
  warnings: ModuleWarning[];
  availableActions: string[];
  dataExportOptions: string[];
  restrictions: string[];
}

export class GracefulDegradationManager {
  private supabase = createClient();
  
  private defaultConfig: GracefulDegradationConfig = {
    warningPeriodDays: 14,
    dataExportAvailableDays: 30,
    featureDisableStages: [
      {
        daysBeforeRevocation: 7,
        restrictions: ['read_only_mode'],
      },
      {
        daysBeforeRevocation: 3,
        restrictions: ['limited_access', 'export_only'],
      },
      {
        daysBeforeRevocation: 1,
        restrictions: ['view_only', 'no_new_data'],
      },
    ],
  };

  /**
   * Create graceful degradation warning for module revocation
   */
  async createRevocationWarning(
    companyId: string,
    moduleName: ModuleName,
    reason: ModuleChangeReason,
    customConfig?: Partial<GracefulDegradationConfig>
  ): Promise<{ success: boolean; warning?: ModuleWarning; message: string }> {
    try {
      const config = { ...this.defaultConfig, ...customConfig };
      const warningType = this.getWarningTypeFromReason(reason);
      const expiresAt = new Date(
        Date.now() + config.warningPeriodDays * 24 * 60 * 60 * 1000
      ).toISOString();

      const warningMessage = this.generateWarningMessage(moduleName, reason, config);

      const { data: warning, error } = await this.supabase
        .from('module_warnings')
        .insert({
          company_id: companyId,
          module_name: moduleName,
          warning_type: warningType,
          warning_message: warningMessage,
          expires_at: expiresAt,
          is_acknowledged: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Schedule degradation stages
      await this.scheduleDegradationStages(companyId, moduleName, config);

      return {
        success: true,
        warning,
        message: `Graceful degradation warning created for ${moduleName}`,
      };
    } catch (error) {
      console.error('Error creating revocation warning:', error);
      return {
        success: false,
        message: 'Failed to create revocation warning',
      };
    }
  }

  /**
   * Get degradation status for company modules
   */
  async getCompanyDegradationStatus(companyId: string): Promise<DegradationStatus[]> {
    const { data: warnings, error } = await this.supabase
      .from('module_warnings')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_acknowledged', false)
      .gte('expires_at', new Date().toISOString());

    if (error) throw error;

    const statusList: DegradationStatus[] = [];
    const now = new Date();

    for (const warning of warnings || []) {
      const expiresAt = new Date(warning.expires_at);
      const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      
      const status = this.calculateModuleStatus(daysRemaining);
      const availableActions = this.getAvailableActions(status, daysRemaining);
      const dataExportOptions = this.getDataExportOptions(warning.module_name);
      const restrictions = this.getCurrentRestrictions(daysRemaining);

      statusList.push({
        module: warning.module_name as ModuleName,
        status,
        daysRemaining,
        warnings: [warning],
        availableActions,
        dataExportOptions,
        restrictions,
      });
    }

    return statusList;
  }

  /**
   * Schedule gradual feature restrictions before full revocation
   */
  private async scheduleDegradationStages(
    companyId: string,
    moduleName: ModuleName,
    config: GracefulDegradationConfig
  ): Promise<void> {
    for (const stage of config.featureDisableStages) {
      const executeAt = new Date(
        Date.now() + stage.daysBeforeRevocation * 24 * 60 * 60 * 1000
      );

      // In a real implementation, you'd schedule this with a job queue
      // For now, we'll store the schedule in the database for manual processing
      await this.supabase
        .from('module_warnings')
        .insert({
          company_id: companyId,
          module_name: moduleName,
          warning_type: 'usage_limit_warning',
          warning_message: `${moduleName} will be restricted to: ${stage.restrictions.join(', ')} in ${stage.daysBeforeRevocation} days`,
          expires_at: executeAt.toISOString(),
          is_acknowledged: false,
        });
    }
  }

  /**
   * Check and apply degradation restrictions
   */
  async checkAndApplyDegradation(
    companyId: string,
    moduleName: ModuleName
  ): Promise<{
    applied: boolean;
    restrictions: string[];
    message: string;
  }> {
    const { data: warnings } = await this.supabase
      .from('module_warnings')
      .select('*')
      .eq('company_id', companyId)
      .eq('module_name', moduleName)
      .eq('is_acknowledged', false)
      .gte('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: true });

    if (!warnings || warnings.length === 0) {
      return {
        applied: false,
        restrictions: [],
        message: 'No active degradation warnings',
      };
    }

    const nearestWarning = warnings[0];
    const daysRemaining = Math.ceil(
      (new Date(nearestWarning.expires_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    );

    const restrictions = this.getCurrentRestrictions(daysRemaining);

    if (restrictions.length > 0) {
      // Record the degradation application
      await moduleAuditTracker.recordModuleUsage(companyId, moduleName, {
        degradation_applied: true,
        restrictions,
        days_remaining: daysRemaining,
      });
    }

    return {
      applied: restrictions.length > 0,
      restrictions,
      message: restrictions.length > 0 
        ? `Applied restrictions: ${restrictions.join(', ')}`
        : 'No restrictions applied yet',
    };
  }

  /**
   * Handle module usage with degradation checks
   */
  async checkModuleUsageAllowed(
    companyId: string,
    moduleName: ModuleName,
    action: string
  ): Promise<{
    allowed: boolean;
    reason?: string;
    warning?: string;
    alternatives?: string[];
  }> {
    const degradationStatus = await this.getCompanyDegradationStatus(companyId);
    const moduleStatus = degradationStatus.find(s => s.module === moduleName);

    if (!moduleStatus) {
      return { allowed: true };
    }

    // Check if action is restricted
    const isRestricted = this.isActionRestricted(action, moduleStatus.restrictions);

    if (isRestricted) {
      return {
        allowed: false,
        reason: `This action is not available. Module will be revoked in ${moduleStatus.daysRemaining} days.`,
        warning: `Consider upgrading your plan to continue using ${moduleName}`,
        alternatives: this.getActionAlternatives(action),
      };
    }

    // Add usage warning for degrading modules
    const warning = moduleStatus.status !== 'active' 
      ? `${moduleName} will be revoked in ${moduleStatus.daysRemaining} days. Please upgrade your plan.`
      : undefined;

    return {
      allowed: true,
      warning,
    };
  }

  /**
   * Acknowledge warning and extend grace period
   */
  async acknowledgeWarning(
    companyId: string,
    warningId: string,
    acknowledgedByUserId: string,
    extendGracePeriod?: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const updateData: Record<string, unknown> = {
        is_acknowledged: true,
        acknowledged_at: new Date().toISOString(),
        acknowledged_by_user_id: acknowledgedByUserId,
      };

      if (extendGracePeriod) {
        const { data: warning } = await this.supabase
          .from('module_warnings')
          .select('expires_at')
          .eq('id', warningId)
          .single();

        if (warning) {
          const newExpiresAt = new Date(
            new Date(warning.expires_at).getTime() + extendGracePeriod * 24 * 60 * 60 * 1000
          ).toISOString();
          updateData.expires_at = newExpiresAt;
        }
      }

      const { error } = await this.supabase
        .from('module_warnings')
        .update(updateData)
        .eq('id', warningId)
        .eq('company_id', companyId);

      if (error) throw error;

      return {
        success: true,
        message: extendGracePeriod 
          ? `Warning acknowledged and grace period extended by ${extendGracePeriod} days`
          : 'Warning acknowledged',
      };
    } catch (error) {
      console.error('Error acknowledging warning:', error);
      return {
        success: false,
        message: 'Failed to acknowledge warning',
      };
    }
  }

  /**
   * Generate data export for module before revocation
   */
  async generateDataExport(
    companyId: string,
    moduleName: ModuleName,
    exportFormat: 'json' | 'csv' = 'json'
  ): Promise<{
    success: boolean;
    exportData?: unknown;
    downloadUrl?: string;
    message: string;
  }> {
    try {
      const exportHandlers = {
        employee_management: () => this.exportEmployeeData(companyId),
        employee_schedules: () => this.exportScheduleData(companyId),
        online_payments: () => this.exportPaymentData(companyId),
        analytics: () => this.exportAnalyticsData(),
        multi_location: () => this.exportLocationData(companyId),
        api_access: () => this.exportApiData(),
      };

      const handler = exportHandlers[moduleName];
      if (!handler) {
        return {
          success: false,
          message: `No export handler available for ${moduleName}`,
        };
      }

      const exportData = await handler();

      // Record export event
      await moduleAuditTracker.recordModuleUsage(companyId, moduleName, {
        data_export_generated: true,
        export_format: exportFormat,
        export_timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        exportData,
        message: `Data export generated for ${moduleName}`,
      };
    } catch (error) {
      console.error('Error generating data export:', error);
      return {
        success: false,
        message: 'Failed to generate data export',
      };
    }
  }

  // Helper methods
  private getWarningTypeFromReason(reason: ModuleChangeReason): ModuleWarningType {
    switch (reason) {
      case 'expiration':
        return 'expiration_warning';
      case 'downgrade':
        return 'downgrade_warning';
      default:
        return 'usage_limit_warning';
    }
  }

  private generateWarningMessage(
    moduleName: ModuleName,
    reason: ModuleChangeReason,
    config: GracefulDegradationConfig
  ): string {
    const moduleNames = {
      employee_management: 'Employee Management',
      employee_schedules: 'Employee Schedules',
      online_payments: 'Online Payments',
      analytics: 'Analytics & Reporting',
      multi_location: 'Multiple Locations',
      api_access: 'API Access',
    };

    const reasonMessages = {
      subscription_change: 'subscription plan change',
      expiration: 'subscription expiration',
      downgrade: 'plan downgrade',
      admin_override: 'administrative decision',
      manual: 'manual change',
    };

    return `${moduleNames[moduleName]} will be revoked in ${config.warningPeriodDays} days due to ${reasonMessages[reason]}. Please upgrade your plan or export your data before this date.`;
  }

  private calculateModuleStatus(daysRemaining: number): DegradationStatus['status'] {
    if (daysRemaining <= 0) return 'revoked';
    if (daysRemaining <= 3) return 'restricted';
    if (daysRemaining <= 7) return 'warning';
    return 'active';
  }

  private getAvailableActions(status: DegradationStatus['status'], daysRemaining: number): string[] {
    const actions: string[] = ['export_data', 'upgrade_plan'];
    
    if (status === 'active' || status === 'warning') {
      actions.push('continue_using');
    }
    
    if (daysRemaining > 0) {
      actions.push('acknowledge_warning');
    }

    return actions;
  }

  private getDataExportOptions(moduleName: ModuleName): string[] {
    const baseOptions = ['json', 'csv'];
    
    const moduleSpecificOptions: Record<ModuleName, string[]> = {
      employee_management: [...baseOptions, 'excel'],
      employee_schedules: [...baseOptions, 'ical'],
      online_payments: [...baseOptions, 'pdf_report'],
      analytics: [...baseOptions, 'dashboard_pdf'],
      multi_location: [...baseOptions, 'kml'],
      api_access: [...baseOptions, 'api_documentation'],
    };

    return moduleSpecificOptions[moduleName] || baseOptions;
  }

  private getCurrentRestrictions(daysRemaining: number): string[] {
    if (daysRemaining <= 1) return ['view_only', 'no_new_data'];
    if (daysRemaining <= 3) return ['limited_access', 'export_only'];
    if (daysRemaining <= 7) return ['read_only_mode'];
    return [];
  }

  private isActionRestricted(action: string, restrictions: string[]): boolean {
    const restrictionMap: Record<string, string[]> = {
      read_only_mode: ['create', 'update', 'delete'],
      limited_access: ['create', 'update', 'delete', 'bulk_operations'],
      export_only: ['create', 'update', 'delete', 'view_details'],
      view_only: ['create', 'update', 'delete', 'export'],
      no_new_data: ['create', 'import'],
    };

    return restrictions.some(restriction => 
      restrictionMap[restriction]?.includes(action)
    );
  }

  private getActionAlternatives(action: string): string[] {
    // Provide alternative actions based on the restricted action
    const alternatives: Record<string, string[]> = {
      create: ['export_existing_data', 'upgrade_plan'],
      update: ['view_data', 'export_data'],
      delete: ['export_before_deletion', 'mark_for_deletion'],
      bulk_operations: ['individual_operations', 'export_and_reimport'],
    };

    return alternatives[action] || ['upgrade_plan', 'contact_support'];
  }

  // Module-specific export handlers
  private async exportEmployeeData(companyId: string) {
    const { data } = await this.supabase
      .from('employees')
      .select('*')
      .eq('company_id', companyId);
    return { employees: data };
  }

  private async exportScheduleData(companyId: string) {
    const { data } = await this.supabase
      .from('schedules')
      .select('*, employee:employees(*)')
      .eq('employees.company_id', companyId);
    return { schedules: data };
  }

  private async exportPaymentData(companyId: string) {
    const { data } = await this.supabase
      .from('appointments')
      .select('*')
      .eq('company_id', companyId)
      .neq('payment_status', 'pending');
    return { payments: data };
  }

  private async exportAnalyticsData() {
    // Generate analytics summary
    return { analytics: 'Analytics data would be exported here' };
  }

  private async exportLocationData(companyId: string) {
    const { data } = await this.supabase
      .from('companies')
      .select('*')
      .eq('id', companyId);
    return { locations: data };
  }

  private async exportApiData() {
    // Export API usage logs and configurations
    return { api_data: 'API configuration and logs would be exported here' };
  }
}

// Export singleton instance
export const gracefulDegradationManager = new GracefulDegradationManager();