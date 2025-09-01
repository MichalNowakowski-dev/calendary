'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CompanyPermissions, ModuleName } from '@/lib/types/database';

interface PermissionContextType {
  permissions: CompanyPermissions | null;
  loading: boolean;
  hasModule: (module: ModuleName) => boolean;
  isSubscriptionActive: () => boolean;
  getUpgradeMessage: (module: ModuleName) => string;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: React.ReactNode;
  companyId: string;
  initialPermissions?: CompanyPermissions | null;
}

export function PermissionProvider({ 
  children, 
  companyId, 
  initialPermissions 
}: PermissionProviderProps) {
  const [permissions, setPermissions] = useState<CompanyPermissions | null>(
    initialPermissions || null
  );
  const [loading, setLoading] = useState(!initialPermissions);

  const fetchPermissions = async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/permissions/${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialPermissions && companyId) {
      fetchPermissions();
    }
  }, [companyId, initialPermissions]);

  const hasModule = (module: ModuleName): boolean => {
    if (!permissions) return false;
    if (permissions.subscription.status !== 'active') return false;
    return permissions.modules[module] || false;
  };

  const isSubscriptionActive = (): boolean => {
    return permissions?.subscription.status === 'active';
  };

  const getUpgradeMessage = (module: ModuleName): string => {
    const moduleNames = {
      employee_management: 'Employee Management',
      employee_schedules: 'Employee Schedules',
      online_payments: 'Online Payments',
      analytics: 'Analytics & Reporting',
      multi_location: 'Multiple Locations',
      api_access: 'API Access',
    };

    return `${moduleNames[module]} is not available on your current plan. Upgrade to access this feature.`;
  };

  const value: PermissionContextType = {
    permissions,
    loading,
    hasModule,
    isSubscriptionActive,
    getUpgradeMessage,
    refreshPermissions: fetchPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}

// Convenience hooks for specific checks
export function useHasModule(module: ModuleName) {
  const { hasModule } = usePermissions();
  return hasModule(module);
}

export function useIsSubscriptionActive() {
  const { isSubscriptionActive } = usePermissions();
  return isSubscriptionActive();
}