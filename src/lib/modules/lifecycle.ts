import { createClient } from '@/lib/supabase/server';
import type {
  ModuleName,
  ModuleChangeReason,
  ModuleTransition,
  CompanyPermissions,
  EnhancedCompanyPermissions,
  ModuleChange,
  ModuleWarning,
  ModuleUsageTracking,
  SubscriptionStatus,
  ModuleDependency,
  ModuleDependencyGraph,
} from '@/lib/types/database';

export class ModuleLifecycleManager {
  private async getSupabaseClient() {
    return await createClient();
  }

  /**
   * Automatically manage module access when subscription changes
   */
  async handleSubscriptionChange(
    companyId: string,
    newPlanId: string,
    oldPlanId: string | null,
    reason: ModuleChangeReason = 'subscription_change',
    changedByUserId?: string
  ): Promise<{ success: boolean; transitions: ModuleTransition[]; message: string }> {
    try {
      // Get new plan modules
      const supabase = await this.getSupabaseClient();
      const { data: newPlanModules, error: newPlanError } = await supabase
        .from('plan_modules')
        .select('*')
        .eq('subscription_plan_id', newPlanId);

      if (newPlanError) throw newPlanError;

      // Get old plan modules if exists
      let oldPlanModules: { module_name: string; is_enabled: boolean }[] = [];
      if (oldPlanId) {
        const { data, error } = await supabase
          .from('plan_modules')
          .select('*')
          .eq('subscription_plan_id', oldPlanId);

        if (error) throw error;
        oldPlanModules = data || [];
      }

      // Get current company module overrides
      const { data: companyModules, error: companyModulesError } = await supabase
        .from('company_modules')
        .select('*')
        .eq('company_id', companyId);

      if (companyModulesError) throw companyModulesError;

      // Calculate transitions
      const transitions = await this.calculateModuleTransitions(
        newPlanModules || [],
        oldPlanModules,
        companyModules || [],
        reason
      );

      // Apply transitions
      const results = await Promise.all(
        transitions.map(transition =>
          this.applyModuleTransition(companyId, transition, changedByUserId)
        )
      );

      const failedTransitions = results.filter(r => !r.success);
      if (failedTransitions.length > 0) {
        return {
          success: false,
          transitions: [],
          message: `Failed to apply ${failedTransitions.length} module transitions`,
        };
      }

      return {
        success: true,
        transitions,
        message: `Successfully applied ${transitions.length} module transitions`,
      };
    } catch (error) {
      console.error('Error handling subscription change:', error);
      return {
        success: false,
        transitions: [],
        message: 'Failed to handle subscription change',
      };
    }
  }

  /**
   * Calculate what module transitions need to happen
   */
  private async calculateModuleTransitions(
    newPlanModules: { module_name: string; is_enabled: boolean }[],
    oldPlanModules: { module_name: string; is_enabled: boolean }[],
    companyOverrides: { module_name: string; is_enabled: boolean }[],
    reason: ModuleChangeReason
  ): Promise<ModuleTransition[]> {
    const transitions: ModuleTransition[] = [];
    
    // Create maps for easier lookup
    const newPlanMap = new Map(newPlanModules.map(m => [m.module_name, m.is_enabled]));
    const oldPlanMap = new Map(oldPlanModules.map(m => [m.module_name, m.is_enabled]));
    const overrideMap = new Map(companyOverrides.map(m => [m.module_name, m.is_enabled]));

    // All possible modules
    const allModules: ModuleName[] = [
      'employee_management',
      'employee_schedules', 
      'online_payments',
      'analytics',
      'multi_location',
      'api_access'
    ];

    for (const moduleName of allModules) {
      const oldStatus = oldPlanMap.get(moduleName) || false;
      const newStatus = newPlanMap.get(moduleName) || false;
      const hasOverride = overrideMap.has(moduleName);

      // If there's a company override, don't change anything automatically
      if (hasOverride) continue;

      // If status changed, create transition
      if (oldStatus !== newStatus) {
        const dependenciesAffected = await this.getDependenciesAffected(moduleName, newStatus);
        const warningsGenerated = await this.generateWarningsForTransition(moduleName, oldStatus, newStatus, reason);

        transitions.push({
          module: moduleName,
          from_status: oldStatus,
          to_status: newStatus,
          reason,
          dependencies_affected: dependenciesAffected,
          warnings_generated: warningsGenerated,
        });
      }
    }

    return transitions;
  }

  /**
   * Apply a single module transition
   */
  private async applyModuleTransition(
    companyId: string,
    transition: ModuleTransition,
    changedByUserId?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Record the change in audit trail
      await this.recordModuleChange(
        companyId,
        transition.module,
        transition.from_status ? 'revoked' : 'granted',
        transition.reason,
        transition.from_status,
        transition.to_status,
        changedByUserId
      );

      // Update usage tracking
      await this.updateUsageTracking(companyId, transition.module);

      // Create warnings if needed
      const supabase = await this.getSupabaseClient();
      for (const warning of transition.warnings_generated) {
        await supabase
          .from('module_warnings')
          .insert({
            company_id: companyId,
            module_name: warning.module_name,
            warning_type: warning.warning_type,
            warning_message: warning.warning_message,
            expires_at: warning.expires_at,
          });
      }

      return { success: true, message: 'Transition applied successfully' };
    } catch (error) {
      console.error('Error applying module transition:', error);
      return { success: false, message: 'Failed to apply transition' };
    }
  }

  /**
   * Record module change in audit trail
   */
  private async recordModuleChange(
    companyId: string,
    moduleName: ModuleName,
    action: 'granted' | 'revoked' | 'overridden',
    reason: ModuleChangeReason,
    previousStatus: boolean,
    newStatus: boolean,
    changedByUserId?: string,
    notes?: string
  ): Promise<void> {
    const supabase = await this.getSupabaseClient();
    await supabase
      .from('module_changes')
      .insert({
        company_id: companyId,
        module_name: moduleName,
        action,
        reason,
        previous_status: previousStatus,
        new_status: newStatus,
        changed_by_user_id: changedByUserId,
        notes,
      });
  }

  /**
   * Get dependencies that would be affected by module status change
   */
  private async getDependenciesAffected(module: ModuleName, newStatus: boolean): Promise<ModuleName[]> {
    if (newStatus) return []; // Enabling a module doesn't affect dependencies

    // Get modules that depend on this one
    const supabase = await this.getSupabaseClient();
    const { data: dependents, error } = await supabase
      .from('module_dependencies')
      .select('module_name, is_required')
      .eq('depends_on', module);

    if (error || !dependents) return [];

    // Return required dependencies that would be affected
    return dependents
      .filter(d => d.is_required)
      .map(d => d.module_name as ModuleName);
  }

  /**
   * Generate warnings for module transitions
   */
  private async generateWarningsForTransition(
    module: ModuleName,
    fromStatus: boolean,
    toStatus: boolean,
    reason: ModuleChangeReason
  ): Promise<ModuleWarning[]> {
    const warnings: ModuleWarning[] = [];

    if (fromStatus && !toStatus) {
      // Module being revoked
      const warningMessage = this.getModuleRevocationWarning(module, reason);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

      warnings.push({
        id: '', // Will be generated by DB
        company_id: '', // Will be set by caller
        module_name: module,
        warning_type: reason === 'expiration' ? 'expiration_warning' : 'downgrade_warning',
        warning_message: warningMessage,
        expires_at: expiresAt,
        is_acknowledged: false,
        acknowledged_at: null,
        acknowledged_by_user_id: null,
        created_at: new Date().toISOString(),
      });
    }

    return warnings;
  }

  /**
   * Get appropriate warning message for module revocation
   */
  private getModuleRevocationWarning(module: ModuleName, reason: ModuleChangeReason): string {
    const moduleNames = {
      employee_management: 'Employee Management',
      employee_schedules: 'Employee Schedules', 
      online_payments: 'Online Payments',
      analytics: 'Analytics & Reporting',
      multi_location: 'Multiple Locations',
      api_access: 'API Access',
    };

    const reasonMessages = {
      subscription_change: 'due to subscription plan change',
      expiration: 'due to subscription expiration',
      downgrade: 'due to plan downgrade',
      admin_override: 'by administrator',
      manual: 'manually',
    };

    return `${moduleNames[module]} will be disabled ${reasonMessages[reason]}. You have 7 days to upgrade or export your data.`;
  }

  /**
   * Update usage tracking for a module
   */
  private async updateUsageTracking(companyId: string, moduleName: ModuleName): Promise<void> {
    const supabase = await this.getSupabaseClient();
    const { data: existing, error: selectError } = await supabase
      .from('module_usage_tracking')
      .select('*')
      .eq('company_id', companyId)
      .eq('module_name', moduleName)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows found
      throw selectError;
    }

    if (existing) {
      // Update existing record
      await supabase
        .from('module_usage_tracking')
        .update({
          usage_count: existing.usage_count + 1,
          last_used_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      // Create new record
      await supabase
        .from('module_usage_tracking')
        .insert({
          company_id: companyId,
          module_name: moduleName,
          usage_count: 1,
          last_used_at: new Date().toISOString(),
        });
    }
  }

  /**
   * Get dependency graph for a module
   */
  async getModuleDependencyGraph(module: ModuleName): Promise<ModuleDependencyGraph> {
    // Get dependencies (what this module depends on)
    const supabase = await this.getSupabaseClient();
    const { data: dependencies, error: depsError } = await supabase
      .from('module_dependencies')
      .select('depends_on, is_required')
      .eq('module_name', module);

    if (depsError) throw depsError;

    // Get dependents (what depends on this module)
    const { data: dependents, error: depsentsError } = await supabase
      .from('module_dependencies')
      .select('module_name, is_required')
      .eq('depends_on', module);

    if (depsentsError) throw depsentsError;

    return {
      module,
      dependencies: (dependencies || []).map(d => ({
        module: d.depends_on as ModuleName,
        required: d.is_required,
      })),
      dependents: (dependents || []).map(d => ({
        module: d.module_name as ModuleName,
        required: d.is_required,
      })),
    };
  }

  /**
   * Validate module dependencies before making changes
   */
  async validateModuleDependencies(
    companyId: string,
    module: ModuleName,
    newStatus: boolean
  ): Promise<{ valid: boolean; conflicts: string[]; warnings: string[] }> {
    const conflicts: string[] = [];
    const warnings: string[] = [];

    if (!newStatus) {
      // Disabling module - check what depends on it
      const dependencyGraph = await this.getModuleDependencyGraph(module);
      
      // Get current permissions to see what's currently enabled
      const supabase = await this.getSupabaseClient();
      const { data: companyModules } = await supabase
        .from('company_modules')
        .select('*')
        .eq('company_id', companyId);

      const enabledModules = new Set(
        (companyModules || [])
          .filter(m => m.is_enabled)
          .map(m => m.module_name)
      );

      for (const dependent of dependencyGraph.dependents) {
        if (dependent.required && enabledModules.has(dependent.module)) {
          conflicts.push(
            `Cannot disable ${module} because ${dependent.module} requires it`
          );
        }
      }
    } else {
      // Enabling module - check its dependencies
      const dependencyGraph = await this.getModuleDependencyGraph(module);
      
      for (const dependency of dependencyGraph.dependencies) {
        if (dependency.required) {
          // Check if required dependency is enabled
          const supabase = await this.getSupabaseClient();
          const { data: depModule } = await supabase
            .from('company_modules')
            .select('is_enabled')
            .eq('company_id', companyId)
            .eq('module_name', dependency.module)
            .single();

          if (!depModule?.is_enabled) {
            warnings.push(
              `${module} requires ${dependency.module} to function properly`
            );
          }
        }
      }
    }

    return {
      valid: conflicts.length === 0,
      conflicts,
      warnings,
    };
  }
}

// Export singleton instance
export const moduleLifecycleManager = new ModuleLifecycleManager();