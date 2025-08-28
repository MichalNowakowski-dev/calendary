"use client";

import { useState } from "react";
import { MoreHorizontal, CreditCard, Shield, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubscriptionDialog } from "./SubscriptionDialog";
import { PermissionsDialog } from "./PermissionsDialog";
import type { Company, CompanySubscription, SubscriptionPlan } from "@/lib/types/database";

interface CompanyWithSubscriptionData extends Company {
  company_subscriptions?: Array<CompanySubscription & {
    subscription_plan: SubscriptionPlan;
  }>;
}

interface CompanyActionsDropdownProps {
  company: CompanyWithSubscriptionData;
}

export function CompanyActionsDropdown({ company }: CompanyActionsDropdownProps) {
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => {}}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSubscriptionDialogOpen(true)}>
            <CreditCard className="mr-2 h-4 w-4" />
            Manage Subscription
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPermissionsDialogOpen(true)}>
            <Shield className="mr-2 h-4 w-4" />
            Manage Permissions
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SubscriptionDialog
        open={subscriptionDialogOpen}
        onOpenChange={setSubscriptionDialogOpen}
        company={company}
      />

      <PermissionsDialog
        open={permissionsDialogOpen}
        onOpenChange={setPermissionsDialogOpen}
        company={company}
      />
    </>
  );
}