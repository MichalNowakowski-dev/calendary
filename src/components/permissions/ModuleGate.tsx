"use client";

import { ReactNode } from "react";
import { useModulePermissions } from "@/lib/hooks/useModulePermissions";
import { UpgradePrompt } from "./UpgradePrompt";
import type { ModuleName } from "@/lib/types/database";

interface ModuleGateProps {
  children: ReactNode;
  requiredModule: ModuleName | ModuleName[];
  companyId?: string;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

export function ModuleGate({
  children,
  requiredModule,
  companyId,
  fallback,
  showUpgradePrompt = true,
}: ModuleGateProps) {
  const { canAccessFeature, loading, error } = useModulePermissions(companyId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
        Błąd podczas sprawdzania uprawnień: {error}
      </div>
    );
  }

  const hasAccess = canAccessFeature(requiredModule);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showUpgradePrompt) {
      const firstModule = Array.isArray(requiredModule) ? requiredModule[0] : requiredModule;
      return <UpgradePrompt requiredModule={firstModule} />;
    }

    return null;
  }

  return <>{children}</>;
}

// Higher-order component version
export function withModuleGate<T extends object>(
  Component: React.ComponentType<T>,
  requiredModule: ModuleName | ModuleName[],
  options?: {
    fallback?: ReactNode;
    showUpgradePrompt?: boolean;
  }
) {
  return function ModuleGatedComponent(props: T) {
    return (
      <ModuleGate
        requiredModule={requiredModule}
        fallback={options?.fallback}
        showUpgradePrompt={options?.showUpgradePrompt}
      >
        <Component {...props} />
      </ModuleGate>
    );
  };
}