"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Shield, RotateCcw } from "lucide-react";
import { 
  getCompanySubscription, 
  getCompanyModules, 
  toggleCompanyModule,
  removeCompanyModuleOverride 
} from "@/lib/actions/subscriptions";
import type { 
  Company,
  ModuleName,
  CompanyModule,
  CompanySubscriptionWithPlan,
  PlanModule
} from "@/lib/types/database";
import { useToast } from "@/hooks/use-toast";
import { MODULES } from "@/lib/permissions/constants";

interface PermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company;
}

interface ModulePermission {
  name: ModuleName;
  displayName: string;
  description: string;
  planDefault: boolean;
  companyOverride?: CompanyModule;
  effectiveValue: boolean;
}

export function PermissionsDialog({ open, onOpenChange, company }: PermissionsDialogProps) {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [modules, setModules] = useState<ModulePermission[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadPermissions();
    }
  }, [open, company.id]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      
      const [subscription, companyModules] = await Promise.all([
        getCompanySubscription(company.id),
        getCompanyModules(company.id),
      ]);

      const moduleDefinitions = [
        { name: MODULES.EMPLOYEE_MANAGEMENT, displayName: "Employee Management", description: "Add and manage employees" },
        { name: MODULES.EMPLOYEE_SCHEDULES, displayName: "Employee Schedules", description: "Manage employee schedules" },
        { name: MODULES.ONLINE_PAYMENTS, displayName: "Online Payments", description: "Process online payments" },
        { name: MODULES.ANALYTICS, displayName: "Analytics", description: "Advanced reporting and analytics" },
        { name: MODULES.MULTI_LOCATION, displayName: "Multiple Locations", description: "Support for multiple business locations" },
        { name: MODULES.API_ACCESS, displayName: "API Access", description: "Access to API integrations" },
      ];

      const modulePermissions: ModulePermission[] = moduleDefinitions.map(def => {
        const planModule = subscription.plan_modules?.find((pm: PlanModule) => pm.module_name === def.name);
        const companyOverride = companyModules?.find(cm => cm.module_name === def.name);
        
        const planDefault = planModule?.is_enabled || false;
        const effectiveValue = companyOverride ? companyOverride.is_enabled : planDefault;

        return {
          name: def.name,
          displayName: def.displayName,
          description: def.description,
          planDefault,
          companyOverride,
          effectiveValue,
        };
      });

      setModules(modulePermissions);
      
      // Set notes from existing overrides
      const notesMap: Record<string, string> = {};
      companyModules?.forEach(cm => {
        if (cm.notes) {
          notesMap[cm.module_name] = cm.notes;
        }
      });
      setNotes(notesMap);
      
    } catch (error) {
      console.error("Error loading permissions:", error);
      toast({
        title: "Error",
        description: "Failed to load permissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModule = async (moduleName: ModuleName, enabled: boolean) => {
    try {
      setUpdating(moduleName);
      
      const result = await toggleCompanyModule(
        company.id, 
        moduleName, 
        enabled, 
        notes[moduleName] || undefined
      );
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        await loadPermissions();
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error toggling module:", error);
      toast({
        title: "Error",
        description: "Failed to update module access",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveOverride = async (moduleName: ModuleName) => {
    try {
      setUpdating(moduleName);
      
      const result = await removeCompanyModuleOverride(company.id, moduleName);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        await loadPermissions();
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error removing override:", error);
      toast({
        title: "Error",
        description: "Failed to remove override",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Module Permissions - {company.name}</span>
          </DialogTitle>
          <DialogDescription>
            Configure which modules this company can access. Overrides apply on top of plan defaults.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 mt-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4 mt-6">
            {modules.map((module) => {
              const hasOverride = !!module.companyOverride;
              const isUpdating = updating === module.name;

              return (
                <Card key={module.name} className={hasOverride ? "border-orange-200 bg-orange-50 dark:bg-orange-950" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium">{module.displayName}</h3>
                          <Badge variant={module.planDefault ? "default" : "secondary"}>
                            Plan: {module.planDefault ? "Enabled" : "Disabled"}
                          </Badge>
                          {hasOverride && (
                            <Badge variant="outline" className="border-orange-500 text-orange-700 dark:text-orange-400">
                              Override Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {module.description}
                        </p>
                        
                        {hasOverride && module.companyOverride?.notes && (
                          <div className="mb-3">
                            <Label className="text-xs font-medium">Override Notes:</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {module.companyOverride.notes}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={module.effectiveValue}
                            onCheckedChange={(checked) => handleToggleModule(module.name, checked)}
                            disabled={isUpdating}
                          />
                          <Label className="text-sm">
                            {module.effectiveValue ? "Enabled" : "Disabled"}
                          </Label>
                        </div>
                        
                        {hasOverride && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveOverride(module.name)}
                            disabled={isUpdating}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Reset
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <Label htmlFor={`notes-${module.name}`} className="text-xs font-medium">
                        Override Notes (optional):
                      </Label>
                      <Textarea
                        id={`notes-${module.name}`}
                        placeholder="Add notes about this permission override..."
                        value={notes[module.name] || ""}
                        onChange={(e) => setNotes(prev => ({ ...prev, [module.name]: e.target.value }))}
                        className="mt-1 h-20"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}