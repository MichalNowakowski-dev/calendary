import { Check, X } from "lucide-react";
import { formatModuleName } from "@/lib/utils/planFormatters";

interface PlanModule {
  id: string;
  module_name: string;
  is_enabled: boolean;
}

interface PlanModulesProps {
  modules: PlanModule[];
}

export default function PlanModules({ modules }: PlanModulesProps) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Modules:</h4>
      <div className="space-y-1">
        {modules.map((module) => (
          <div key={module.id} className="flex items-center justify-between text-sm">
            <span className="capitalize">
              {formatModuleName(module.module_name)}
            </span>
            {module.is_enabled ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <X className="h-4 w-4 text-red-600" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}