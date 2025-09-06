"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { PLAN_FEATURES, getUpgradeTargetForModule } from "@/lib/utils/module-gating";
import type { ModuleName } from "@/lib/types/database";

interface UpgradePromptProps {
  requiredModule: ModuleName;
  size?: "sm" | "md" | "lg";
  variant?: "card" | "banner" | "modal";
}

export function UpgradePrompt({ 
  requiredModule, 
  size = "md",
  variant = "card" 
}: UpgradePromptProps) {
  const feature = PLAN_FEATURES[requiredModule];
  const targetPlan = getUpgradeTargetForModule(requiredModule);

  const sizes = {
    sm: "p-4",
    md: "p-6", 
    lg: "p-8"
  };

  if (variant === "banner") {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
              <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                {feature.name}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Dostępne w planie {targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)}
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/company_owner/subscription">
              Uaktualnij <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={`text-center ${sizes[size]} border-dashed border-2 border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50`}>
      <CardHeader className="pb-4">
        <div className="mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-full w-fit mb-4">
          <Lock className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {feature.name}
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          {feature.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
            <Sparkles className="mr-1 h-3 w-3" />
            Dostępne w planie {targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Link href="/company_owner/subscription">
              Uaktualnij plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/company_owner/subscription">
              Zobacz wszystkie plany
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for navigation items
export function NavUpgradePrompt({ requiredModule }: { requiredModule: ModuleName }) {
  const feature = PLAN_FEATURES[requiredModule];
  const targetPlan = getUpgradeTargetForModule(requiredModule);

  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mx-2 my-1">
      <div className="flex items-center space-x-2">
        <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <div className="text-sm">
          <p className="font-medium text-blue-900 dark:text-blue-100 leading-tight">
            {feature.name}
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Plan {targetPlan}
          </p>
        </div>
      </div>
      <Button asChild size="sm" variant="outline" className="h-7 px-2 text-xs border-blue-300 text-blue-700 hover:bg-blue-100">
        <Link href="/company_owner/subscription">
          Uaktualnij
        </Link>
      </Button>
    </div>
  );
}